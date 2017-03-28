from browser import document, window, html, alert, local_storage
import json

import ui

storage = local_storage.storage

current_cell = None
current_cell_info = None

def update_current(data):
    document['current'].value = data
    
def entry_click(ev):
    ev.stopPropagation()

# callbacks for cell editor
def enter_editor(ev):
    make_input(selected)
    ev.target.focus()
    current_cell.get(selector='INPUT')[0].value = ev.target.value
    ev.stopPropagation()

def editor_keydown(ev):
    ev.stopPropagation()
    
def update_from_editor(ev):
    global current_cell
    if ev.keyCode == 13: # CR
        current_cell = None
        ev.target.blur()
    elif ev.keyCode == 27: # escape
        update_current(current_cell.info['entry'])
        current_cell.clear()
        current_cell.text = current_cell.value
        current_cell = None
        ev.target.blur()
        
    #ev.stopPropagation()

selected = None

def update(cell):
    # update the table, based on the last entry in specified cell
    #content = cell.get(selector='INPUT')[0].value
    cell.info['entry'] = content
    if content.startswith('='):
        cell.text = eval(content[1:])
    else:
        cell.text = content
        
# Functions to open/save spredsheets
prefix = 'brython_spreadsheet'

def sheet_names():
    return [ name[len(prefix):] for name in storage.keys()
        if name.startswith(prefix)]

def select_sheet(ev):
    names = sheet_names()
    names.sort()
    
    if names:
        d = ui.Dialog("Open sheet...")
        d.add_ok_cancel(ok=open_sheet)
        d.body <= html.SPAN('File', style=dict(marginRight='10px'))
        d.body <= html.SELECT(html.OPTION(name) for name in names)
    else:
        d = ui.Dialog("Error")
        d.body <= "No sheet found"
    document <= d

def open_sheet(dialog):
    select = dialog.get(selector='select')[0]
    print(select)
    dialog.close()
    sheet_name = select.options[select.selectedIndex].value
    data = json.loads(storage['brython_spreadsheet%s' %sheet_name])
    print(data)

    document['panel'].clear()
    load(sheet_name)
    cells = []
    for row in document['sheet_table'].get(selector='TR')[1:]:
        cells.append([])
        for cell in row.get(selector='TD'):
            cells[-1].append(cell)
    for row, column, entry in data:
        cell = cells[row][column]
        cell.info = {'entry':entry}
        if not entry.startswith('='):
            cell.text = entry
        else:
            cell.text = eval(entry[1:])

def save_as(ev):
    d = ui.Dialog("Save sheet as...")
    d.add_ok_cancel(ok=save_sheet, cancel=cancel_save_as)
    d.body <= html.SPAN('File name', style=dict(marginRight='10px'))
    d.body <= html.INPUT()
    document.unbind('keydown')
    
    document <= d

def cancel_save_as(dialog):
    document.bind('keydown', doc_keydown)
    dialog.close()
    
def confirm_override(widget):
    save_sheet_content(widget.sheet_name)

def save_sheet(dialog):
    document.bind('keydown', doc_keydown)
    sheet_name = dialog.get(selector='input')[0].value
    if not sheet_name.strip():
        d = ui.dialog.Dialog()
        d.set_title("Error")
        d.set_body("No sheet name provided")
        return

    if sheet_name in sheet_names():
        d = ui.dialog.YesNoDialog("Save sheet",
            "A sheet named %s already exists. Override ?" %sheet_name,
            confirm_override,
            None)
        d.sheet_name = sheet_name
        return

    save_sheet_content(sheet_name)

def save_sheet_content(sheet_name):    
    info = []
    table = document['sheet_table']
    for i,row in enumerate(table.get(selector="TR")[1:]):
        print(row)
        for j, cell in enumerate(row.get(selector='TD')):
            if cell.info['entry']:
                info.append([i, j, cell.info['entry']])

    storage['brython_spreadsheet%s' %sheet_name] = json.dumps(info)
    document['sheet_name'].text = sheet_name
    
current_menu = None

def stop_menu(*args):
    global current_menu
    if current_menu:
        current_menu.close()
    current_menu = None

document.bind('click', stop_menu)

menu_file = None

RegExp = window.RegExp.new
String = window.String.new

def clear_selections():

    for klass in ("column-select", "selected", "row-select", "selection-top",
            "selection-bottom", "selection-left", "selection-right"):
        for cell in document.get(selector="."+klass):
            cell.classList.remove(klass)
    
