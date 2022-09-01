from . import html, window, console, document


class UIError(Exception):
    pass


class Border:

    def __init__(self, width=1, style='solid', color='#000', radius=None):
        self.width = width
        self.style = style
        self.color = color
        self.radius = radius


class Font:

    def __init__(self, family='Arial', size=None, weight='normal',
                 style='normal'):
        self.family = family
        self.size = size
        self.weight = weight
        self.style = style


class _Directions:

    def __init__(self, *args, **kw):
        if len(args) == 0:
            values = [0] * 4
        elif len(args) == 1:
            values = [args[0]] * 4
        elif len(args) == 2:
            values = [args[0], args[1]] * 2
        elif len(args) == 3:
            values = args + [0]
        elif len(args) == 4:
            values = args
        else:
            raise ValueError('Padding expects at most 4 arguments, got ' +
                f'{len(args)}')
        self.top, self.right, self.bottom, self.left = values
        if (x := kw.get('x')) is not None:
            self.left = self.right = x
        if (y := kw.get('y')) is not None:
            self.top = self.bottom = y
        if (top := kw.get('top')) is not None:
            self.top = top
        if (right := kw.get('right')) is not None:
            self.right = right
        if (bottom := kw.get('bottom')) is not None:
            self.bottom = bottom
        if (left := kw.get('left')) is not None:
            self.left = left


class _Coords:

    def __init__(self, left, top, width, height):
        self.left = left
        self.top = top
        self.width = width
        self.height = height


class Padding(_Directions):
    pass


class Mouse:

    def __str__(self):
        return f'<Mouse x={self.x} y={self.y}>'

mouse = Mouse()

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
                self._rows.append(cells)
        return self._rows


