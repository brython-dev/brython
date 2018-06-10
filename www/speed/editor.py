import sys
import time
import traceback
import dis

from browser import document as doc, window, alert, ajax
from javascript import JSObject

TIME_FORMAT_STRING = '%7s: %8.2f ms'

# set height of container to 66% of screen
_height = doc.documentElement.clientHeight
_s = doc['container']
_s.style.height = '%spx' % int(_height * 0.66)

has_ace = True
try:
    editor = window.ace.edit("editor")
    session = editor.getSession()
    session.setMode("ace/mode/python")

    editor.setOptions({
     'enableLiveAutocompletion': True,
     'enableSnippets': True,
     'highlightActiveLine': False,
     'highlightSelectedWord': True
    })
except:
    from browser import html
    editor = html.TEXTAREA(rows=20, cols=70)
    doc["editor"] <= editor
    def get_value(): return editor.value
    def set_value(x):editor.value = x
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

    def write(self, data):
        doc["console"].value += str(data)

    def flush(self):
        pass

sys.stdout = cOutput()
sys.stderr = cOutput()

def to_str(xx):
    return str(xx)

info = sys.implementation.version
doc['version'].text = '%s.%s.%s' % (info.major, info.minor, info.micro)

output = ''

def show_console(ev):
    doc["console"].value = output
    doc["console"].cols = 60

# load a Python script
def load_script(evt):
    _name = evt.target.value + '?foo=%s' % time.time()
    editor.setValue(open(_name).read())

def err_msg():
    doc["result"].html = "server didn't reply after %s seconds" %timeout

def on_complete(req):
    resp = float(req.text.strip())
    print(TIME_FORMAT_STRING % ('CPython', resp))
    result['CPython'] = resp

result = None

# run a script, in global namespace if in_globals is True
def run(in_globals=False):
    global output
    global result
    doc["console"].value = ''
    src = editor.getValue()
    if storage is not None:
       storage["py_src"] = src

    t0 = time.perf_counter()
    ns = {}
    try:
        if(in_globals):
            exec(src)
        else:
            exec(src, ns)
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    output = doc["console"].value

    brython_time = (time.perf_counter() - t0) * 1000.0


    print(TIME_FORMAT_STRING % ('Brython', brython_time))
    result = {'Brython': '%6.2f' % brython_time}

    # run with CPython
    req = ajax.ajax()
    req.bind('complete', on_complete)
    req.set_timeout(4, err_msg)
    req.open('POST', '/time_cpython', False)
    req.set_header('content-type','text/plain')
    req.send(src)

    # run Javascript version, if it exists
    js_src = None
    if in_globals:
        print('\nCan\'t run JS_CODE if in_globals is True')
    else:
        js_src = ns.get('JS_CODE')

    if js_src:
        t0 = time.perf_counter()
        window.eval(js_src)
        js_time = (time.perf_counter() - t0) * 1000.0
        print(TIME_FORMAT_STRING % ('JS', js_time))
        result['JS'] = '%6.2f' % js_time
    else:
        print('\nStore Javascript code in a global named JS_CODE and I will run it for you')

    return state, result

def show_js(ev):
    src = editor.getValue()
    doc["console"].value = dis.dis(src)

if has_ace:
    reset_src()
else:
    reset_src_area()
