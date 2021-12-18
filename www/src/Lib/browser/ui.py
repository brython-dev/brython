from . import html, window, console, document
from .widgets import dialog, menu

def grid(master, column=0, columnspan=1, row=None, rowspan=1,
        in_=None, ipadx=None, ipady=None,
        sticky=''):
    if not hasattr(master, 'table'):
        master.table = html.TABLE(cellpadding=0, cellspacing=0,
            style='width:100%;height:100%;')
        master <= master.table

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

    if 'W' in sticky:
        td.style.textAlign = 'left'
    if 'E' in sticky:
        td.style.textAlign = 'right'
    if 'N' in sticky:
        td.style.verticalAlign = 'top'
    if 'S' in sticky:
        td.style.verticalAlign = 'bottom'
    if sticky == 'center':
        td.style.textAlign = 'center'
    return td


class Border:

    def __init__(self, width=1, style='solid', color='#000'):
        self.width = width
        self.style = style
        self.color = color


class Font:

    def __init__(self, family='Arial', size=None, weight='normal',
                 style='normal'):
        self.family = family
        self.size = size
        self.weight = weight
        self.style = style


class Padding:

    def __init__(self, *args):
        if len(args) == 0:
            self.values = [0] * 4
        elif len(args) == 1:
            self.values = [args[0]] * 4
        elif len(args) == 2:
            self.values = [args[0], args[1]] * 2
        elif len(args) == 3:
            self.values = args + [0]
        elif len(args) == 4:
            self.values = args
        else:
            raise ValueError('Padding expects at most 4 arguments, got ' +
                f'{len(args)}')



class Widget:

    def apply_default_style(self):
        if hasattr(self, 'default_style'):
            for key, value in self.default_style.items():
                self.style[key] = value

    def grid(self, **options):
        master = self.master.panel if isinstance(self.master, Box) else self.master
        td = grid(master, **options)
        td <= self
        if isinstance(self, Text):
            self.dw = self.parentNode.offsetWidth - self.offsetWidth
            self.dh = self.parentNode.offsetHeight - self.offsetHeight
            self.style.width = f'{self.parentNode.width - self.dw}px'
            self.style.height = f'{self.parentNode.height - self.dh}px'

    def config(self, **kw):
        if (text := kw.pop('text', None)):
            self.text = text

        if (width := kw.pop('width', None)):
            self.style.width = f"{width}em"
        if (height := kw.pop('height', None)):
            self.style.height = f"{height}em"

        if (command := kw.pop('command', None)):
            self.bind('click', lambda ev: command())

        if (font := kw.pop('font', None)):
            self.style.fontFamily = font.family
            self.style.fontWeight = font.weight
            self.style.fontStyle = font.style
            if font.size:
                self.style.fontSize = f'{font.size}px'

        if (background := kw.pop('background', None)):
            self.style.backgroundColor = background
        if (color := kw.pop('color', None)):
            self.style.color = color

        if (border := kw.pop('border', None)):
            self.style.borderStyle = border.style
            self.style.borderWidth = f'{border.width}px'
            self.style.borderColor = border.color

        if (padding := kw.pop('padding', None)):
            self.style.paddingTop = f'{padding.values[0]}px'
            self.style.paddingRight = f'{padding.values[1]}px'
            self.style.paddingBottom = f'{padding.values[2]}px'
            self.style.paddingLeft = f'{padding.values[3]}px'


class Box(html.DIV, Widget):

    def __init__(self, title="", *, top=None, left=None):
        html.DIV.__init__(self, style="position:absolute")
        self.config(border=Border(width=1))

        self.title_bar = TitleBar(self, title)
        self.title_bar.config(background='CadetBlue', padding=Padding(5))
        self <= self.title_bar

        self.panel = html.DIV(Class="brython-dialog-panel")
        self <= self.panel

        document <= self
        cstyle = window.getComputedStyle(self)

        # Center horizontally and vertically
        if left is None:
            width = round(float(cstyle.width[:-2]) + 0.5)
            left = int((window.innerWidth - width) / 2)
        self.left = left
        self.style.left = f'{left}px'
        if top is None:
            height = round(float(cstyle.height[:-2]) + 0.5)
            top = int((window.innerHeight - height) / 2)
        # top is relative to document scrollTop
        top += document.scrollingElement.scrollTop
        self.top = top
        self.style.top = f'{top}px'
        
        self.title_bar.bind("mousedown", self.mousedown)
        self.title_bar.bind("touchstart", self.mousedown)
        self.title_bar.bind("mouseup", self.mouseup)
        self.title_bar.bind("touchend", self.mouseup)
        self.bind("leave", self.mouseup)
        self.is_moving = False

    def close(self, *args):
        self.remove()

    def mousedown(self, event):
        document.bind("mousemove", self.mousemove)
        document.bind("touchmove", self.mousemove)
        self.is_moving = True
        self.initial = [self.left - event.x, self.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def mousemove(self, event):
        if not self.is_moving:
            return

        # set new moving element coordinates
        self.left = self.initial[0] + event.x
        self.top = self.initial[1] + event.y

    def mouseup(self, event):
        self.is_moving = False
        document.unbind("mousemove")
        document.unbind("touchmove")

    def title(self, text):
        self.title_bar.text = title


class Button(html.BUTTON, Widget):

    def __init__(self, master, *args, **kw):
        self.master = master
        self.config(**kw)
        super().__init__(*args)


class Text(html.DIV, Widget):

    default_style = {
        'borderWidth': '1px',
        'borderStyle': 'solid',
        'borderColor': '#999',
        'boxSizing': 'border-box',
        'height': '100%',
        'overflow-y': 'scroll'
    }

    def __init__(self, master, *args, **kw):
        self.master = master
        self.apply_default_style()
        self.config(**kw)
        super().__init__(*args)
        self.attrs['contenteditable'] = True


class TitleBar(html.DIV, Widget):

    def __init__(self, master, title='', *args, **kw):
        self.master = master
        self.config(**kw)
        super().__init__(title, *args)

        self.close_button = html.SPAN("&times;",
            style="float:right;background-color:#fff;color:#000;" +
                  "cursor:default;padding:0.1em;")
        self <= self.close_button
        self.close_button.bind("click", master.close)


class Entry(html.INPUT, Widget):

    def __init__(self, master, *args, **kw):
        self.master = master
        self.config(**kw)
        super().__init__(*args)


class Frame(html.DIV, Widget):

    def __init__(self, master, *args, **kw):
        self.master = master
        self.config(**kw)
        super().__init__(*args)


class Label(html.DIV, Widget):

    default_style = {
        'whiteSpace': 'pre'
    }

    def __init__(self, master, *args, **kw):
        self.master = master
        self.config(**kw)
        super().__init__(*args)
        self.apply_default_style()

