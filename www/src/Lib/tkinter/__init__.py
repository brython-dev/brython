import re

import javascript
from browser import console, document, html, window

_loops = []
_selected = [] # list of selected windows


fontFamily = 'Arial'
color = '#000'
backgroundColor = '#f0f0f0'
borderColor = '#008'
title_bgColor = '#fff'
title_color = '#000'

class Constant:

    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f'<Constant {self.value}>'

E = Constant('E')
W = Constant('W')
N = Constant('N')
S = Constant('S')
NW = Constant('NW')
NE = Constant('NE')
SW = Constant('SW')
SE = Constant('SE')

NORMAL = Constant('NORMAL')
ACTIVE = Constant('ACTIVE')
DISABLED = Constant('DISABLED')
END = Constant('END')
SINGLE = Constant('SINGLE')
BROWSE = Constant('BROWSE')
MULTIPLE = Constant('MULTIPLE')
EXTENDED = Constant('EXTENDED')

# pack() option 'side'
LEFT = Constant('LEFT')
RIGHT = Constant('RIGHT')
TOP = Constant('TOP')
BOTTOM = Constant('BOTTOM')

# pack() option 'fill'
NONE = Constant('NONE')
BOTH = Constant('BOTH')
X = Constant('X')
Y = Constant('Y')


INSERT = Constant('INSERT')
CURRENT = Constant('CURRENT')

class Widget:

    def __getitem__(self, option):
        value = self.cget(option)
        if value is None:
            raise KeyError(option)
        return value

    def cget(self, option):
        if option not in self.keys():
            raise ValueError(f"unknown option '{key}")
        return self.kw.get(option)

    def config(self, **kw):
        keys = self.keys()
        for key, value in kw.items():
            if key not in keys:
                raise ValueError(f"unknown option '{key}")

        if (text := kw.get('text')) is not None:
            self.element.text = text

        # dimensions
        if (width := kw.get('width')) is not None:
            self.element.style.width = f'{width}em'
        if (height := kw.get('height')) is not None:
            if isinstance(self, Listbox):
                self.element.attrs['size'] = height
            else:
                self.element.style.height = f'{height}em'
        if (padx := kw.get('padx')) is not None:
            self.element.style.paddingLeft = f'{padx}px'
            self.element.style.paddingRight = f'{padx}px'
        if (pady := kw.get('pady')) is not None:
            self.element.style.paddingTop = f'{pady}px'
            self.element.style.paddingBottom = f'{pady}px'

        # colors
        if (bg := kw.get('bg')) is not None \
                or (bg := kw.get('background')) is not None:
            self.element.style.backgroundColor = bg
            self.kw['bg'] = self.kw['background'] = bg
        if (fg := kw.get('fg')) is not None \
                or (fg := kw.get('foreground')) is not None:
            self.element.style.color = fg
            self.kw['fg'] = self.kw['foreground'] = fg
        if (bd := kw.get('bd')) is not None \
                or (bd := kw.get('borderwidth')) is not None:
            self.element.style.borderWidth = f'{bd}px'
            self.element.style.borderStyle = 'solid'
            self.element.style.borderColor = '#ddd'
            self.element.style.boxShadow = "3px 3px 5px #999999"
            self.kw['bd'] = self.kw['borderwidth'] = bd

        # font
        if (font := kw.get('font')) is not None:
            for key, value in font.css.items():
                setattr(self.element.style, key, value)

        # misc
        if (cursor := kw.get('cursor')) is not None:
            self.element.style.cursor = cursor

        if (command := kw.get('command')) is not None:
            self.element.bind('click', lambda ev: command())

        if (state := kw.get('state')) is not None:
            if state is DISABLED:
                self.element.attrs['disabled'] = True
            elif state is NORMAL:
                self.element.attrs['disabled'] = False

        if (menu := kw.get('menu')) is not None:
            if isinstance(self, Tk):
                menu._build()
                self.element.insertBefore(menu.element,
                    self.title_bar.nextSibling)
                self.menu = menu

        if selectmode := kw.get('selectmode') is not None:
            self.element.attrs['multiple'] = selectmode is MULTIPLE

        self.kw |= kw

    configure = config

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        td <= self.element

    def pack(self, side=TOP, fill=NONE, expand=0, in_=None):
        if isinstance(self.master, Tk):
            master_element = self.master.panel
        else:
            master_element = self.master.element
        style = {}
        if fill is BOTH:
            self.element.style.width = '100%'
            self.element.style.height = '100%'
        elif fill is X:
            self.element.style.width = '100%'
        elif fill is Y:
            self.element.style.height = '100%'
        if side is TOP:
            master_element <= html.SPAN(self.element)
        elif side is LEFT:
            master_element <= html.SPAN(self.element,
                style={'float': 'left', 'padding-right': '0.3em'})
        elif side is BOTTOM:
            master_element.insertBefore(
                html.SPAN(self.element),
                master_element.firstChild)

