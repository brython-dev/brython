import sys
import time
import binascii

import tb as traceback
import javascript

from browser import document as doc, window, alert, bind, html
from browser.widgets import dialog

# set height of container to 75% of screen
_height = doc.documentElement.clientHeight
_s = doc['container']
_s.style.height = '%spx' % int(_height * 0.85)

has_ace = True
try:
    editor = window.ace.edit("editor")
    editor.setTheme("ace/theme/solarized_light")
    editor.session.setMode("ace/mode/python")
    editor.focus()

    editor.setOptions({
     'enableLiveAutocompletion': True,
     'highlightActiveLine': False,
     'highlightSelectedWord': True
    })
except:
    from browser import html
    editor = html.TEXTAREA(rows=20, cols=70)
    doc["editor"] <= editor
    def get_value(): return editor.value
    def set_value(x): editor.value = x
    editor.getValue = get_value
    editor.setValue = set_value
    has_ace = False

if hasattr(window, 'localStorage'):
    from browser.local_storage import storage
else:
    storage = None

if 'set_debug' in doc:
    __BRYTHON__.debug = int(doc['set_debug'].checked)

def reset_src():
    if "code" in doc.query:
        code = doc.query.getlist("code")[0]
        editor.setValue(code)
    else:
        if storage is not None and "py_src" in storage:
            editor.setValue(storage["py_src"])
        else:
            editor.setValue('for i in range(10):\n\tprint(i)')
    editor.scrollToRow(0)
    editor.gotoLine(0)

def reset_src_area():
    if storage and "py_src" in storage:
        editor.value = storage["py_src"]
    else:
        editor.value = 'for i in range(10):\n\tprint(i)'


class cOutput:
    encoding = 'utf-8'

    def __init__(self):
        self.cons = doc["console"]
        self.buf = ''

    def write(self, data):
        self.buf += str(data)

    def flush(self):
        self.cons.value += self.buf
        self.buf = ''

    def __len__(self):
        return len(self.buf)

if "console" in doc:
    cOut = cOutput()
    sys.stdout = cOut
    sys.stderr = cOut


def to_str(xx):
    return str(xx)

info = sys.implementation.version
version = '%s.%s.%s' % (info.major, info.minor, info.micro)
if info.releaselevel == "rc":
    version += f"rc{info.serial}"
doc['version'].text = version

output = ''

def show_console(ev):
    doc["console"].value = output
    doc["console"].cols = 60

# load a Python script
def load_script(evt):
    _name = evt.target.value + '?foo=%s' % time.time()
    editor.setValue(open(_name).read())

# run a script, in global namespace if in_globals is True
def run(*args):
    global output
    doc["console"].value = ''
    src = editor.getValue()
    if storage is not None:
       storage["py_src"] = src

    t0 = time.perf_counter()
    try:
        ns = {'__name__':'__main__'}
        exec(src, ns)
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    sys.stdout.flush()
    output = doc["console"].value

    print('<completed in %6.2f ms>' % ((time.perf_counter() - t0) * 1000.0))
    return state

def show_js(ev):
    src = editor.getValue()
    doc["console"].value = javascript.py2js(src, '__main__')

def share_code(ev):
    src = editor.getValue()
    if len(src) > 2048:
        d = dialog.InfoDialog("Copy url",
                              f"code length is {len(src)}, must be < 2048",
                              style={"zIndex": 10},
                              ok=True)
    else:
        href = window.location.href.rsplit("?", 1)[0]
        query = doc.query
        query["code"] = src
        url = f"{href}{query}"
        url = url.replace("(", "%28").replace(")", "%29")
        d = dialog.Dialog("Copy url", style={"zIndex": 10})
        area = html.TEXTAREA(rows=0, cols=0)
        d.panel <= area
        area.value = url
        # copy to clipboard
        area.focus()
        area.select()
        doc.execCommand("copy")
        d.remove()
        d = dialog.Dialog("Copy url", style={"zIndex": 10})
        d.panel <= html.DIV("url copied<br>Send it to share the code")
        buttons = html.DIV()
        ok = html.BUTTON("Ok")
        buttons <= html.DIV(ok, style={"text-align": "center"})
        d.panel <= html.BR() + buttons

        @bind(ok, "click")
        def click(evt):
            d.remove()

if has_ace:
    reset_src()
else:
    reset_src_area()
