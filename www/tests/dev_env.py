import sys
import traceback

from browser import document, window, alert, console, prompt, html, highlight
from browser.template import Template

IDB = window.indexedDB

def create_db(*args):
    # The database did not previously exist, so create object store.
    db = request.result
    store = db.createObjectStore("scripts", {"keyPath": "name"})

def show(ev):
    global scripts
    db = request.result
    tx = db.transaction("scripts", "readonly")
    store = tx.objectStore("scripts")
    cursor = store.openCursor()

    scripts = []
    def add_row(ev):
        """Add a row to the table for each iteration on cursor
        When cursor in empty, add a line for new record insertion
        """
        res = ev.target.result
        if res:
            scripts.append(res.value.name)
            getattr(res, "continue")()
        else:
            scripts.sort()
            print(scripts)

    cursor.bind('success', add_row)

request = IDB.open("brython_scripts")

# If database doesn't exist, create it
request.bind('upgradeneeded', create_db)

def load(evt, elt):
    global scripts
    db = request.result
    tx = db.transaction("scripts", "readonly")
    store = tx.objectStore("scripts")
    cursor = store.openCursor()

    dialog_window.style.display = "block"
    dialog.clear()

    dialog_title = dialog_window.select_one(".dialog_title")
    dialog_title.clear()
    dialog_title <= html.SPAN("Open file...")

    scripts = []
    def get_scripts(evt):
        res = evt.target.result
        if res:
            scripts.append(res.value.name)
            getattr(res, "continue")()
        else:
            scripts.sort()
            for script in scripts:
                dialog <= html.SPAN(script) + html.BR()
            for elt in dialog.childNodes:
                elt.bind("click", open_script)

    cursor.bind('success', get_scripts)

def draw_file_browser():
    filebrowser.clear()
    open_scripts.sort()
    filebrowser <= (html.SPAN(s) + html.BR() for s in open_scripts)
    for span in filebrowser.select("span"):
        span.bind("click", open_script)
        if span.text.strip() == current:
            span.style.backgroundColor = "#888"

def print_line_nums():
    content = editor.text
    linenum.clear()
    linenum.text = "\n".join(str(i) for i in range(1, content.count("\n")))

def open_script(evt):
    global current
    current = evt.target.text
    db = request.result
    tx = db.transaction("scripts", "readonly")
    store = tx.objectStore("scripts")
    req = store.get(current)

    def success(evt):
        if not hasattr(req, "result"):
            print("not found")
        else:
            pre = highlight.highlight(req.result.content)
            editor.html = pre.html
            if not current in open_scripts:
                open_scripts.append(current)
            draw_file_browser()
            print_line_nums()

    dialog_window.style.display = "none"

    req.bind("success", success)

def save_as(evt, elt):
    global current
    name = prompt("Name")
    if name:
        db = request.result
        tx = db.transaction("scripts", "readwrite")
        store = tx.objectStore("scripts")
        cursor = store.openCursor()
        data = {"name": name, "content": editor.text}
        store.put(data)

        # when record is added, show message
        def ok(evt):
            alert("saved")
            current = name
            if not name in open_scripts:
                open_scripts.append(name)
            draw_file_browser()

        cursor.bind('success', ok)

def save(evt, elt):
    pass

def size_up(evt, elt):
  if document.body.style.fontSize == "":
      document.body.style.fontSize = "12px"
  fsize = int(document.body.style.fontSize.strip("px"))
  fsize += 1
  document.body.style.fontSize = f"{fsize}px"

def size_down(evt, elt):
  if document.body.style.fontSize == "":
      document.body.style.fontSize = "12px"
  fsize = int(document.body.style.fontSize.strip("px"))
  fsize -= 1
  document.body.style.fontSize = f"{fsize}px"

def run(evt, elt):
    output_window.style.display = "block"
    output.html = ""
    exec(editor.text)

def clear(evt, elt):
    output.value = ""

width = window.innerWidth
height = window.innerHeight

tmpl = Template("content",
    [run, clear, load, save, save_as, size_up, size_down])
tmpl.render(height=int(0.7 * height))

output_window = document["output_window"]
output_window.style.left = int(0.2 * width)
output_window.style.top = int(0.2 * height)
output_window.style.width = f"{int(0.6 * width)}px"
output_window.style.height = f"{int(0.6 * height)}px"

dialog_window = document["dialog_window"]
dialog_window.style.top = f"{int(0.2 * height)}px"
dialog_window.style.left = f"{int(0.2 * width)}px"
dialog_window.style.width = f"{int(0.6 * width)}px"
dialog_window.style.height = f"{int(0.6 * height)}px"

dialog = document["dialog"]

filebrowser = document["filebrowser"]
scripts = []
open_scripts = []

def close_window(evt):
    button = evt.target
    w = button.closest("div")
    w.style.display = "none"

for btn in document.select(".dialog_close"):
    btn.bind("click", close_window)

delta = [0, 0]
moving = None

def drag_start(evt):
    global moving, delta
    moving = evt.target.closest("div")
    delta = [evt.x, evt.y]
    evt.preventDefault()
    evt.stopPropagation()

def drag(evt):
    if moving is not None:
        dx, dy = evt.x - delta[0], evt.y - delta[1]
        pos = offset[moving.id]
        pos[0] += dx
        pos[1] += dy
        delta[0] = evt.x
        delta[1] = evt.y
        moving.style.transform = "translate({}px,{}px)".format(*pos)
    evt.preventDefault()
    evt.stopPropagation()

def drop(evt):
    global moving
    moving = None
    evt.preventDefault()
    evt.stopPropagation()

offset = {}
for bar in document.select(".dialog_bar"):
    div = bar.closest("div")
    offset[div.id] = [0, 0]
    bar.bind("mousedown", drag_start)
    bar.bind("mousemove", drag)
    bar.bind("mouseup", drop)
    bar.bind("mouseout", drop)

output = document["output"]
editor = document["editor"]
linenum = document["linenum"]

class Output:

    def write(self, *args):
        for arg in args:
            output.text += str(arg)

sys.stdout = Output()