class Tk(Widget):
    """Basic, moveable dialog box with a title bar.
    """

    _main_style = {
        'position': 'absolute',
        'font-family': fontFamily,
        'z-index': 10,
        'resize': 'both',
        'overflow': 'auto',
        'visibility': 'hidden'
    }


    _title_style = {
        'background-color': title_bgColor,
        'color': title_color,
        'border-style': 'solid',
        'border-color': borderColor,
        'border-width': '0px',
        'padding': '0.4em',
        'cursor': 'default'
    }

    _close_button_style = {
        'float': 'right',
        'color': color,
        'cursor': 'default',
        'padding': '0.1em'
    }

    _panel_style = {
        'padding': '0.6em',
        'background-color': backgroundColor,
        'text-align': 'center'
    }

    _default_config = {
        'bg': backgroundColor,
        'relief': 'solid',
        'bd': 1
    }

    def __init__(self, **kw):
        self.element = html.DIV(style=self._main_style)
        self.title_text = html.SPAN()
        self.title_text.html = '&nbsp;'
        self.title_bar = html.DIV('tk' + 3 * chr(160) + self.title_text,
            style=self._title_style)
        self.element <= self.title_bar
        self.close_button = html.SPAN("&times;",
            style=self._close_button_style)
        self.title_bar <= self.close_button
        self.close_button.bind("click", self.close)
        self.panel = html.DIV(style=self._panel_style)
        self.table = html.TABLE(width='100%')
        self.panel <= self.table
        self.element <= self.panel

        self.kw = self._default_config | kw

        document <= self.element
        cstyle = window.getComputedStyle(self.element)

        left = int(0.1 * window.innerWidth)
        self.element.style.left = f'{left}px'
        top = int(0.1 * window.innerHeight) + document.scrollingElement.scrollTop
        self.element.top = top
        self.element.style.top = f'{top}px'

        self.title_bar.bind("mousedown", self._grab_widget)
        self.element.bind("leave", self._mouseup)

        self._maxsize = (None, None)
        self.minsize(int(window.outerWidth * 0.2),
                        int(window.outerHeight * 0.2))
        self.resizable(1, 1)

        self.menu = None

        self.config(**self.kw)

        _loops.append(self)

    def aspect(self, *args):
        raise NotImplementedError()

    def close(self, *args):
        self.element.remove()

    def deiconify(self):
        self.element.style.visibility = "visible"
        self._state = "normal"

    def geometry(self, coords=None):
        if coords is None:
            return (f'{self.widget.width}x{self.widget.height}x'
                    f'{self.widget.abs_left}x{self.widget.abs_top}')
        else:
            if mo := re.match(r'^(\d+x)*$', coords):
                attrs = ['width', 'height', 'left', 'top']
                values = re.findall(r'\d+', coords)
                for value, attr in zip(values, attrs):
                    setattr(self.element.style, attr, f'{value}px')
            else:
                raise ValueError(f'bad geometry specifier "{coords}"')

    def keys(self):
        return ['bd', 'borderwidth', 'class', 'menu', 'relief', 'screen',
            'use', 'background', 'bg', 'colormap', 'container', 'cursor',
            'height', 'highlightbackground', 'highlightcolor',
            'highlightthickness', 'padx', 'pady', 'takefocus', 'visual',
            'width']

    def iconify(self):
        raise NotImplementedError()

    def maxsize(self, width=None, height=None):
        if width is None and height is None:
            return self._maxsize
        self._maxsize = (width, height)
        if width is not None:
            self.element.style.maxWidth = f'{width}px'
        if height is not None:
            self.element.style.maxHeight = f'{height}px'

    def minsize(self, width=None, height=None):
        if width is None and height is None:
            return self._minsize
        self._minsize = (width, height)
        if width is not None:
            self.element.style.minWidth = f'{width}px'
        if height is not None:
            self.element.style.minHeight = f'{height}px'

    def resizable(self, width=None, height=None):
        if width is None:
            css = self.element.style.resize
            match css:
                case 'both':
                    return (1, 1)
                case 'horizontal':
                    return (1, 0)
                case 'vertical':
                    return (0, 1)
                case 'non':
                    return (1, 0)
        else:
            if height is None:
                raise ValueError('missing value for height')
            height = self._resizable[1] if height is None else height
            match (width, height):
                case (0, 0):
                    self.element.style.resize = 'none'
                case (0, 1):
                    self.element.style.resize = 'vertical'
                case (1, 0):
                    self.element.style.resize = 'horizontal'
                case (1, 1):
                    self.element.style.resize = 'both'

    def mainloop(self):
        self.element.style.visibility = "visible"

    def overrideredirect(self, flag=None):
        if flag is None:
            return self._overrideredirect
        self._overrideredirect = flag
        if flag:
            self.title_bar.style.display = 'none'
        else:
            self.title_bar.style.display = 'block'

    def quit(self):
        self.element.remove()

    def state(self):
        return self._state

    def title(self, title=None):
        if title is None:
            return self.title_text.text
        self.title_text.text = title

    def withdraw(self):
        self.element.style.visibility = 'hidden'
        self._state = 'withdrawn'

    def _grab_widget(self, event):
        self._remove_menus()
        _selected = [self]
        document.bind("mousemove", self._move_widget)
        document.bind("mouseup", self._stop_moving_widget)
        self.initial = [self.element.left - event.x,
                        self.element.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def _move_widget(self, event):
        # set new moving element coordinates
        self.element.left = self.initial[0] + event.x
        self.element.top = self.initial[1] + event.y

    def _remove_menus(self):
        if self.menu and self.menu.open_submenu:
            self.menu.open_on_mouseenter = False
            self.menu.open_submenu.element.remove()

    def _stop_moving_widget(self, event):
        document.unbind('mousemove')
        document.unbind('mouseup')

    def _mouseup(self, event):
        document.unbind("mousemove")
        document.unbind("touchmove")





def grid(master, column=0, columnspan=1, row=None, rowspan=1,
        in_=None, ipadx=None, ipady=None,
        sticky=''):
    if not hasattr(master, 'table'):
        master.table = html.TABLE(width='100%')
        master.element <= master.table
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

    td.style.textAlign = 'center' # default

    if 'W' in sticky:
        td.style.textAlign = 'left'
    if 'E' in sticky:
        td.style.textAlign = 'right'
    if 'N' in sticky:
        td.style.verticalAlign = 'top'
    if 'S' in sticky:
        td.style.verticalAlign = 'bottom'
    return td

class IntVar:

    def get(self):
        return self.value

    def set(self, value):
        self.value = value


class Button(Widget):

    def __init__(self, master, text='', **kw):
        self.master = master
        self.kw = kw
        self.element = html.BUTTON(text)
        self.config(**kw)

    def keys(self):
        return ['activebackground', 'activeforeground', 'anchor',
            'background', 'bd', 'bg', 'bitmap', 'borderwidth', 'command',
            'compound', 'cursor', 'default', 'disabledforeground', 'fg',
            'font', 'foreground', 'height', 'highlightbackground',
            'highlightcolor', 'highlightthickness', 'image', 'justify',
            'overrelief', 'padx', 'pady', 'relief', 'repeatdelay',
            'repeatinterval', 'state', 'takefocus', 'text', 'textvariable',
            'underline', 'width', 'wraplength']

class Entry(Widget):

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.INPUT()
        self.config(**kw)

    def keys(self):
        return ['background', 'bd', 'bg', 'borderwidth', 'cursor',
            'disabledbackground', 'disabledforeground', 'exportselection',
            'fg', 'font', 'foreground', 'highlightbackground',
            'highlightcolor', 'highlightthickness', 'insertbackground',
            'insertborderwidth', 'insertofftime', 'insertontime',
            'insertwidth', 'invalidcommand', 'invcmd', 'justify',
            'readonlybackground', 'relief', 'selectbackground',
            'selectborderwidth', 'selectforeground', 'show', 'state',
            'takefocus', 'textvariable', 'validate', 'validatecommand',
            'vcmd', 'width', 'xscrollcommand']

class Frame(Widget):

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.DIV()
        self.config(**kw)

    def keys(self):
        return ['bd', 'borderwidth', 'class', 'relief', 'background', 'bg',
            'colormap', 'container', 'cursor', 'height', 'highlightbackground',
            'highlightcolor', 'highlightthickness', 'padx', 'pady',
            'takefocus', 'visual', 'width']

class Label(Widget):

    def __init__(self, master, *, text='', **kw):
        self.master = master
        self.text = text
        self.kw = kw
        self.element = html.DIV(text, style={'white-space': 'pre'})
        self.config(**kw)

    def keys(self):
        return ['activebackground', 'activeforeground', 'anchor',
            'background', 'bd', 'bg', 'bitmap', 'borderwidth', 'compound',
            'cursor', 'disabledforeground', 'fg', 'font', 'foreground',
            'height', 'highlightbackground', 'highlightcolor',
            'highlightthickness', 'image', 'justify', 'padx', 'pady',
            'relief', 'state', 'takefocus', 'text', 'textvariable',
            'underline', 'width', 'wraplength']



class Listbox(Widget):

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.SELECT()
        self.config(**kw)

    def delete(self, position):
        if position is END:
            position = len(self.element.options) - 1
        elif position is ACTIVE:
            position = self.element.selectedIndex
        self.element.remove(position)

    def insert(self, position, *options):
        if position is END:
            for option in options:
                self.element <= html.OPTION(option)
            return
        elif position is ACTIVE:
            position = self.element.selectedIndex
        for option in options.reverse():
            self.element.add(html.OPTION(option), position)

    def keys(self):
        return ['activestyle', 'background', 'bd', 'bg', 'borderwidth',
            'cursor', 'disabledforeground', 'exportselection', 'fg', 'font',
            'foreground', 'height', 'highlightbackground', 'highlightcolor',
            'highlightthickness', 'justify', 'relief', 'selectbackground',
            'selectborderwidth', 'selectforeground', 'selectmode', 'setgrid',
            'state', 'takefocus', 'width', 'xscrollcommand', 'yscrollcommand',
            'listvariable']

    def size(self):
        return len(self.element.options)

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
        'foreground' : color
    }

    _default_config = {
        'activebackground': '#0078d7',
        'background': backgroundColor,
        'bd': 1,
        'foreground' : color
    }

    def __init__(self, master, **kw):
        self.master = master
        self.toplevel = isinstance(master, Tk)
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

    def keys(self):
        return ['activebackground', 'activeborderwidth', 'activeforeground',
            'background', 'bd', 'bg', 'borderwidth', 'cursor',
            'disabledforeground', 'fg', 'font', 'foreground', 'postcommand',
            'relief', 'selectcolor', 'takefocus', 'tearoff', 'tearoffcommand',
            'title', 'type']

    def _select(self, cell):
        """Called when a cell is selected by click or keyboard navigation."""
        self.selected = cell
        cell.style.backgroundColor = 'lightblue'

    def _unselect(self):
        if self.selected:
            self.selected.style.backgroundColor = self.kw['background']
            self.selected.style.color = self.kw['fg']
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
        master = self.master.element
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
            cell.style.color = self.kw['fg']

    def _build(self):
        self._unselect()
        self.element = html.DIV()
        if self.toplevel:
            self.element = html.DIV(style=self._main_menu_style)
        else:
            self.element = html.DIV(style=self._submenu_style)
            self.table = html.TABLE(cellspacing=0)
            self.element <= self.table

        self.config(**self.kw)

        for choice in self.choices:
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


