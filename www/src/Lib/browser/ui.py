from . import html, window, console, document
from .widgets import dialog, menu

def grid(master, column=0, columnspan=1, row=None, rowspan=1,
        in_=None, ipadx=None, ipady=None,
        sticky=''):
    if not hasattr(master, '_table'):
        master._table = html.TABLE(cellpadding=0, cellspacing=0,
            style='width:100%;height:100%;')
        master <= master._table
        if row == 'current':
            row = 0

    if not hasattr(master, 'cells'):
        master.cells = set()

    # The cell at (row, column) in grid must be inserted in table row #row
    # master.cells is a set of (row, column) that are already used because
    # a cell with colspan or rowspan is used
    nb_rows = len(master._table.rows)
    if row is None or row == 'next':
        # default is the first empty row
        row = nb_rows
    elif row == 'current':
        row = nb_rows - 1

    for i in range(row - nb_rows + 1):
        master._table <= html.TR()

    tr = master._table.rows[row]
    # number of TD in table row
    nb_cols = len(tr.cells)
    if column == 'next':
        column = nb_cols
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
    return row, column, td


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

class Rows:

    def __init__(self, widget):
        self.widget = widget
        self._rows = []
        if hasattr(widget, '_table'):
            console.log('_table', widget._table)
            for row in self._widget.rows:
                cells = []
                for cell in row.cells:
                    cells.append(cell.firstChild)
                rows.append(cells)
        return rows

class Widget:

    def add(self, widget, row='current', column='next', **kw):
        widget.master = self
        widget.config(**widget._options)
        widget.grid(row=row, column=column, **kw)
        widget.kw = kw

    def add_row(self, widgets, row='next', column_start=0, **kw):
        """Add a list of widgets at specified row."""
        for i, widget in enumerate(widgets):
            if i == 0:
                self.add(widget, row, column=column_start, **kw)
            else:
                self.add(widget, **kw)

    def apply_default_style(self):
        if hasattr(self, 'default_style'):
            for key, value in self.default_style.items():
                self.style[key] = value

    def check_master(self, master):
        if not isinstance(master, Widget):
            raise ValueError('first argument should be Box or Document, ' +
                f"not '{master.__class__.__name__}'")
        self.master = master

    def grid(self, **options):
        master = self.master
        if isinstance(master, Document):
            master = document
        row, column, td = grid(master, **options)
        td <= self
        self.row = row
        self.column = column
        if isinstance(self, Text):
            self.dw = self.parentNode.offsetWidth - self.offsetWidth
            self.dh = self.parentNode.offsetHeight - self.offsetHeight
            self.style.width = f'{self.parentNode.width - self.dw}px'
            self.style.height = f'{self.parentNode.height - self.dh}px'
        return self

    @property
    def rows(self):
        return Rows(self)

    def sort_by_row(self, *columns, has_title=False):
        """Sort rows by column. Each item in columns is either a number, or
        a tuple (column_number, ascending)."""
        rows = self._table.rows
        if has_title:
            head = rows[0]
            rows = rows[1:]

        def first_values(row, rank):
            values = []
            for i in range(rank):
                col_num, _ = colums[i]
                values.append(row.cells[col_num].firstChild._value)
            return values

        for i, (col_num, ascending) in enumerate(columns):
            if i == 0:
                rows.sort(key=lambda row: row.cells[col_num].firstChild._value,
                          reverse=not ascending)
            else:
                new_rows = []
                j = 0
                while True:
                    same_start = [row for row in rows if
                        first_values(row, i) == first_values(row, j)]
                    same_start.sort(key=lambda r: r.cells[col_num].firstChild._value,
                                    reverse=not ascending)
                    new_rows += same_start
                    j += len(same_start)
                    if j == len(rows):
                        rows = new_rows
                        break

        if has_title:
            rows.insert(0, head)
        self._table <= rows

    def config(self, **kw):
        element = self
        if isinstance(self, Menu):
            element = self.element
        elif isinstance(self, Document):
            element = document

        if (text := kw.get('text')):
            element.text = text

        if (title := kw.get('title')) and isinstance(self, Box):
            element.title_bar.text = title

        if (width := kw.get('width')):
            match width:
                case str():
                    element.style.width = width
                case int() | float():
                    element.style.width = f'{round(width)}em'
                case _:
                    raise ValueError("width should be str or number, not " +
                        f"'{width.__class__.__name__}'")

        if (height := kw.get('height')):
            match height:
                case str():
                    element.style.height = height
                case int() | float():
                    element.style.height = f'{round(height)}em'
                case _:
                    raise ValueError("height should be str or number, not " +
                        f"'{height.__class__.__name__}'")

        if (command := kw.get('command')):
            element.bind('click',
                lambda ev, command=command: command(ev.target))
            element.style.cursor = 'default'

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

        self._config = getattr(self, '_config', {})
        self._config |= kw


