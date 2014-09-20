from browser import document, html, alert, local_storage
import ui, ui.dialog
import json
from ui_menu import Menu, BarItem, MenuListItem

ui.add_stylesheet()
storage = local_storage.storage

current_cell = None
current_cell_info = None

def entry_keydown(ev):
    global current_cell
    _input = ev.target
    cell = _input.parent
    is_arrow = ev.keyCode in [9, #tab
        37, # left
        39, # right
        38, #up
        40, #down
        13  # CR
        ]

    if is_arrow:
        update(cell)
        current_cell = None
        move_sel(ev)
        #document.bind('keydown', doc_keydown)

    elif ev.keyCode == 27: # escape
        update_current(cell.info['entry'])
        cell.remove(_input)
        cell.text = cell.value
        current_cell = None
        #document.bind('keydown', doc_keydown)

    ev.stopPropagation()

def entry_keyup(ev):
    update_current(current_cell.get(selector='INPUT')[0].value)

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
    current_cell.get(selector='INPUT')[0].value = ev.target.value
    if ev.keyCode == 13: # CR
        update(current_cell)
        current_cell = None
        ev.target.blur()
    elif ev.keyCode == 27: # escape
        update_current(current_cell.info['entry'])
        current_cell.clear()
        current_cell.text = current_cell.value
        current_cell = None
        ev.target.blur()
        
    ev.stopPropagation()

selected = None

def update(cell):
    # update the table, based on the last entry in specified cell
    content = cell.get(selector='INPUT')[0].value
    cell.info['entry'] = content
    if content.startswith('='):
        cell.text = eval(content[1:])
    else:
        cell.text = content
    
def doc_keydown(ev):
    is_arrow = ev.keyCode in [9, #tab
        37, # left
        39, # right
        38, #up
        40, #down
        13  # CR
        ]
    if is_arrow:
        move_sel(ev)
    elif ev.keyCode != 0:
        make_input(selected)

def move_sel(ev):
    cell = selected
    row = cell.parent
    cell_num = row.children.index(cell)
    row_num = row.parent.children.index(row)
    
    # jump to next cell
    if ev.keyCode==39 or (ev.keyCode==9 and not ev.shiftKey) or ev.keyCode==13:
        if cell_num<len(row.children)-1:
            next_cell = row.children[cell_num+1]
            mark_selected(next_cell)
    elif ev.keyCode==37 or (ev.keyCode==9 and ev.shiftKey):
        if cell_num>1:
            next_cell = row.children[cell_num-1]
            mark_selected(next_cell)
    elif ev.keyCode == 40:
        if row_num<len(row.parent.children)-1:
            next_cell = row.parent.children[row_num+1].children[cell_num]
            mark_selected(next_cell)
    elif ev.keyCode == 38:
        if row_num>1:
            next_cell = row.parent.children[row_num-1].children[cell_num]
            mark_selected(next_cell)

    ev.preventDefault()
    ev.stopPropagation()

def select(ev):
    global current_cell
    if current_cell is not None:
        update(current_cell)
        current_cell = None
    mark_selected(ev.target)

def mark_selected(cell):
    global selected
    if selected is not None:
        selected.style.borderColor = '#000'
        selected.style.borderWidth = '1px'
    cell.style.borderColor = 'blue'
    cell.style.borderWidth = '2px'
    selected = cell
    update_current(cell.info['entry'])
    
def deselect():
    global selected
    if selected is not None:
        selected.style.borderColor = '#000'
        selected.style.borderWidth = '1px'
    selected = None    

def entry(ev):
    make_input(ev.target, True)

def make_input(cell, keep_value=False):
    global current_cell
    if current_cell is not None:
        value = current_cell.get(selector='INPUT')[0].value
        current_cell.clear()
        current_cell.text = value
    value = cell.text.strip()
    
    # save value in case editing the cell is aborted by Escape
    cell.value = cell.text
    
    cell.clear()
    _input = html.INPUT(style={'padding':'0px'})
    if keep_value:
        _input.value = cell.info['entry']
    _input.style.width = '%spx' %100
    cell <= _input
    _input.bind('keydown', entry_keydown)
    _input.bind('keyup', entry_keyup)
    _input.bind('click', entry_click)
    document['current'].value = cell.info['entry']
    _input.focus()
    current_cell = cell
    mark_selected(cell)
        
# Functions to open/save spredsheets
prefix = 'brython_spreadsheet'

def sheet_names():
    return [ name[len(prefix):] for name in storage.keys()
        if name.startswith(prefix)]

def select_sheet(ev):
    menu_file.close()
    names = sheet_names()
    names.sort()
    
    if names:
        d = ui.dialog.SelectDialog("Open sheet...",
            "Sheet name",names, open_sheet)
    else:
        d = ui.dialog.Dialog()
        d.set_title("Error")
        d.set_body("No sheet found")
        return

def open_sheet(sheet_name):
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
    d = ui.dialog.EntryDialog("Save sheet as...","Name",save_sheet)
    d.entry.bind('keydown', lambda ev: ev.stopPropagation())

def confirm_override(widget):
    save_sheet_content(widget.sheet_name)

def save_sheet(sheet_name):
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

document.bind('keydown', doc_keydown)
document.bind('click', stop_menu)

menu_file = None

def load(sheet_name=None):
    global current_cell_info,menu_file
    
    if sheet_name is None:
        sheet_name = 'New document'

    panel = document['panel']
        
    title = html.DIV(style=dict(width='auto'))
    title <= html.H2(sheet_name, id="sheet_name")
    
    panel <= title
    
    menu = Menu()

    menu_file = BarItem(menu, 'File')
    MenuListItem(menu_file, 'New')
    MenuListItem(menu_file, 'Open...', select_sheet)
    MenuListItem(menu_file, 'Save as...', save_as)
  
    panel <= menu

    panel <= html.BR()
    cell_editor = html.INPUT(style=dict(width="200px"), Id="current")
    cell_editor.bind('click', enter_editor)
    cell_editor.bind('keydown', editor_keydown)
    cell_editor.bind('keyup', update_from_editor)
    panel <= cell_editor
    
    t = html.TABLE(Id="sheet_table")
    srow = -1
    rows, cols = 20, 20
    col_widths = [100 for i in range(rows)]
    
    line = html.TR()
    line <= html.TH()
    for i in range(cols):
        col_name = chr(65+i)
        line <= html.TH(col_name, style={'min-width':'%spx' %col_widths[i]})
    t <= line
        
    for i in range(rows*cols):
        row, column = divmod(i, cols)
        if row>srow:
            line = html.TR()
            line <= html.TH(row+1)
            t <= line
            srow = row
        cell = html.TD('',id='c%s_%s' %(row,column),style=dict(padding='2px'))
        cell.bind('click', select)
        cell.bind('dblclick', entry)
        cell.info = {'entry':''}
        line <= cell

    panel <= html.DIV(t,style=dict(float='left'))
    mark_selected(t.get(selector='TD')[0])

load()