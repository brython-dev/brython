from browser import console, document, html, window

style_sheet = """
:root {
    --tkinter-font-family: Arial;
    --tkinter-font-size: 100%;
    --tkinter-bgcolor: #f0f0f0;
    --tkinter-border-color: #000;
    --tkinter-title-bgcolor: #fff;
    --tkinter-title-color: #000;
    --tkinter-close-bgcolor: #fff;
    --tkinter-close-color: #000;
}

.tkinter-main {
    font-family: var(--tkinter-font-family);
    font-size: var(--tkinter-font-size);
    background-color: var(--tkinter-bgcolor);
    left: 10px;
    top: 10px;
    border-style: solid;
    border-color: var(--tkinter-border-color);
    border-width: 1px;
    z-index: 10;
    resize: both;
    overflow: auto;
}

.tkinter-title {
    background-color: var(--tkinter-title-bgcolor);
    color: var(--tkinter-title-color);
    border-style: solid;
    border-color: var(--tkinter-border-color);
    border-width: 0px 0px 1px 0px;
    padding: 0.4em;
    cursor: default;
}

.tkinter-close {
    float: right;
    background-color: var(--tkinter-close-bgcolor);
    color: var(--tkinter-close-color);
    cursor: default;
    padding: 0.1em;
}

.tkinter-panel {
    padding: 0.6em;
    background-color: #f0f0f0;
}

.tkinter-message {
    padding-right: 0.6em;
}

.tkinter-button {
    margin: 0.5em;
}
"""


