from browser import document, console, html

class NoteStyle:

    checked = 'red'
    unchecked = 'white'

class NoteCell(html.TD):

    def __init__(self, text="&nbsp"):
        super().__init__(text, Class="note")

class Note(NoteCell):

    def __init__(self, text="&nbsp"):
        super().__init__(text)
        uncheck(self)


def checked(elt):
    return elt.style.backgroundColor == NoteStyle.checked

def uncheck(elt):
    elt.style.backgroundColor = NoteStyle.unchecked

def check(elt):
    elt.style.backgroundColor = NoteStyle.checked

seq = []

class Tab(html.TD):

    def __init__(self, num):
        super().__init__('&nbsp;' * (num <= 9) + str(num))
        self.num = num

    def select(self):
        self.style.backgroundColor = 'blue'

    def unselect(self):
        self.style.backgroundColor = 'inherit'

class Score(html.TABLE):

    def __init__(self, instruments):
        super().__init__(cellpadding=5, cellspacing=3, Class='score')
        self.tabs = [Tab(i + 1) for i in range(16)]
        for tab in self.tabs:
            tab.bind('click', self.select_tab)

        tabs = html.TD(colspan=17)
        tabs <= html.TABLE(html.TR(self.tabs), width="100%")
        self <= html.TR(tabs)
        self.tabs[0].select()
        self.selected_tab = self.tabs[0]
        self.instruments = instruments
        self.lines = []
        self <= (top := html.TR(html.TD('&nbsp;')))
        top <= [NoteCell(x) for x in '1   2   3   4   ']
        for instrument in instruments:
            line = html.TR(html.TD(instrument.__name__))
            for _ in range(16):
                line <= Note()
            self <= line
            self.lines.append(line)
            for note in line.select('TD'):
                note.bind('click', lambda ev, instrument=instrument:
                        self.click(ev, instrument))

    def select_tab(self, ev):
        selected = self.tabs[int(ev.target.text) - 1]
        if selected is self.selected_tab:
            return
        self.selected_tab.unselect()
        selected.select()
        self.selected_tab = selected

    def click(self, ev, instrument):
        note = ev.target
        if checked(note):
            uncheck(note)
        else:
            instrument().trigger()
            check(note)

    def get_seq(self, bpm):
        seq = []
        dt = 30 / bpm
        for line, instrument in zip(self.lines, self.instruments):
            for i, cell in enumerate(line.select('TD')):
                if checked(cell):
                    seq.append((instrument, (i + 1) * dt))
        seq.sort(key=lambda x: x[1])
        return seq