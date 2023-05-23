from browser import document, console, html, timer
from browser.widgets.dialog import InfoDialog

class PatternError(Exception):

    def __init__(self, message):
        super().__init__(message)
        InfoDialog('Pattern error', message)


class NoteStyle:

    checked = '#666'
    unchecked = '#ddd'


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

    def check(self):
        self.style.backgroundColor = NoteStyle.checked

    def uncheck(self):
        self.style.backgroundColor = NoteStyle.unchecked


def checked(elt):
    return elt.style.backgroundColor != NoteStyle.unchecked

seq = []

class Tab(html.TD):

    def __init__(self, score, num):
        super().__init__()
        self.num = num + 1
        self.score = score
        self.bind('click', score.select_tab)
        self.row = html.TR(html.TD(self.num))
        self <= html.TABLE(self.row, width="100%",
            cellpadding=0, cellspacing=0)
        self.close_button = html.TD('x', Class="close_tab")
        self.close_button.bind('click', self.close)
        self.add_close_button()

    def add_close_button(self):
        if self.num > 1:
            self.row <= self.close_button

    def remove_close_button(self):
        if self.num > 1:
            self.close_button.remove()

    def select(self):
        index = self.num - 1
        bar = self.score.bars[index]
        if self.score.selected_tab is not None:
            self.score.selected_tab.unselect()
        self.score.bar_cell <= self.score.bars[index]
        self.score.selected_tab = self
        self.className = 'selected_tab'

    def unselect(self):
        bar = self.score.bars[self.num - 1]
        self.score.bar_cell.clear()
        self.className = 'unselected_tab'

    def close(self, ev):
        ev.stopPropagation()
        self.score.tabs[-2].add_close_button()
        self.score.tabs[-2].select()
        del self.score.tabs[-1]
        del self.score.bars[-1]
        self.remove()

class Score(html.TABLE):

    def __init__(self, instruments):
        super().__init__(cellpadding=0, cellspacing=0, Class='score')

        self.instruments = instruments

        self.plus_tab = html.TD('+', Class='plus unselected_tab')
        self.tabs = []
        self.plus_tab.bind('click', self.new_tab)

        tabs = html.TD()
        self.tabs_row = html.TR(self.tabs)
        tabs <= html.TABLE(self.tabs_row, width="100%", Class="tabs")
        self.tabs_row <= self.plus_tab
        self <= html.TR(tabs)
        self.selected_tab = None

        self.bar_cell = html.TD()
        self <= html.TR(self.bar_cell)

        self.bars = []

        self.patterns = html.TEXTAREA("1", cols=50)
        self <= html.TR(html.TD(self.patterns))

    def new_tab(self, ev=None, notes=None):
        tab = Tab(self, len(self.tabs))
        self.tabs_row.insertBefore(tab, self.plus_tab)
        if len(self.tabs) > 0:
            self.tabs[-1].remove_close_button()
        self.tabs.append(tab)
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
        patterns = []
        for pattern in self.patterns.value.split():
            repeat = pattern.split('x')
            if len(repeat) == 2:
                patterns += [int(repeat[0]) - 1] * int(repeat[1])
            elif len(repeat) > 2:
                raise PatternError(f'invalid pattern: {pattern}')
            else:
                patterns.append(int(pattern) - 1)
        #patterns = [int(x.strip()) - 1 for x in self.patterns.value.split()]
        nb_bars = len(patterns)
        # there are bpm quarter notes per minute
        # each quarter note lasts 60/bpm second
        # a bar has 4 quarter notes, so a bar lasts 240/bpm seconds
        # dt is the interval between 16th notes (1/4 of a quarter)
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