class Widget:

    def __init_subclass__(cls):
        cls.__str__ = Widget.__str__

    def __str__(self):
        return f'<ui.{self.__class__.__name__}>'

    def add(self, widget, row='same', column=None, **kw):
        widget.master = self
        widget.config(**widget._options)
        widget.grid(row=row, column=column, **kw)
        widget.kw = kw

    def add_row(self, widgets, row='next', column_start=0, **kw):
        """Add a list of widgets at specified row."""
        for i, widget in enumerate(widgets):
            if i == 0:
                self.add(widget, row=row, column=column_start, **kw)
            else:
                self.add(widget, **kw)

    def add_from_table(self, table, **kw):
        """Add from a 2-dimensional table of Python objects, inserted as
        Labels."""
        for line in table:
            self.add(Label(line[0]), row='next')
            for cell in line[1:]:
                if isinstance(cell, str):
                    self.add(Label(cell), align='left', **kw)
                else:
                    self.add(Label(cell), align='right', **kw)

    def apply_default_style(self):
        if hasattr(self, 'default_style'):
            for key, value in self.default_style.items():
                self.style[key] = value

    def config(self, **kw):
        element = self

        if (value := kw.get('value')):
            if not isinstance(self, (Label, Entry)):
                raise TypeError("invalid keyword 'value' for " +
                    self.__class__.__name__)
            element._value = value
            element.text = value

        for attr in ['type', 'name', 'checked']:
            if (value := kw.get(attr)) is not None:
                setattr(element, attr, value)

        if (title := kw.get('title')) and isinstance(self, Box):
            element.title_bar.text = title

        for attr in ['width', 'height', 'top', 'left']:
            if (value := kw.get(attr)):

                match value:
                    case str():
                        setattr(element.style, attr, value)
                    case int() | float():
                        setattr(element.style, attr, f'{round(value)}px')
                    case _:
                        raise ValueError(f"{attr} should be str or number, " +
                            f"not '{value.__class__.__name__}'")

        if (cursor := kw.get('cursor')):
            element.style.cursor = cursor

        if (command := kw.get('command')):
            element.bind('click',
                lambda ev, command=command: command(ev.target))
            element.style.cursor = 'default'

        if (font := kw.get('font')):
            element.style.fontFamily = font.family
            element.style.fontWeight = font.weight
            element.style.fontStyle = font.style
            if font.size:
                if isinstance(font.size, str):
                    element.style.fontSize = font.size
                else:
                    element.style.fontSize = f'{font.size}px'

        if (background := kw.get('background')):
            element.style.backgroundColor = background
        if (color := kw.get('color')):
            element.style.color = color

        if (border := kw.get('border')):
            if isinstance(border, str):
                element.style.borderWidth = border
                element.style.borderStyle = 'solid'
            elif isinstance(border, int):
                element.style.borderWidth = f'{border}px'
                element.style.borderStyle = 'solid'
            elif isinstance(border, Border):
                element.style.borderStyle = border.style
                element.style.borderWidth = f'{border.width}px'
                element.style.borderColor = border.color
                element.style.borderRadius = f'{border.radius}px'
            else:
                raise TypeError('invalid type for border: ' +
                    border.__class__.__name__)

        if (padding := kw.get('padding')):
            if isinstance(padding, str):
                element.style.padding = padding
            elif isinstance(padding, int):
                element.style.padding = f'{padding}px'
            elif isinstance(padding, Padding):
                for key in ['top', 'right', 'bottom', 'left']:
                    value = getattr(padding, key)
                    attr = 'padding' + key.capitalize()
                    if isinstance(value, str):
                        setattr(element.style, attr, value)
                    else:
                        setattr(element.style, attr, f'{value}px')
            else:
                raise TypeError('invalid type for padding: ' +
                    padding.__class__.__name__)

        if (menu := kw.get('menu')) is not None:
            if isinstance(self, Box):
                menu._build()
                self.insertBefore(menu.element,
                    self.title_bar.nextSibling)
                self.menu = menu

        if (callbacks := kw.get('callbacks')) is not None:
            for event, func in callbacks.items():
                element.bind(event, self._wrap_callback(func))

        self._config = getattr(self, '_config', {})
        self._config |= kw

    def _wrap_callback(self, func):
        def f(event):
            res = func(event)
            if res is False:
                event.stopPropagation()
                event.preventDefault()
            return res
        return f

    def coords(self):
        if not hasattr(self, 'master'):
            raise TypeError("attribute 'coords' not set until widget is added")
        parent = self.parentNode
        return _Coords(parent.offsetLeft, parent.offsetTop, parent.offsetWidth,
            parent.offsetHeight)

    def grid(self, column=None, columnspan=1, row=None, rowspan=1, align='',
            **options):
        master = self.master
        if not hasattr(master, '_table'):
            master._table = html.TABLE(
                cellpadding=0,
                cellspacing=0,
                style='width:100%;')
            master <= master._table
            if row == 'same':
                row = 0

        master.table = _Wrapper(master._table)

        if not hasattr(master, 'cells'):
            master.cells = set()

        valid = [None, 'same', 'next']
        if not isinstance(row, int) and row not in valid:
            raise ValueError(f'invalid value for row: {row!r}')
        if not isinstance(column, int) and column not in valid:
            raise ValueError(f'invalid value for column: {column!r}')

        # The cell at (row, column) in grid must be inserted in table row #row
        # master.cells is a set of (row, column) that are already used because
        # a cell with colspan or rowspan is used
        nb_rows = len(master._table.rows)
        if row is None or row == 'next':
            # default is the first empty row
            row = nb_rows
            if column is None:
                column = 0
        elif row == 'same':
            row = max(0, nb_rows - 1)

        if column is None:
            column = 'next'

        for i in range(row - nb_rows + 1):
            master._table <= html.TR()

        tr = master._table.rows[row]
        # number of TD in table row
        nb_cols = len(tr.cells)
        if column == 'next':
            column = nb_cols
        elif column == 'same':
            column = nb_cols - 1

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

        aligns = align.split()
        if 'left' in aligns:
            td.style.textAlign = 'left'
        if 'right' in aligns:
            td.style.textAlign = 'right'
        if 'center' in aligns:
            td.style.textAlign = 'center'
        if 'top' in aligns:
            td.style.verticalAlign = 'top'
        if 'bottom' in aligns:
            td.style.verticalAlign = 'bottom'
        if 'middle' in aligns:
            td.style.verticalAlign = 'middle'

        has_child = len(td.childNodes) > 0
        if has_child:
            if hasattr(td.firstChild, 'is_inner'):
                inner = td.firstChild
            else:
                inner = html.DIV(style="position:relative")
                inner.is_inner = True
                inner <= td.firstChild
                td <= inner
            self.style.position = "absolute"
            self.style.top = '0px'
            inner <= self
        else:
            td <= self

        self.row = row
        self.column = column
        self.cell = _Wrapper(td)

        self.cell.config(**options)

        self.row = _Wrapper(tr)

        return self

    @property
    def rows(self):
        return Rows(self)

    def sort_by_row(self, *columns, has_title=False):
        """Sort rows by column. Each item in columns is either a number, or
        a tuple (column_number, ascending)."""
        rows = list(self._table.rows)
        if has_title:
            head = rows[0]
            rows = rows[1:]

        def first_values(row, rank):
            values = []
            for i in range(rank):
                col_num, _ = columns[i]
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
                        first_values(row, i) == first_values(rows[j], i)]
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



