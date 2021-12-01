import re

from browser import console, document, html, window

style_sheet = """
:root {
    --tkinter-font-family: Arial;
    --tkinter-font-size: 100%;
    --tkinter-bgcolor: #f0f0f0;
    --tkinter-border-color: #000;
    --tkinter-title-bgcolor: #fff;
    --tkinter-title-color: #000;
    --tkinter-menu-bgcolor: #fff;
    --tkinter-menu-color: #000;
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
    border-width: 0px;
    padding: 0.4em;
    cursor: default;
}

.tkinter-menu {
    background-color: var(--tkinter-menu-bgcolor);
    color: var(--tkinter-menu-color);
    border-style: solid;
    border-color: var(--tkinter-border-color);
    border-width: 0px;
    width: auto;
    cursor: default;
}

.tkinter-menu span {
    padding-right: 0.3em;
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

_loops = []

class Tk:
    """Basic, moveable dialog box with a title bar.
    """

    def __init__(self, *, top=None, left=None, default_css=True):
        if default_css:
            for stylesheet in document.styleSheets:
                if stylesheet.ownerNode.id == "tkinter":
                    break
            else:
                document <= html.STYLE(style_sheet, id="tkinter")

        self.element = html.DIV(style='position:absolute;visibility:hidden',
            Class="tkinter-main")
        self.title_text = html.SPAN()
        self.title_text.html = '&nbsp;'
        self.title_bar = html.DIV('tk' + 3 * chr(160) + self.title_text,
            Class="tkinter-title")
        self.element <= self.title_bar
        self.close_button = html.SPAN("&times;", Class="tkinter-close")
        self.title_bar <= self.close_button
        self.close_button.bind("click", self.close)
        self.panel = html.DIV(Class="tkinter-panel")
        self.table = html.TABLE(width='100%')
        self.panel <= self.table
        self.element <= self.panel

        document <= self.element
        cstyle = window.getComputedStyle(self.element)

        # Center horizontally and vertically
        if left is None:
            left = int(0.1 * window.innerWidth)
        self.element.left = left
        self.element.style.left = f'{left}px'
        if top is None:
            top = int(0.1 * window.innerHeight)
        # top is relative to document scrollTop
        top += document.scrollingElement.scrollTop
        self.element.top = top
        self.element.style.top = f'{top}px'

        self.title_bar.bind("mousedown", self.grab_widget)
        self.element.bind("leave", self.mouseup)

        self._maxsize = (None, None)
        self.minsize(int(window.outerWidth * 0.2),
                        int(window.outerHeight * 0.2))
        self.resizable(1, 1)

        self.menu = None

        _loops.append(self)

    def aspect(self, *args):
        raise NotImplementedError()

    def close(self, *args):
        self.element.remove()

    def config(self, **kwargs):
        config(self, **kwargs)

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

    def grab_widget(self, event):
        self.remove_menus()
        document.bind("mousemove", self.move_widget)
        document.bind("mouseup", self.stop_moving_widget)
        self.initial = [self.element.left - event.x,
                        self.element.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

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

    def move_widget(self, event):
        # set new moving element coordinates
        self.element.left = self.initial[0] + event.x
        self.element.top = self.initial[1] + event.y

    def remove_menus(self):
        if self.menu and self.menu.open_submenu:
            self.menu.open_on_mouseenter = False
            self.menu.open_submenu.element.remove()

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

    def stop_moving_widget(self, event):
        document.unbind('mousemove')
        document.unbind('mouseup')

    def mouseup(self, event):
        document.unbind("mousemove")
        document.unbind("touchmove")

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

def config(widget, **kw):
    if (text := kw.get('text')) is not None:
        widget.element.text = text
    if (width := kw.get('width')) is not None:
        widget.element.style.width = f'{width}em'
    if (height := kw.get('height')) is not None:
        if isinstance(widget, Listbox):
            widget.element.attrs['size'] = height
        else:
            widget.element.style.height = f'{height}em'
    if (bg := kw.get('bg')) is not None:
        widget.element.style.backgroundColor = bg
    if (fg := kw.get('fg')) is not None:
        widget.element.style.color = fg
    if (bd := kw.get('bd')) is not None:
        widget.element.style.borderWidth = bd
        widget.element.style.borderStyle = 'solid'
        widget.element.style.borderColor = '#ddd'
    if(font := kw.get('font')) is not None:
        for key, value in font.css.items():
            setattr(widget.element.style, key, value)
    if (command := kw.get('command')) is not None:
        widget.element.bind('click', lambda ev: command())
    if (state := kw.get('state')) is not None:
        if state is DISABLED:
            widget.element.attrs['disabled'] = True
        elif state is NORMAL:
            widget.element.attrs['disabled'] = False

    if (menu := kw.get('menu')) is not None:
        if isinstance(widget, Tk):
            menu._build()
            widget.element.insertBefore(menu.element,
                widget.title_bar.nextSibling)
            widget.menu = menu
    if isinstance(widget, Listbox):
        if selectmode := kw.get('selectmode') is not None:
            widget.element.attrs['multiple'] = selectmode is MULTIPLE

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
        self.element = html.BUTTON(text)
        config(self, **kw)

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        td <= self.element

class Entry:

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.INPUT()

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td <= self.element

class Frame:

    count = 0

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.DIV()
        self._count = Frame.count
        Frame.count += 1

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(td, **self.kw)
        td <= self.element

class Label:

    def __init__(self, master, *, text='', **kw):
        self.master = master
        self.text = text
        self.kw = kw
        self.element = html.DIV(text, style='white-space:pre;')

    def config(self, **kw):
        config(self, **kw)

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        self.element = td
        config(self, **self.kw)
        td.text = self.text
        td.style.whiteSpace = 'pre'


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
        self.element = html.SELECT()

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

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(self, **self.kw)
        td <= self.element

    def size(self):
        return len(self.element.options)

class Menu:
    COUNTER = 0

    def __init__(self, master, **kw):
        self.master = master
        master.menu = self
        self.kw = kw
        self.toplevel = isinstance(master, Tk)

        self.selected = None
        self.open_submenu = None
        self.open_on_mouseenter = False

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
        self.selected = cell
        cell.style.backgroundColor = 'lightblue'
        self.open_submenu = cell.kw['menu']

    def _unselect(self):
        if self.selected:
            self.selected.style.backgroundColor = '#fff'

    def _show_cascade(self, cell):
        self._select(cell)
        submenu = cell.kw['menu']
        submenu._build()
        submenu.opener = cell
        self.element <= submenu.element
        self.open_on_mouseenter = True
        master = self.master.element
        if isinstance(self.master, Tk):
            submenu.element.style.left = f"{cell.abs_left - master.abs_left}px"
            submenu.element.style.top = f"{cell.abs_top - master.abs_top + cell.offsetHeight}px"
        else:
            submenu.element.style.left = f"{self.element.offsetWidth}px"
            submenu.element.style.top = f"{cell.abs_top - self.element.abs_top}px"
        submenu.element.style.display = 'block'
        self.open_submenu = submenu

    def _cell_enter(self, event):
        cell = event.target
        self._unselect()
        if self.toplevel:
            # mouse enters a toplevel menu item
            cell.style.backgroundColor = 'lightblue'
            if not self.open_on_mouseenter:
                return
            self.open_submenu.element.style.display = 'none'
            self._show_cascade(cell)
        else:
            opener = self.opener
            event.target.style.backgroundColor = 'blue'
            event.target.style.color = '#fff'
            opener.style.backgroundColor = 'lightblue'

    def _cell_leave(self, event):
        if self.toplevel:
            event.target.style.backgroundColor = '#fff'
        else:
            event.target.style.backgroundColor = '#fff'
            event.target.style.color = '#000'

    def _build(self):
        self.element = html.DIV(Class='tkinter-menu')
        if self.toplevel:
            self.element.style.width='100%'
        else:
            self.element.style.position = 'absolute'

        for choice in self.choices:
            if choice['type'] == 'separator':
                label = html.HR()
            else:
                label = choice.get('label', '').replace(' ', chr(160))
            cell = html.SPAN(label) if self.toplevel else html.DIV(label)
            if choice['type'] == 'cascade' and not self.toplevel:
                cell = html.DIV(html.SPAN(label) +
                    html.SPAN('>', style='text-align:right;'))
            self.element <= cell
            cell.bind('mouseenter', self._cell_enter)
            cell.bind('mouseleave', self._cell_leave)
            if choice['type'] == 'cascade':
                cell.kw = choice
                cell.bind('click',
                    lambda ev, cell=cell: self._show_cascade(cell))


class Radiobutton:

    def __init__(self, master, text='', value=None, variable=None,
            **kw):
        self.master = master
        self.kw = kw
        self.radio = html.INPUT(type='radio', value=value, name='x')
        if variable:
            self.radio.bind('click', lambda ev: variable.set(ev.target.value))
        self.element = html.DIV(self.radio + html.SPAN(text))

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(self, **self.kw)
        td <= self.element

INSERT = Constant('INSERT')
CURRENT = Constant('CURRENT')


def get_text_nodes(div):
    nodes = []
    for child in div.childNodes:
        if child.nodeType == 3:
            nodes.append(child)
        elif child.nodeType == 1:
            nodes += get_text_nodes(child)
    return nodes

def get_all_nodes(elt):
    nodes = []
    if elt.child_nodes:
        for child in elt.childNodes:
            nodes.append(child)
            nodes += get_all_nodes(child)
    return nodes

def text_nodes(elt):
    r, c = 1, 0
    for child in elt.childNodes:
        console.log(child)
        if child.nodeType == 3: # text
            offset = 0
            for mo in re.finditer('\n', child.nodeValue):
                yield (child, r, c, c + mo.start() - offset, offset)
                r += 1
                c = 0
                offset = mo.end()
            yield (child, r, c, c + len(child.nodeValue) - offset, offset)
            c += len(child.nodeValue)
        else:
            if (r, c) != (0, 0):
                r += 1
                c = 0
            child = child.firstChild
            console.log('firstchild', child, 'node value', child.nodeValue)
            text = child.nodeValue
            text = text if text.endswith('\n') else text + '\n'
            offset = 0
            for mo in re.finditer('\n', child.nodeValue):
                print('mo', mo)
                yield(child, r, c, c + mo.start() - offset, offset)
                r += 1
                c = 0
                offset = mo.end()
            yield (child, r, c, c + len(text) - offset, offset)
            c += len(text)


def text_nodes_1(elt):
    r, c = 1, 0
    pos = 0
    for child in elt.childNodes:
        console.log(child)
        if child.nodeType == 3: # text
            offset = 0
            yield ('text', child, pos)
            pos += len(child.nodeValue)
        else:
            #if (r, c) != (0, 0):
            #    pos += 1 # line feed for <div>
            child = child.firstChild
            yield('div', child, pos)
            pos += len(child.nodeValue)


def text_nodes(elt):
    for child in elt.childNodes:
        if child.nodeType == 3:
            yield ('text', child)
        elif child.nodeType == 1:
            yield ('div', child.firstChild)

def text_nodes_2(elt, pos, insert):
    # for each non-whitespace text node, yield a tuple
    # (text_pos, textNode, offset) where
    # - text_pos is the position of the stripped text in elt.innerText
    # - textNode is the text node
    # - offset is the position in textNode.nodeValue where the stripped text
    #   begins
    print('text_nodes_2\n', elt.innerHTML)
    text = ''
    offset = 0
    for nodeType, node in text_nodes(elt):
        console.log('node', node)
        nodeText = node.nodeValue
        if nodeText:
            if len(text) + len(nodeText) > pos:
                offset_in_node = pos - len(text)
                print('offset in node', offset_in_node)
                node.nodeValue = (node.nodeValue[:offset_in_node] + insert  +
                    node.nodeValue[offset_in_node:])
                return
            text += node.nodeValue


def build_nodes(elt):
    nodes = []
    line = 1
    text = ''
    for child in elt.childNodes:
        if child.nodeType == 3:
            lines = text.split('\n')
            start = (len(lines), len(lines[-1]))
            text += child.nodeValue
            lines = text.split('\n')
            end = (len(lines), len(lines[-1]))
            nodes.append((child, start, end))
        elif child.nodeType == 1:
            lines = text.split('\n')
            start = (len(lines), len(lines[-1]))
            text += child.text
            if child.nodeName == 'DIV' and not child.text.endswith('\n'):
                text += '\n'
            lines = text.split('\n')
            end = (len(lines), len(lines[-1]))
            nodes.append((child.firstChild, start, end))
        lines = text.split('\n')

    return nodes

class Text:

    def __init__(self, master, **kw):
        self.master = master
        self.kw = kw
        self.element = html.DIV(contenteditable=True,
            style='text-align:left;background-color:#fff;width:100%;white-space:pre;')

    def index(self, position):
        el = self.element
        if position is END:
            row = len(el.childNodes) - 1
            column = len(el.childNodes[row].nodeValue)
        elif position is INSERT:
            sel = window.getSelection()
            if sel.anchorNode is self.element:
                return self.index(END)
            else:
                text = ''
                for child in el.childNodes:
                    if child.nodeType == 3: # text
                        if child is sel.anchorNode:
                            text += child.nodeValue[:sel.anchorOffset]
                            lines = text.split('\n')
                            row = len(lines)
                            column = len(lines[-1])
                            break
                        else:
                            text += child.nodeValue
        elif isinstance(position, float):
            row, column = [int(x) for x in str(position).split('.')]
        elif isinstance(position, str):
            if '.' not in position:
                raise ValueError(f'bad text index "{position}"')
            row, column = position.split('.')
            row = int(row)
            if row <= 0:
                return [0, 0]
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
            row += delta_row
            lines = self.element.text.split('\n')
            row = min(row, len(lines))
            if column == 'end':
                line = lines[row - 1]
                column = len(line)
            else:
                line = lines[row - 1]
                column = min(len(line), int(column) + delta_column)
        return row, column

    def grid(self, **kwargs):
        td = grid(self.master, **kwargs)
        config(self, **self.kw)
        td <= self.element
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
        if position is END:
            self.element.text += text
        elif position is INSERT:
            sel = window.getSelection()
            if sel.anchorNode is self.element:
                self.insert(END, text, tags)
            else:
                nodeValue = sel.anchorNode.nodeValue
                sel.anchorNode.nodeValue = nodeValue[:sel.anchorOffset] + \
                    text + nodeValue[sel.anchorOffset:]
        else:
            row, column = self.index(position)
            lines = self.element.text.split('\n')
            row = min(row, len(lines))
            line = lines[row - 1]
            print('lines', lines)
            offset = sum(len(line) for line in lines[:row - 1]) + column
            print('offset of', row, column, ':', offset)
            text_nodes_2(self.element, offset, text)
            """
            for pos, text_node, text_offset in text_nodes_2(self.element, offset, text):
                node_len = len(text_node.nodeValue.strip())
                if pos <=  offset < pos + node_len:
                    print(f'({row},{column})', 'in text node', text_node,
                        f'\ncontent [{text_node.nodeValue}]',
                        '\n at pos in nodeValue', offset - pos)
                    node_offset = offset - pos
                    break


            text_node.nodeValue = text_node.nodeValue[:node_offset] + text + \
                text_node.nodeValue[node_offset:]
                """

    def show(self):
        print(self.element.innerHTML)

def mainloop():
    for item in _loops:
        item.mainloop()