borderColor = '#008'
backgroundColor = '#fff'
color = '#000'

class Box(html.DIV, Widget):

    default_config = {
        'left': 5,
        'top': 5,
        'width': None,
        'height': None,
        'background': backgroundColor,
        'color': color,
        'cursor': 'default',
        'menu': None,
        'border': Border(width=1),
        'font': Font(family='sans-serif', size=12),
        'padding': Padding(0)
    }

    def __init__(self, title="", titlebar=True, **options):
        html.DIV.__init__(self, style="position:absolute")
        self._options = self.default_config | options

        self.config(**self._options)

        if titlebar:
            self.title_bar = TitleBar(title, padding=Padding(5))
            self <= self.title_bar

        self.panel = Frame()
        self <= self.panel

        document <= self

        # define callbacks for drag and drop
        if titlebar:
            self.title_bar.bind("mousedown", self._grab_widget)
            self.title_bar.bind("touchstart", self._grab_widget)
            self.title_bar.bind("mouseup", self._stop_moving)
            self.title_bar.bind("touchend", self._stop_moving)
            self.bind("leave", self._stop_moving)
            self.is_moving = False

    def close(self, *args):
        self.remove()

    def keys(self):
        return [
            'left', 'top', 'width', 'height'
            'background', 'color',
            'cursor',
            'menu',
            'border',
            'font',
            'padding']

    def _grab_widget(self, event):
        self._remove_menus()
        document.bind("mousemove", self._move_widget)
        document.bind("touchmove", self._move_widget)
        self.is_moving = True
        self.initial = [self.left - event.x, self.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def _move_widget(self, event):
        if not self.is_moving:
            return

        # set new moving element coordinates
        self.left = self.initial[0] + event.x
        self.top = self.initial[1] + event.y

    def _stop_moving(self, event):
        self.is_moving = False
        document.unbind("mousemove")
        document.unbind("touchmove")

    def title(self, text):
        self.title_bar.text = title

    def _remove_menus(self):
        menu = self._options['menu']
        if menu and menu.open_submenu:
            menu.open_on_mouseenter = False
            menu.open_submenu.element.remove()

class Document(Widget):

    default_config = {
        'background': '#fff',
        'color': color,
        'menu': None,
        'font': Font(family='sans-serif', size=12)
    }

    def __init__(self, **options):
        self._options = self.default_config | options
        self.config(**options)


class Button(html.BUTTON, Widget):

    def __init__(self, *args, **options):
        self._options = options
        super().__init__(*args)


class Image(html.IMG, Widget):

    def __init__(self, src, **options):
        html.IMG.__init__(self, src=src)
        self._options = options


class Link(html.A, Widget):

    def __init__(self, text, href, **options):
        html.A.__init__(self, text, href=href)
        self._options = options


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

    def __init__(self, **options):
        self.toplevel = isinstance(master, Box)
        if self.toplevel:
            master.menu = self
            self._options = self._default_config_main | options
        else:
            self._options = self._default_config | options

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

        self.config(**self._options)

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
            if (command := choice.get('command')):
                cell.bind('click', lambda ev, command=command:command())
            if choice['type'] == 'cascade':
                cell.kw = choice
                cell.bind('click',
                    lambda ev, cell=cell: self._show_cascade(cell))


class Text(html.DIV, Widget):

    default_style = {
        'borderWidth': '1px',
        'borderStyle': 'solid',
        'borderColor': '#999',
        'boxSizing': 'border-box',
        'height': '100%',
        'overflow-y': 'scroll'
    }

    def __init__(self, *args, **options):
        self.apply_default_style()
        self._options = options
        super().__init__(*args)
        self.attrs['contenteditable'] = True


class TitleBar(html.DIV, Widget):

    def __init__(self, title='', *args, **options):
        self._options = options
        super().__init__(title, *args)

        self.close_button = html.SPAN("&times;",
            style="float:right;background-color:#fff;color:#000;" +
                  "cursor:default;padding:0.1em;")
        self <= self.close_button
        self.close_button.bind("click", master.close)


class Entry(html.INPUT, Widget):

    def __init__(self, *args, **options):
        self._options = options
        super().__init__(*args)


class Frame(html.DIV, Widget):

    def __init__(self, *args, **options):
        self._options = options
        super().__init__(*args)


class Label(html.DIV, Widget):

    default_style = {
        'whiteSpace': 'pre'
    }

    def __init__(self, value, *args, **options):
        self._options = options
        self._value = value
        super().__init__(value, *args)
        self.apply_default_style()