mouseDown = 0
selected_line = None

class ColumnHead(html.TH):
    
    def __init__(self, *args, **kw):
        html.TH.__init__(self, *args, **kw)
        self.bind("mousedown", self.select_column)
        self.bind("mouseenter", self.enter)
        self.bind("mouseup", self.end_select_column)

    def select_column(self, ev):
        """Select cells in a column"""
        global mouseDown, selected_line

        # remove caret from selected cell        
        document.getSelection().removeAllRanges()

        selected_line = self
        mouseDown += 1
    
        clear_selections()
        Column(self).mark_cells()
        ev.preventDefault()
        ev.stopPropagation()

    def enter(self, ev):
        if not mouseDown:
            return
        # mark all columns between initially selected and the one 
        # we are entering
        clear_selections()
        col_start = Column(selected_line).col_num()
        this_col = Column(self).col_num()
        row = self.closest('tr')
        if this_col > col_start:
            for num in range(col_start, this_col+1):
                Column(row.childNodes[num]).mark_cells()
        elif this_col == col_start:
            Column(self).mark_cells()
        else:
            for num in range(this_col, col_start+1):
                Column(row.childNodes[num]).mark_cells()
    
    def end_select_column(self, ev):
        global mouseDown, selected_line
        mouseDown -= 1
        selected_line = None

class Column:
    
    def __init__(self, th):
        self.th = th

    def col_num(self):
        col = 0
        cell = self.th
        while cell.previousSibling:
            col += 1
            cell = cell.previousSibling
        return col

    def mark_cells(self):
        # column number
        col = self.col_num()

        rows = document.get(selector="tr")
        for row in rows[1:]:
            row.childNodes[col].classList.add("column-select")
    
class RowHead(html.TH):
    
    def __init__(self, *args, **kw):
        html.TH.__init__(self, *args, **kw)
        self.bind("mousedown", self.select_row)
        self.bind("mouseenter", self.enter)
        self.bind("mouseup", self.end_select_row)

    def col_num(self):
        col = 0
        cell = self
        while cell.previousSibling:
            col += 1
            cell = cell.previousSibling
        return col

    def select_row(self, ev):
        """Select all cells in a row"""
        global mouseDown, selected_line
        
        # remove caret from selected cell        
        document.getSelection().removeAllRanges()

        selected_line = self
        mouseDown += 1
    
        clear_selections()
        Row(self.closest('tr')).mark_cells()
        ev.preventDefault()
        ev.stopPropagation()

    def enter(self, ev):
        if not mouseDown:
            return
        # mark all rows between initially selected and the one 
        # we are entering
        clear_selections()
        row_start = Row(selected_line.closest('tr')).row_num()
        this_row = Row(self.closest('tr')).row_num()
        rows = document.get(selector='tr')
        if this_row > row_start:
            for num in range(row_start, this_row+1):
                Row(rows[num]).mark_cells()
        elif this_row == row_start:
            Row(rows[row_start]).mark_cells()
        else:
            for num in range(this_row, row_start+1):
                Row(rows[num]).mark_cells()
    
    def end_select_row(self, ev):
        global mouseDown
        mouseDown -= 1

class Row:
    
    def __init__(self, tr):
        self.tr = tr

    def row_num(self):
        row = 0
        tr = self.tr
        while tr.previousSibling:
            row += 1
            tr = tr.previousSibling
        return row

    def mark_cells(self):
        # column number
        for cell in self.tr.get(selector="td"):
            cell.classList.add("row-select")


def coords(td):
    row_num = Row(td.closest('tr')).row_num()
    col_num = 0
    cell = td
    while cell.previousSibling:
        col_num += 1
        cell = cell.previousSibling
    return col_num-1, row_num
        