borderColor = '#008'
backgroundColor = '#fff'
color = '#000'


class Frame(html.DIV, Widget):

    def __init__(self, *args, **options):
        self._options = options


class Bar(Frame):

    def __init__(self, **options):
        super().__init__(**options)
        self <= Label(" ")


class Box(html.DIV, Widget):

    default_config = {
        'width': 'inherit',
        'background': backgroundColor,
        'color': color,
        'cursor': 'default',
        'menu': None,
        'font': Font(family='sans-serif', size=12)
    }

    def __init__(self, container=document, title="", titlebar=False, **options):
        html.DIV.__init__(self,
            style="position:absolute;box-sizing:border-box")

        container <= self
        self._options = self.default_config | options
        self.config(**self._options)

        if titlebar:
            self.title_bar = TitleBar(title)
            self.add(self.title_bar)

            panel = Frame()
            self.add(panel, row="next", align="left")
            self.panel = panel

            self.title_bar.close_button.bind("click", self.close)
            # define callbacks for drag and drop
            self.title_bar.bind("mousedown", self._grab_widget)
            self.title_bar.bind("touchstart", self._grab_widget)
            self.title_bar.bind("mouseup", self._stop_moving)
            self.title_bar.bind("touchend", self._stop_moving)
            self.bind("leave", self._stop_moving)
            self.is_moving = False

        elif title:
            raise UIError('cannot set title if titlebar is not set')

    def add(self, widget, **kw):
        if hasattr(self, 'panel'):
            self.panel.add(widget, **kw)
        else:
            Widget.add(self, widget, **kw)

    def add_menu(self, menu):
        """Insert menu as first child of self."""
        if not hasattr(self, "_table"):
            self.add(menu)
        else:
            self.insertBefore(menu, self._table)
        menu._toplevel = True

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
        self.title_bar.text = text

    def _remove_menus(self):
        menu = self._options['menu']
        if menu and menu.open_submenu:
            menu.open_on_mouseenter = False
            menu.open_submenu.element.remove()


class _Wrapper:

    def __init__(self, element):
        self.element = element

    def config(self, **options):
        Widget.config(self.element, **options)


class Checkbuttons(Frame):

    COUNTER = 0

    def __init__(self, **options):
        Frame.__init__(self, **options)
        self.name = f'checkbutton{self.COUNTER}'
        self.COUNTER += 1

    def add_option(self, label, value=None, checked=False):
        self.add(Entry(type="checkbox", name=self.name,
            value=value if value is not None else label,
            checked=checked))
        self.add(Label(label))


class Button(html.BUTTON, Widget):

    def __init__(self, *args, **options):
        super().__init__(*args)
        self._options = options


class Entry(html.INPUT, Widget):

    def __init__(self, *args, **options):
        self._options = options
        super().__init__(*args)


