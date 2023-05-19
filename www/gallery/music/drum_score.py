from browser import document, console, html, timer

class NoteStyle:

    checked = 'red'
    unchecked = 'white'

class NoteCell(html.TD):

    def __init__(self, text=""):
        super().__init__(text, Class="note")

class Note(NoteCell):

    def __init__(self, bar, instrument):
        super().__init__()
        self.instrument = instrument
        self.bar = bar
        self.bind('click', self.click)
        self.uncheck()

    def click(self, ev):
        print('click, instr', self.instrument)
        index = self.closest('TR').children.index(self) - 1
        notes = self.bar.notes[self.instrument]
        if index in notes:
            notes.remove(index)
            self.uncheck()
        else:
            notes.append(index)
            notes.sort()
            self.check()
            self.instrument().trigger()
        print(self.bar.notes)

    def check(self):
        self.style.backgroundColor = NoteStyle.checked

    def uncheck(self):
        self.style.backgroundColor = NoteStyle.unchecked


def checked(elt):
    return elt.style.backgroundColor != NoteStyle.unchecked



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
        super().__init__(cellpadding=0, cellspacing=0, Class='score')

        self.instruments = instruments

        new_tab = html.TD('+', Class='unselected_tab')
        self.tabs = [new_tab]
        new_tab.bind('click', self.new_tab)

        tabs = html.TD()
        self.tabs_row = html.TR(self.tabs)
        tabs <= html.TABLE(self.tabs_row, width="100%", Class="tabs")
        self <= html.TR(tabs)
        self.selected_tab = None

        self.bar_cell = html.TD()
        self <= html.TR(self.bar_cell)

        self.bars = []

        self.patterns = html.TEXTAREA("1", cols=50)
        self <= html.TR(html.TD(self.patterns))

    def new_tab(self, ev=None, notes=None):
        tab = Tab(self, len(self.tabs))
        self.tabs[0].closest('TR').insertBefore(tab, self.tabs[-1])
        self.tabs.insert(len(self.tabs) - 1, tab)
        self.bars.append(Bar(self, notes))
        if self.selected_tab is not None:
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
        timer.set_timeout(lambda: cell.check(), 100)

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
            bar = self.bars[pattern]
            notes = bar.notes
            for line_num, instrument in enumerate(notes):
                for pos in notes[instrument]:
                    cell = bar.lines[line_num].children[pos + 1]
                    seq.append((line_num, t0 + pos * dt, pattern, cell))
            t0 += 240 / bpm
        seq.sort(key=lambda x: x[1])
        return seq, nb_bars

class Bar(html.TABLE):

    def __init__(self, score, notes=None):
        super().__init__()
        self.score = score
        if notes is None:
            notes = {}
        top = html.TR(html.TD('&nbsp;'))
        top <= [NoteCell(x) for x in '1   2   3   4   ']
        self <= top
        self.lines = []
        self.notes = {}
        for instrument in score.instruments:
            self.notes[instrument] = notes.get(instrument.__name__, [])
            line = html.TR(html.TD(instrument.__name__))
            for pos in range(16):
                note = Note(self, instrument)
                line <= note
                if pos in self.notes[instrument]:
                    note.check()
            self.lines.append(line)

        self <= self.lines
        score.bar_cell <= self