class Radiobutton(Widget):

    def __init__(self, master, text='', value=None, variable=None,
            **kw):
        self.master = master
        self.kw = kw
        self.radio = html.INPUT(type='radio', value=value, name='x')
        if variable:
            self.radio.bind('click', lambda ev: variable.set(ev.target.value))
        self.element = html.DIV(self.radio + html.SPAN(text))
        self.config(**kw)

    def keys(self):
        return ['activebackground', 'activeforeground', 'anchor',
            'background', 'bd', 'bg', 'bitmap', 'borderwidth', 'command',
            'compound', 'cursor', 'disabledforeground', 'fg', 'font',
            'foreground', 'height', 'highlightbackground', 'highlightcolor',
            'highlightthickness', 'image', 'indicatoron', 'justify',
            'offrelief', 'overrelief', 'padx', 'pady', 'relief',
            'selectcolor', 'selectimage', 'state', 'takefocus', 'text',
            'textvariable', 'tristateimage', 'tristatevalue', 'underline',
            'value', 'variable', 'width', 'wraplength']

class Text(Widget):

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.DIV(contenteditable=True,
            style={'text-align': 'left', 'background-color': '#fff',
                   'width' :'100%'})
        self.config(**kw)

    def index(self, position):
        el = self.element
        if position is END or position == "end":
            # END (or "end") corresponds to the position just after the last
            # character in the buffer.
            lines = self._get_text().split('\n')
            return len(lines) + 1, 0
        elif position is INSERT or position == "insert":
            # INSERT (or "insert") corresponds to the insertion cursor.
            sel = window.getSelection()
            if sel.anchorNode is javascript.NULL \
                    or sel.anchorNode is self.element \
                    or not self.element.contains(sel.anchorNode):
                lines = self._get_text().split('\n')
                return len(lines), len(lines[-1])
            else:
                return self._node_offset_to_row_column(sel.anchorNode,
                    sel.anchorOffset)
        elif isinstance(position, float):
            row, column = [int(x) for x in str(position).split('.')]
        elif isinstance(position, str):
            if '.' not in position:
                raise ValueError(f'bad text index "{position}"')
            row, column = position.split('.')
            row = int(row)
            if row <= 0:
                return [0, 0]
            # handle modifiers such as "+ 3 chars"
            delta_column = 0
            delta_row = 0
            regexp = '\s*([+-])\s*(\d+)\s*(chars|char|cha|ch|c|lines|line|lin|li|l)'
            while True:
                if mo := re.search(regexp, column):
                    column = column[:mo.start()] + column[mo.end():]
                    delta = int(mo.groups()[0] + mo.groups()[1])
                    if mo.groups()[2].startswith('c'):
                        delta_column += delta
                    else:
                        delta_row += delta
                else:
                    break

            # handle modifiers linestart / lineend
            if mo := re.search('(linestart|lineend)', column):
                s = mo.groups()[0]
                if s == 'linestart':
                    column = 0
                else:
                    column = 'end'

            # handle modifiers wordstart / wordend
            word_border = None
            if mo := re.search('(wordstart|wordend)', column):
                word_border = mo.groups()[0]
                column = column[:mo.start()] + column[mo.end():]

            row += delta_row
            lines = self.element.text.split('\n')
            if row > len(lines):
                return self.index(END)
            if column == 'end':
                line = lines[row - 1]
                column = len(line)
            else:
                line = lines[row - 1]
                column = min(len(line), int(column) + delta_column)
                if word_border == "wordstart":
                    while column and line[column - 1].isalnum():
                        column -= 1
                elif word_border == "wordend":
                    while column < len(line) and line[column].isalnum():
                        column += 1
        return row, column

    def grid(self, **kwargs):
        super().grid(**kwargs)
        h = window.getComputedStyle(self.master.element)['height']
        self.element.style.height = h

    def delete(self, position, end=None):
        row, column = self.index(position)
        _range = document.createRange()
        sel = window.getSelection()
        el = self.element
        _range.setStart(el.childNodes[row - 1], column)

        if end is not None:
            end_row, end_column = self._convert_position(end)
            if end_row >= len(el.childNodes):
                end_row = len(el.childNodes)
                end_column = len(el.childNodes[end_row].innerText)
            _range.setEnd(el.childNodes[end_row - 1], end_column)
        else:
            _range.setEnd(el.childNodes[row - 1], column + 1)

        sel.removeAllRanges()
        sel.addRange(_range)
        _range.deleteContents()

    def insert(self, position, text, tags=()):
        if not self.element.childNodes:
            lines = text.split('\n')
            self.element <= lines[0] # text node
            for line in lines[1:]:
                self.element <= html.DIV(line)
        elif position is END:
            lastChild = self.element.lastChild
            lines = text.split('\n')
            if lastChild.nodeType == 3:
                lastChild.nodeValue += lines[0]
                self.element <= (html.DIV(line) for line in lines[1:])
            else:
                self.element <= (html.DIV(line) for line in lines)
        elif position is INSERT:
            sel = window.getSelection()
            if sel is javascript.NULL \
                    or sel.anchorNode is self.element \
                    or not self.element.contains(sel.anchorNode):
                self.insert(END, text)
            else:
                self.insert(*self.index(INSERT), text)
        else:
            row, column = self.index(position)
            element_text = self._get_text()
            lines = element_text.split('\n')
            if row > len(lines):
                return self.insert(END, text)
            line = lines[row - 1]

            node, offset = self._row_column_to_node_offset(row, column)
            if node.nodeType == 1 and node.nodeName == 'BR':
                node.parentNode.replaceChild(document.createTextNode(text), node)
            else:
                node.nodeValue = node.nodeValue[:offset] + text + \
                    node.nodeValue[offset:]

    def keys(self):
        return ['autoseparators', 'background', 'bd', 'bg', 'blockcursor',
            'borderwidth', 'cursor', 'endline', 'exportselection', 'fg', 'font',
            'foreground', 'height', 'highlightbackground', 'highlightcolor',
            'highlightthickness', 'inactiveselectbackground',
            'insertbackground', 'insertborderwidth', 'insertofftime',
            'insertontime', 'insertunfocussed', 'insertwidth', 'maxundo',
            'padx', 'pady', 'relief', 'selectbackground', 'selectborderwidth',
            'selectforeground', 'setgrid', 'spacing1', 'spacing2', 'spacing3',
            'startline', 'state', 'tabs', 'tabstyle', 'takefocus', 'undo',
            'width', 'wrap', 'xscrollcommand', 'yscrollcommand']

    def _get_text(self):
        text = ''
        previous = None
        for child in self.element.childNodes:
            if previous and child.nodeType == 1 \
                    and child.nodeName == 'DIV':
                text += '\n'
            if child.nodeType == 3:
                text += child.nodeValue.strip()
            elif child.nodeType == 1:
                child = child.firstChild
                if child.nodeType == 3:
                    text += child.nodeValue.strip()
            previous = child
        return text

    def _row_column_to_node_offset(self, row, column):
        line = 1
        col = 0
        previous = None

        for child in self.element.childNodes:
            if child.nodeType == 3:
                node_value = child.nodeValue
                node_text = node_value.strip()
                node_lines = node_value.split('\n')
                offset = 0
                for i, node_line in enumerate(node_lines):
                    if row == line + i:
                        return child, min(column + offset, len(node_line))
                    offset += len(node_line) + 1
                line += len(node_lines) - 1
            elif child.nodeType == 1:
                if previous and child.nodeName == 'DIV':
                    line += 1
                    col = 0
                for child in child.childNodes:
                    if child.nodeType == 3:
                        node_value = child.nodeValue
                        node_lines = node_value.split('\n')
                        offset = 0
                        for i, node_line in enumerate(node_lines):
                            col = 0
                            if not node_line and i == len(node_lines) - 1:
                                # ignore last empty line
                                continue
                            if row == line + i:
                                return child, min(column + offset, len(node_line))
                            offset += len(node_line) + 1
                            col = len(node_line)
                        line += len(node_lines) - 1
                    elif child.nodeType == 1:
                        if child.nodeName == 'BR' and column == 0:
                            node_line = ''
                            if row == line:
                                return child, 0
            previous = child

    def _node_offset_to_row_column(self, node, node_offset):
        line = 1
        col = 0
        previous = None

        for child in self.element.childNodes:
            if child.nodeType == 3:
                node_value = child.nodeValue
                node_text = node_value.strip()
                node_lines = node_value.split('\n')
                offset = 0
                for i, node_line in enumerate(node_lines):
                    if child is node and offset <= node_offset < offset + len(node_line):
                        return line + i, node_offset
                    offset += len(node_line) + 1
                if child is node:
                    return line + i, len(node_line)
                line += len(node_lines) - 1
            elif child.nodeType == 1:
                if previous and child.nodeName == 'DIV':
                    line += 1
                    col = 0
                for child in child.childNodes:
                    if child.nodeType == 3:
                        node_value = child.nodeValue
                        node_lines = node_value.split('\n')
                        offset = 0
                        for i, node_line in enumerate(node_lines):
                            col = 0
                            if not node_line and i == len(node_lines) - 1:
                                # ignore last empty line
                                continue
                            if child is node and offset <= node_offset < offset + len(node_line):
                                return line + i, node_offset
                            offset += len(node_line) + 1
                            col = len(node_line)
                        line += len(node_lines) - 1
                    elif child.nodeType == 1:
                        if child.nodeName == 'BR' and column == 0:
                            node_line = ''
                            if child is node:
                                return line, 0
            previous = child