class Image(html.IMG, Widget):

    def __init__(self, src, **options):
        super().__init__(src=src)
        self._options = options


class Label(html.DIV, Widget):

    default_style = {
        'whiteSpace': 'pre',
        'padding': '0.3em'
    }

    def __init__(self, value, *args, **options):
        self._options = options
        self._value = value
        super().__init__(value, *args)
        if not value:
            self.style.minHeight = '1em'
        self.apply_default_style()


class Link(html.A, Widget):

    def __init__(self, text, href, **options):
        super().__init__(text, href=href)
        self._options = options


class Listbox(Frame):

    def __init__(self, **options):
        self.size = options.pop('size', None)
        self.multiple = options.pop('multiple', False)
        if self.size is not None and not isinstance(self.size, int):
            raise ValueError('size must be an integer')
        Frame.__init__(self, **options)
        self._selected = []

    def add_option(self, name):
        option = Label(name,
                       callbacks=dict(mouseenter=self.enter_option,
                                      mouseleave=self.leave_option,
                                      click=self.select_option))
        self.add(option, row='next')
        if self.size is not None and option.row == self.size - 1:
            self.style.height = f'{self.offsetHeight}px'
            self.style.overflowY = "scroll"

    def enter_option(self, widget):
        if widget not in self._selected:
            widget.config(background='lightblue')

    def leave_option(self, widget):
        if widget not in self._selected:
            widget.config(background='inherit')

    def select_option(self, widget):
        if self.multiple:
            if widget in self._selected:
                self.unselect(widget)
                self.enter_option(widget)
            else:
                self.select(widget)
        else:
            if self._selected:
                self.unselect(self._selected[0])
            self.select(widget)

    def select(self, widget):
        widget.config(background='blue', color='white')
        self._selected.append(widget)

    def unselect(self, widget):
        widget.config(background='inherit', color='inherit')
        self._selected.remove(widget)


class Menu(Frame):

    default_config = {
        'background': '#eee'
    }

    toplevel_options = {
        'background': 'inherit',
        'color': 'inherit',
        'highlight-background': 'LightBlue',
        'highlight-color': 'inherit'
    }

    submenu_options = {
        'background': 'inherit',
        'color': 'inherit',
        'highlight-background': 'blue',
        'highlight-color': 'white'
    }

    def __init__(self, master, label=None, **options):
        self.master = master
        self._toplevel_options = (self.toplevel_options |
            options.pop('toplevel_options', {}))
        self._submenu_options = (self.submenu_options |
            options.pop('submenu_options', {}))

        self._toplevel = not isinstance(master, Menu)
        self._options = self.default_config | options
        Frame.__init__(self, **self._options)

        if not self._toplevel:
            if label is None:
                raise ValueError('missing submenu label')
            master.add_submenu(label, self)
        elif not hasattr(master, "_table"):
            master.add(self)
        else:
            master.insertBefore(self, master._table)


    def add_option(self, label, command=None):
        callbacks = dict(mouseenter=self.enter,
                         mouseleave=self.leave)
        if command:
            callbacks['click'] = command
        name = Label(label, padding=5, callbacks=callbacks)
        self.add(name, row="next")

    def add_submenu(self, label, submenu=None):
        menu_options = {
            'callbacks': dict(click=self.submenu,
                              mouseenter=self.enter,
                              mouseleave=self.leave),
            'padding': 5
        }
        frame = Frame(**menu_options)
        frame.submenu = submenu

        frame.add(Label(label))
        if not self._toplevel:
            frame.add(Label('&#x25B6;', padding=Padding(left="1em")))
        if self._toplevel:
            self.add(frame)
        else:
            self.add(frame, row="next")

    def enter(self, widget):
        if self._toplevel:
            options = self._toplevel_options
        else:
            options = self._submenu_options
        widget.config(background=options['highlight-background'],
                      color=options['highlight-color'])
        if hasattr(widget.master, 'open_submenu'):
            self.submenu(widget)

    def leave(self, widget):
        if self._toplevel:
            options = self._toplevel_options
        else:
            options = self._submenu_options
        widget.config(background=options['background'],
                      color=options['color'])

    def submenu(self, widget):
        master = widget.master
        if hasattr(master, 'open_submenu'):
            master.open_submenu.remove()
        if not hasattr(widget, "submenu"):
            return
        coords = widget.coords()
        if self._toplevel:
            top = coords.top + coords.height
            left = coords.left
        else:
            top = coords.top + widget.closest('TABLE').offsetTop
            left = coords.left + master.master.clientWidth

        box = Box(container=widget, titlebar=None,
            top=f'{top}px', left=f'{left}px')
        box.add(widget.submenu)
        master.open_submenu = box

