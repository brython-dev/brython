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
        element = self.element if isinstance(self, Menu) else self

        if (text := kw.get('text')):
            element.text = text

        if (width := kw.get('width')):
            element.style.width = f"{width}em"
        if (height := kw.get('height')):
            element.style.height = f"{height}em"

        if (command := kw.get('command')):
            element.bind('click', lambda ev: command())

        if (font := kw.get('font')):
            element.style.fontFamily = font.family
            element.style.fontWeight = font.weight
            element.style.fontStyle = font.style
            if font.size:
                element.style.fontSize = f'{font.size}px'

        if (background := kw.get('background')):
            element.style.backgroundColor = background
        if (color := kw.get('color')):
            element.style.color = color

        if (border := kw.get('border')):
            element.style.borderStyle = border.style
            element.style.borderWidth = f'{border.width}px'
            element.style.borderColor = border.color

        if (padding := kw.get('padding')):
            element.style.paddingTop = f'{padding.values[0]}px'
            element.style.paddingRight = f'{padding.values[1]}px'
            element.style.paddingBottom = f'{padding.values[2]}px'
            element.style.paddingLeft = f'{padding.values[3]}px'

        if (menu := kw.get('menu')) is not None:
            if isinstance(self, Box):
                menu._build()
                self.insertBefore(menu.element,
                    self.title_bar.nextSibling)
                self.menu = menu

        self.kw = getattr(self, 'kw', {})
        self.kw |= kw

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

        self.kw = {'top': top, 'left': left}

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


borderColor = '#008'
backgroundColor = '#f0f0f0'
color = '#000'

class Menu(Widget):

    _main_menu_style = {
        'border-color': borderColor,
        'border-width': '0px',
        'width': '100%',
        'cursor': 'default',
        'padding': '5px 0px 5px 0px'
    }

    _main_menu_span_style = {
        'padding': '0em 1em 0em 0.5em'
    }

    _submenu_style = {
        'position': 'absolute',
        'border-color': borderColor,
        'width': 'auto',
        'cursor': 'default'
    }

    _submenu_label_style = {
        'padding-left': '0.5em',
        'padding-right': '0px',
        'width': '80%'
    }

    _submenu_arrow_style = {
        'text-align': 'right',
        'padding-left': '3px',
        'padding-right': '5px'
    }

    _default_config_main = {
        'activebackground': '#0078d7',
        'background': backgroundColor,
        'color' : color
    }

    _default_config = {
        'activebackground': '#0078d7',
        'background': backgroundColor,
        'border': Border(1),
        'color' : color
    }

    def __init__(self, master, **kw):
        self.master = master
        self.toplevel = isinstance(master, Box)
        if self.toplevel:
            master.menu = self
            self.kw = self._default_config_main | kw
        else:
            self.kw = self._default_config | kw

        self.selected = None
        self.open_submenu = None
        self.open_on_mouseenter = False
        self._ignore_next_key_events = False

        self.choices = []

    def add_cascade(self, **kw):
        """Add a command that triggers the opening of 'menu', an instance of
        Menu.
        submenu = Menu(main_menu)
        main_menu.add_cascade('open', submenu)
        """
        self.choices.append(kw | {'type': 'cascade'})

    def add_command(self, **kw):
        self.choices.append(kw | {'type': 'command'})

    def add_separator(self):
        self.choices.append({'type': 'separator'})

    def _select(self, cell):
        """Called when a cell is selected by click or keyboard navigation."""
        self.selected = cell
        cell.style.backgroundColor = 'lightblue'

    def _unselect(self):
        if self.selected:
            self.selected.style.backgroundColor = self.kw['background']
            self.selected.style.color = self.kw['color']
            self.selected = None
            if self.open_submenu:
                self.open_submenu.element.remove()
            self.open_submenu = None

    def _show_cascade(self, cell):
        global _selected
        submenu = cell.kw['menu']
        submenu._build()
        submenu.opener = cell
        cell.menu = self
        self.element <= submenu.element
        self.open_on_mouseenter = True
        master = self.master
        if self.toplevel:
            _selected = [self.master]
            submenu.element.style.left = f"{cell.abs_left - master.abs_left}px"
            submenu.element.style.top = f"{cell.abs_top - master.abs_top + cell.offsetHeight}px"
        else:
            submenu.element.style.left = f"{self.element.offsetWidth}px"
            submenu.element.style.top = f"{cell.abs_top - self.element.abs_top}px"
        submenu.element.style.display = 'block'
        self.open_submenu = submenu

    def _cell_enter(self, cell):
        self._unselect()
        if self.toplevel:
            # mouse enters a toplevel menu item
            cell.style.backgroundColor = 'lightblue'
            self._select(cell)
            if self.open_on_mouseenter:
                self._show_cascade(cell)
        else:
            if cell.firstChild.colSpan == 2:
                # ignore separator
                return
            opener = self.opener
            cell.style.backgroundColor = self.kw['activebackground']
            cell.style.color = '#fff'
            opener.style.backgroundColor = 'lightblue'
            self._select(cell)

    def _cell_leave(self, cell):
        if self.toplevel:
            cell.style.backgroundColor = self.kw['background']
        else:
            cell.style.backgroundColor = self.kw['background']
            cell.style.color = self.kw['color']

    def _build(self):
        self._unselect()
        if self.toplevel:
            self.element = html.DIV(style=self._main_menu_style)
        else:
            self.element = html.DIV(style=self._submenu_style)
            self.table = html.TABLE(cellspacing=0)
            self.element <= self.table

        self.config(**self.kw)

        for choice in self.choices:
            print('buil, choices', self.choices)
            if choice['type'] == 'separator':
                if not self.toplevel:
                    cell = html.TR(html.TD(html.HR(), colspan=2))
                    self.table <= cell
                continue
            else:
                label = choice.get('label', '').replace(' ', chr(160))

            if self.toplevel:
                cell = html.SPAN(label, style=self._main_menu_span_style)
                self.element <= cell
            else:
                arrow = html.SPAN()
                if choice['type'] == 'cascade':
                    arrow.html = '&#x25B6;'
                elif choice['type'] == 'separator':
                    arrow.html = '<hr>'
                else:
                    arrow.html = '&nbsp;'
                cell = html.TR(
                    html.TD(label, style=self._submenu_label_style) +
                    html.TD(arrow, style=self._submenu_arrow_style))
                self.table <= cell
            cell.menu = self
            cell.bind('mouseenter', lambda ev: self._cell_enter(ev.target))
            cell.bind('mouseleave', lambda ev: self._cell_leave(ev.target))
            if choice['type'] == 'cascade':
                cell.kw = choice
                cell.bind('click',
                    lambda ev, cell=cell: self._show_cascade(cell))
                print('cell', cell, cell.text, 'kw', cell.kw)


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

