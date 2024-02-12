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
        self.row <= self.close_button

    def remove_close_button(self):
        self.close_button.remove()

    def select(self):
        if self.score.selected_tab is not None:
            self.score.selected_tab.unselect()
        index = self.score.tabs.index(self)
        self.score.bar_cell <= self.score.bars[index]
        self.score.selected_tab = self
        self.className = 'selected_tab'
        self.add_close_button()

    def unselect(self):
        self.score.bar_cell.clear()
        self.className = 'unselected_tab'

    def close(self, ev):
        ev.stopPropagation()
        self.score.remove_tab(self)


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
        console.log('tab', tab)

    def get_tab(self, tab_num):
        for tab in self.tabs:
            if tab.num == tab_num:
                return tab

    def show_pattern(self, pattern_num):
        for tab in self.tabs:
            if tab.num == pattern_num:
                selected = tab
                if selected is self.selected_tab:
                    return
                selected.select()

    def flash(self, cell):
        cell.style.backgroundColor = 'black'
        timer.set_timeout(lambda: cell.check(), 100)

    def select_tab(self, ev):
        tab = ev.target.parentNode.closest('TD')
        while not hasattr(tab, 'num'):
            tab = tab.parentNode.closest('TD')
        self.show_pattern(tab.num)

    def remove_tab(self, tab):
        ix = self.tabs.index(tab)
        if len(self.tabs) > 1:
            next_tab = self.tabs[ix + 1] if ix < len(self.tabs) - 1 \
                       else self.tabs[ix - 1]
        self.tabs.remove(tab)
        del self.bars[ix]
        tab.remove()
        if self.tabs:
            self.show_pattern(next_tab.num)

    def get_seq(self, pattern_num=None):
        seq = []
        patterns = []
        if pattern_num is None:
            for pattern in self.patterns.value.split():
                repeat = pattern.split('x')
                if len(repeat) == 2:
                    patterns += [int(repeat[0])] * int(repeat[1])
                elif len(repeat) > 2:
                    raise PatternError(f'invalid pattern: {pattern}')
                else:
                    patterns.append(int(pattern))
        else:
            patterns = [pattern_num + 1]
        nb_bars = len(patterns)
        # there are bpm quarter notes per minute
        # each quarter note lasts 60/bpm second
        # a bar has 4 quarter notes, so a bar lasts 240/bpm seconds
        # dt is the interval between 16th notes (1/4 of a quarter)
        dt = 15 / self.bpm
        t0 = 0
        for pattern in patterns:
            tab = self.get_tab(pattern)
            bar = self.bars[self.tabs.index(tab)]
            notes = bar.notes
            for line_num, instrument in enumerate(notes):
                for pos in notes[instrument]:
                    cell = bar.lines[line_num].children[pos + 1]
                    seq.append((line_num, t0 + pos * dt, pattern, cell))
            t0 += 240 / self.bpm
        seq.sort(key=lambda x: x[1])
        return seq, nb_bars


class Bar(html.TABLE):

    def __init__(self, score, notes=None):
        super().__init__()
        self.score = score
        if notes is None:
            notes = {}
        play_button = html.BUTTON('&#x23f5;')
        if hasattr(self.score, 'play_pattern'):
            play_button.bind('click', self.score.play_pattern)
        top = html.TR(html.TD(play_button, colspan=2))
        top <= [NoteCell(x) for x in '1   2   3   4   ']
        self <= top
        self.lines = []
        self.notes = {}
        for instrument in score.instruments:
            self.notes[instrument] = notes.get(instrument.__name__, [])
            volume_control = html.INPUT(type="range", min=0, max=100, step=1,
                                        style="width:80px")
            instrument.volume_control = volume_control
            line = html.TR(html.TD(volume_control) +
                           html.TD(instrument.__name__))
            for pos in range(16):
                note = Note(self, instrument)
                line <= note
                if pos in self.notes[instrument]:
                    note.check()
            self.lines.append(line)

        self <= self.lines
        score.bar_cell <= self