class Tk:
    """Basic, moveable dialog box with a title bar, optional
    "Ok" / "Cancel" buttons.
    The "Ok" button is the attribute "ok_button" of the dialog object.
    Supports drag and drop on the document.
    A dialog has an attribute "panel" that can contain elements.
    Method close() removes the dialog box.
    """

    def __init__(self, *, top=None, left=None, default_css=True):
        if default_css:
            for stylesheet in document.styleSheets:
                if stylesheet.ownerNode.id == "tkinter":
                    break
            else:
                document <= html.STYLE(style_sheet, id="tkinter")

        self.widget = html.DIV(style='position:absolute;visibility:hidden',
            Class="tkinter-main")
        self.title_text = html.SPAN()
        self.title_text.html = '&nbsp;'
        self.title_bar = html.DIV(self.title_text, Class="tkinter-title")
        self.widget <= self.title_bar
        self.close_button = html.SPAN("&times;", Class="tkinter-close")
        self.title_bar <= self.close_button
        self.close_button.bind("click", self.close)
        self.panel = html.DIV(Class="tkinter-panel")
        self.table = html.TABLE(border=1, id='tk table')
        self.panel <= self.table
        self.widget <= self.panel

        document <= self.widget
        cstyle = window.getComputedStyle(self.widget)

        # Center horizontally and vertically
        if left is None:
            left = int(0.1 * window.innerWidth)
        self.widget.left = left
        self.widget.style.left = f'{left}px'
        if top is None:
            top = int(0.1 * window.innerHeight)
        # top is relative to document scrollTop
        top += document.scrollingElement.scrollTop
        self.widget.top = top
        self.widget.style.top = f'{top}px'

        self.title_bar.bind("mousedown", self.grab_widget)
        self.widget.bind("leave", self.mouseup)
        self.state = None

    def close(self, *args):
        self.widget.remove()

    def grab_widget(self, event):
        document.bind("mousemove", self.move_widget)
        document.bind("mouseup", self.stop_moving_widget)
        self.initial = [self.widget.left - event.x,
                        self.widget.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def move_widget(self, event):
        # set new moving element coordinates
        self.widget.left = self.initial[0] + event.x
        self.widget.top = self.initial[1] + event.y

    def stop_moving_widget(self, event):
        document.unbind('mousemove')
        document.unbind('mouseup')
        self.state = None

    def mouseup(self, event):
        self.state = None
        document.unbind("mousemove")
        document.unbind("touchmove")

    def mainloop(self):
        self.widget.style.visibility = "visible"

    def title(self, title):
        self.title_text.text = title

def config(widget, **kw):
    if (text := kw.get('text')) is not None:
        widget.text = text
    if (width := kw.get('width')) is not None:
        widget.style.width = f'{width}em'
    if (height := kw.get('height')) is not None:
        if widget.tagName == 'SELECT':
            widget.attrs['size'] = height
        else:
            widget.style.height = f'{height}em'
    if (bg := kw.get('bg')) is not None:
        widget.style.backgroundColor = bg
    if (fg := kw.get('fg')) is not None:
        widget.style.color = fg
    if (bd := kw.get('bd')) is not None:
        widget.style.borderWidth = bd
        widget.style.borderStyle = 'solid'
        widget.style.borderColor = '#ddd'
    if(font := kw.get('font')) is not None:
        for key, value in font.css.items():
            setattr(widget.style, key, value)
    if (command := kw.get('command')) is not None:
        widget.bind('click', lambda ev: command())
    if (state := kw.get('state')) is not None:
        if state is DISABLED:
            widget.attrs['disabled'] = True
        elif state is NORMAL:
            widget.attrs['disabled'] = False
    if widget.tagName == 'SELECT':
        if selectmode := kw.get('selectmode') is not None:
            widget.attrs['multiple'] = selectmode is MULTIPLE

class Constant:

    def __init__(self, value):
        self.value = value


E = Constant('E')
W = Constant('W')
N = Constant('N')
S = Constant('S')
NW = Constant('NW')
NE = Constant('NE')
SW = Constant('SW')
SE = Constant('SE')

def grid(master, column=0, columnspan=1, row=None, rowspan=1,
        in_=None, ipadx=None, ipady=None,
        sticky=''):
    if not hasattr(master, 'table'):
        master.table = html.TABLE()
        master.widget <= master.table
    if not hasattr(master, 'cells'):
        master.cells = set()
    # The cell at (row, column) in grid must be inserted in table row #row
    # master.cells is a set of (row, column) that are already used because
    # a cell with colspan or rowspan is used

    if row is None:
        # default is the first empty row
        row = len(master.table.rows)

    nb_rows = len(master.table.rows)
    for i in range(row - nb_rows + 1):
        master.table <= html.TR()

    tr = master.table.rows[row]
    # number of TD in table row
    nb_cols = len(tr.cells)
    # cells in row occupied because of rowspan / colspan
    cols_from_span = [c for (r, c) in master.cells
        if r == row and c < column]

    cols_to_add = nb_cols + len(cols_from_span)
    for i in range(column - cols_to_add + 1):
        tr <= html.TD()

    td = tr.cells[column - len(cols_from_span)]

    # update cells
    for i in range(1, rowspan):
        for j in range(columnspan):
            master.cells.add((row + i, column + j))
    for i in range(rowspan):
        for j in range(1, columnspan):
            master.cells.add((row + i, column + j))

    if columnspan > 1:
        td.attrs['colspan'] = columnspan
    if rowspan > 1:
        td.attrs['rowspan'] = rowspan

    if isinstance(sticky, Constant):
        sticky = list(sticky.value)
    else:
        sticky = list(sticky)
    if 'W' in sticky:
        td.style.textAlign = 'left'
    if 'E' in sticky:
        td.style.textAlign = 'right'
    if 'N' in sticky:
        td.style.verticalAlign = 'top'
    if 'S' in sticky:
        td.style.verticalAlign = 'bottom'
    return td


NORMAL = Constant('NORMAL')
ACTIVE = Constant('ACTIVE')
DISABLED = Constant('DISABLED')

class IntVar:

    def get(self):
        return self.value

    def set(self, value):
        self.value = value

class Button:

    def __init__(self, master, text='', **kw):
        self.master = master
        self.kw = kw
        self.widget = html.BUTTON(text)
        config(self.widget, **kw)

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        td <= self.widget

class Entry:

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.widget = html.INPUT()

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td <= self.widget

class Frame:

    count = 0

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.widget = html.DIV()
        self._count = Frame.count
        Frame.count += 1

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td <= self.widget

class Label:

    def __init__(self, master, *, text='', **kw):
        self.master = master
        self.text = text
        self.kw = kw
        self.widget = html.SPAN(text,style='white-space:pre;')

    def config(self, **kw):
        config(self.widget, **kw)

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td <= self.widget


# don't define ACTIVE, it's already in State
END = Constant('END')

SINGLE = Constant('SINGLE')
BROWSE = Constant('BROWSE')
MULTIPLE = Constant('MULTIPLE')
EXTENDED = Constant('EXTENDED')

class Listbox:

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.widget = html.SELECT()

    def delete(self, position):
        if position is END:
            position = len(self.widget.options) - 1
        elif position is ACTIVE:
            position = self.widget.selectedIndex
        self.widget.remove(position)

    def insert(self, position, *options):
        if position is END:
            for option in options:
                self.widget <= html.OPTION(option)
            return
        elif position is ACTIVE:
            position = self.widget.selectedIndex
        for option in options.reverse():
            self.widget.add(html.OPTION(option), position)

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(self.widget, **self.kw)
        td <= self.widget

    def size(self):
        return len(self.widget.options)

class Radiobutton:

    def __init__(self, master, text='', value=None, variable=None,
            **kw):
        self.master = master
        self.kw = kw
        self.radio = html.INPUT(type='radio', value=value, name='x')
        if variable:
            self.radio.bind('click', lambda ev: variable.set(ev.target.value))
        self.widget = html.DIV(self.radio + html.SPAN(text))

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(self.widget, **self.kw)
        td <= self.widget