class Radiobuttons(Frame):

    COUNTER = 0

    def __init__(self, **options):
        Frame.__init__(self, **options)
        self.name = "radiobutton{self.COUNTER}"
        self.COUNTER += 1

    def add_option(self, label, value=None, checked=False):
        self.add(Entry(type="radio",
                       name=self.name,
                       value=value if value is not None else label,
                       checked=checked))
        self.add(Label(label))


class Slider(Frame):

    default_config = {
        'background': "#bbb"
    }

    def __init__(self, ratio=0, width=300, height=20, **options):
        background = options.pop('background', self.default_config['background'])
        Frame.__init__(self, width=width, height=height, **options)
        self.style.display = 'flex'
        self.style.alignItems = 'center'
        self.bar = html.DIV(style="width:100%;height:25%;border-radius:3px;")
        self.bar.style.backgroundColor = background
        self <= self.bar
        self.slider = html.DIV(style="position:absolute;" +
            "cursor:grab;")
        self.slider.style.backgroundColor = background
        self <= self.slider
        self.slider.bind('mousedown', self.grab_slider)
        self.ratio = ratio
        self.moving = False

    def grid(self, **kw):
        Widget.grid(self, **kw)
        ray = round(self.offsetWidth * 0.03)
        self.min_x = - ray
        self.max_x = round(self.width - self.slider.width - ray)
        self.interval = self.width - self.slider.width
        self.slider.left = self.min_x + round(self.interval * self.ratio)
        self.slider.style.height = self.slider.style.width = f'{2 * ray}px'
        self.slider.style.borderRadius = "50%"
        print(self.slider.style.width)

    def grab_slider(self, event):
        self.x0 = self.slider.left
        self.mouse0 = event.clientX
        document.bind('mousemove', self.move_slider)
        document.bind('mouseup', self.release_slider)
        self.moving = True
        event.preventDefault()

    def move_slider(self, event):
        event.preventDefault()
        if self.moving:
            dx = event.clientX - self.mouse0
            x = self.x0 + dx
            if x < self.min_x:
                x = self.min_x
            elif x > self.max_x:
                x = self.max_x
            self.slider.left = x
            self.ratio = (x - self.min_x) / self.interval
            evt = window.CustomEvent.new('move')
            evt.clientX = event.clientX
            evt.clientY = event.clientY
            self.dispatchEvent(evt)
        return False

    def release_slider(self, event):
        self.moving = False
        document.unbind('mousemove', self.move_slider)
        document.unbind('mouseup', self.release_slider)


class Text(html.DIV, Widget):

    default_style = {
        'borderWidth': '1px',
        'borderStyle': 'solid',
        'borderColor': '#999',
        'boxSizing': 'border-box'
    }

    def __init__(self, *args, **options):
        self.apply_default_style()
        self._options = options
        super().__init__(*args)
        self.attrs['contenteditable'] = True


class TitleBar(html.DIV, Widget):

    default_config = {
        'background' : '#f0f0f0',
        'cursor': 'default'
    }

    def __init__(self, title='', *args, **options):
        self._options = self.default_config | options
        super().__init__('', *args)

        self.add(Label(title))
        self.close_button = Button("&#9587;",
            padding=Padding(bottom=10),
            background="inherit",
            border=Border(width=0))

        self.add(self.close_button, align="right top")

        self.config(**self._options)