class Cell(html.TD):
    
    def __init__(self, col_head):
        html.TD.__init__(self, contentEditable="true",
            style=dict(padding='2px'))
        self.col_head = col_head
        self.bind("mousedown", self.select)
        self.bind("mouseenter", self.mousemove)
        self.bind("mouseleave", self.mousemove)
        self.bind("mouseup", self.mouseup)
        self.bind("focus", self.focus)
        self.bind("keydown", self.keydown)
        self.bind("keyup", self.keyup)
        self.bind("blur", self.blur)

    def blur(self, ev):
        # check cells with formulas
        for cell in document.get(selector="td"):
            if cell.text.startswith("="):
                formula = cell.text[1:]
                pattern = RegExp("([A-Z]+)([0-9]+)", "g")
                print(formula, String(formula).replace(pattern, 'cell("$1$2")'))
            
    def extend_selection(self, ev):
        # mark all cells from selected to ev.target
        clear_selections()
        c0, r0 = coords(selected)
        c1, r1 = coords(ev.target)
        if c0 > c1:
            c0, c1 = c1, c0
        if r0 > r1:
            r0, r1 = r1, r0
        rows = document.get(selector="tr")
        for cell in rows[r0].get(selector="td")[c0:c1+1]:
            cell.classList.add("selection-top")
        for cell in rows[r1].get(selector="td")[c0:c1+1]:
            cell.classList.add("selection-bottom")
        for row in rows[r0:r1+1]:
            row.childNodes[c0+1].classList.add("selection-left")
            row.childNodes[c1+1].classList.add("selection-right")

    def select(self, ev):
        global selected, mouseDown
        
        clear_selections()
        self.classList.add("selected")
        mouseDown += 1
        selected = self
        selected.focus()

    def focus(self, ev):
        """Cell gets focus"""
        # save initial value in case user hits the Escape key
        self.initial = self.text
        # set position cursor at text end
        _range = document.createRange()
        sel = window.getSelection()
        if len(self.childNodes):
            _range.setStart(self.firstChild, len(self.text))
            _range.collapse(True)
            sel.removeAllRanges()
            sel.addRange(_range)
        document["current"].text = self.text
    
    def keyup(self, ev):
        document["current"].text = self.text

    def keydown(self, ev):
        if ev.keyCode in [
                9, #tab
                37, # left
                39, # right
                38, # up
                40, # down
                13, # CR
                27  # escape
            ]:
            self.move_sel(ev)
    
    def mousemove(self, ev):
        if mouseDown and selected_line is None:
            self.extend_selection(ev)

    def mouseup(self, ev):
        global mouseDown
        mouseDown = 0

    def move_sel(self, ev):
        cell = selected
        row = cell.closest("tr")
        table = cell.closest("table")
        
        # jump to next cell
        if ev.keyCode==39 or (ev.keyCode==9 and not ev.shiftKey):
            # right
            next_cell = cell.nextSibling or cell
            self.mark_selected(next_cell)
        elif ev.keyCode==37 or (ev.keyCode==9 and ev.shiftKey):
            # left
            if cell.previousSibling.previousSibling:
                self.mark_selected(cell.previousSibling)
        elif ev.keyCode in [40, 13, 38]:
            # down or CR or up
            # get column number
            col = 0
            while cell.previousSibling:
                col += 1
                cell = cell.previousSibling
            if ev.keyCode == 38:
                # up
                if row.previousSibling.previousSibling:
                    next_row = row.previousSibling
                else:
                    next_row = row
            else:
                # down or CR
                next_row = row.nextSibling or row
            next_cell = next_row.childNodes[col]
            self.mark_selected(next_cell)
        elif ev.keyCode == 27:
            # escape
            cell.text = cell.initial
    
        ev.preventDefault()
        ev.stopPropagation()

    def mark_selected(self, td):
        global selected
        selected = td
        if not mouseDown:
            clear_selections()
        td.classList.add('selected')
        td.focus()

def load(sheet_name=None):
    global current_cell_info,menu_file
    
    panel = document['panel']

    cell_editor = html.DIV("A",
        style=dict(width="25%", padding="5px", marginBottom="20px", 
            height="1.5em"), 
        Id="current",
        contentEditable="true",
        Class="selected")
    cell_editor.bind('click', enter_editor)
    cell_editor.bind('keydown', editor_keydown)
    cell_editor.bind('keyup', update_from_editor)
    panel <= cell_editor
    
    t = html.TABLE(Id="sheet_table")
    srow = -1
    rows, cols = 20, 20
    col_widths = [100 for i in range(rows)]
    
    col_heads = html.TR()
    col_heads <= html.TH()
    for i in range(cols):
        col_name = chr(65+i)
        col_heads <= ColumnHead(col_name, Class="col-head",
            style={'min-width':'%spx' %col_widths[i]})
    t <= col_heads
        
    for i in range(rows * cols):
        row, column = divmod(i, cols)
        if row > srow:
            line = html.TR()
            line <= RowHead(row + 1, Class="row-head")
            t <= line
            srow = row

        line <= Cell(col_heads.children[column + 1])

    panel <= html.DIV(t, style=dict(float='left'))

    t.get(selector='TD')[0].dispatchEvent(window.MouseEvent.new("click"))

load()
