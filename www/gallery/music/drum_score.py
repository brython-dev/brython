from browser import document, console, html, timer

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
    return elt.style.backgroundColor != NoteStyle.unchecked

def uncheck(elt):
    elt.style.backgroundColor = NoteStyle.unchecked

def check(elt):
    elt.style.backgroundColor = NoteStyle.checked

seq = []

class Tab(html.TD):

    def __init__(self, score, num):
        super().__init__('&nbsp;' * (num <= 9) + str(num))
        self.num = num
        self.score = score
        self.bind('click', score.select_tab)

    def select(self):
        index = int(self.text) - 1
        bar = self.score.bars[index]
        if self.score.selected_tab is not None:
            self.score.selected_tab.unselect()
        self.score.bar_cell <= self.score.bars[index]
        self.score.selected_tab = self
        self.className = 'selected_tab'

    def unselect(self):
        bar = self.score.bars[int(self.text) - 1]
        self.score.bar_cell.clear()
        self.className = 'unselected_tab'

class Score(html.TABLE):

    def __init__(self, instruments):
        super().__init__(cellpadding=5, cellspacing=3, Class='score')

        self.instruments = instruments

        self.tabs = [Tab(self, 1)]
        new_tab = html.TD('+', Class='unselected_tab')
        self.tabs.append(new_tab)
        new_tab.bind('click', self.new_tab)

        tabs = html.TD()
        tabs <= html.TABLE(html.TR(self.tabs), width="100%", Class="tabs")
        self <= html.TR(tabs)
        self.selected_tab = None

        self.bar_cell = html.TD()
        self <= html.TR(self.bar_cell)

        self.bars = [Bar(self)]
        self.tabs[0].select()

        self.patterns = html.TEXTAREA("1", cols=50)
        self <= html.TR(html.TD(self.patterns))


    def new_tab(self, ev):
        tab = Tab(self, len(self.tabs))
        self.tabs[0].closest('TR').insertBefore(tab, self.tabs[-1])
        self.tabs.insert(len(self.tabs) - 1, tab)
        self.bars.append(Bar(self))
        self.selected_tab.unselect()
        tab.select()
        self.selected_tab = tab

    def show_pattern(self, pattern_num):
        selected = self.tabs[pattern_num]
        if selected is self.selected_tab:
            return
        selected.select()

    def flash(self, cell):
        cell.style.backgroundColor = 'black'
        timer.set_timeout(lambda: check(cell), 100)

    def select_tab(self, ev):
        self.show_pattern(int(ev.target.text) - 1)

    def get_seq(self, bpm):
        seq = []
        patterns = [int(x.strip()) - 1 for x in self.patterns.value.split()]
        nb_bars = len(patterns)
        # a bar has 4 quarter notes, there are bpm quarter notes per minute
        # each quarter note lasts 60 / bpm second
        # a bar lasts 240 / bpm seconds
        # dt is the interval between 16th notes
        dt = 15 / bpm
        t0 = 0
        for pattern in patterns:
            for line_num, (line, instrument) in \
                    enumerate(zip(self.bars[pattern].lines, self.instruments)):
                for i, cell in enumerate(line.select('TD')):
                    if i > 0 and checked(cell):
                        seq.append((line_num, t0 + (i + 1) * dt, pattern, cell))
            t0 += 240 / bpm
        seq.sort(key=lambda x: x[1])
        return seq, nb_bars

class Bar(html.TABLE):

    def __init__(self, score):
        super().__init__()
        self.score = score
        top = html.TR(html.TD('&nbsp;'))
        top <= [NoteCell(x) for x in '1   2   3   4   ']
        self <= top
        self.lines = []
        for instrument in score.instruments:
            line = html.TR(html.TD(instrument.__name__))
            for _ in range(16):
                line <= Note()
            self.lines.append(line)
            for note in line.select('TD'):
                note.bind('click', lambda ev, instrument=instrument:
                        self.click(ev, instrument))
        self <= self.lines
        score.bar_cell <= self

    def click(self, ev, instrument):
        note = ev.target
        if checked(note):
            uncheck(note)
        else:
            instrument().trigger()
            check(note) if checked(note) else check(note)