class _KeyEventState:
    ignore = False

def _get_rank(elt):
    # return rank of element in its parentNode
    for rank, child in enumerate(elt.parentNode.childNodes):
        if child is elt:
            return rank

@document.bind('keydown')
def _keyboard_move_selection(event):
    """If an option is currently selected in the main menu, the selection
    can be changed by keyboard keys "ArrowRight" or "ArrowLeft".
    """
    if _KeyEventState.ignore:
        return
    if not _selected or not _selected[0].menu \
            or not _selected[0].menu.selected:
        print('pas de sélection')
        return
    menu = _selected[0].menu
    if event.key == 'ArrowRight':
        rank = _get_rank(menu.selected)
        if rank < len(menu.choices) - 1:
            menu._cell_enter(menu.selected.nextSibling)
            _KeyEventState.ignore = True
        return
    elif event.key == 'ArrowLeft':
        rank = _get_rank(menu.selected)
        if rank > 0:
            menu._cell_enter(menu.selected.previousSibling)
            _KeyEventState.ignore = True
        return

    # get the last selected option in an open menu
    menu = _selected[0].menu
    while True:
        if menu.selected:
            selected = menu.selected
        if menu.open_submenu:
            menu = menu.open_submenu
        else:
            break

    if event.key == 'ArrowDown':
        menu = selected.menu
        if menu.toplevel:
            if menu.open_submenu:
                # select first option in submenu
                cell = menu.open_submenu.table.firstChild
                menu.open_submenu._cell_enter(cell)
                _KeyEventState.ignore = True
        else:
            rank = _get_rank(menu.selected)
            while rank < len(menu.choices) - 1:
                candidate = selected.parentNode.childNodes[rank + 1]
                if candidate.firstChild.colSpan == 2: # separator
                    rank += 1
                else:
                    menu._cell_enter(candidate)
                    _KeyEventState.ignore = True
                    break

    elif event.key == 'ArrowUp':
        menu = selected.menu
        if not menu.toplevel:
            rank = _get_rank(menu.selected)
            while rank > 0:
                candidate = selected.parentNode.childNodes[rank - 1]
                if candidate.firstChild.colSpan == 2: # separator
                    rank -= 1
                else:
                    menu._cell_enter(candidate)
                    _KeyEventState.ignore = True
                    break

@document.bind('keyup')
def _keyup(event):
    _KeyEventState.ignore = False

def mainloop():
    for item in _loops:
        item.mainloop()