import sys
import time
import traceback
import dis

from browser import document as doc, window, alert

Debugger = window.Brython_Debugger

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

    def set_value(x): editor.value = x
    editor.getValue = get_value
    editor.setValue = set_value
    has_ace = False


if hasattr(window, "localStorage"):
    from browser.local_storage import storage
else:
    storage = None


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


# run a script, in global namespace if in_globals is True
def run(in_globals=False):
    global output
    doc["console"].value = ''
    src = editor.getValue()
    if storage is not None:
        storage["py_src"] = src

    t0 = time.perf_counter()
    try:
        exec(src, {})
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    output = doc["console"].value

    print('<completed in %6.2f ms>' % ((time.perf_counter() - t0) * 1000.0))
    return state


def show_js(ev):
    src = editor.getValue()
    doc["console"].value = dis.dis(src)

if has_ace:
    reset_src()
else:
    reset_src_area()


def start_debugger(ev):
    doc["console"].value = ''
    src = editor.getValue()
    if storage is not None:
        storage["py_src"] = src

    Debugger.start_debugger(src, True)


def stop_debugger(ev):
    Debugger.stop_debugger()


def step_debugger(ev):
    if not Debugger.is_debugging():
        start_debugger()
    else:
        Debugger.step_debugger()


def step_back_debugger(ev):
        Debugger.step_back_debugger()


def debug_started(Debugger):
    doc['run'].disabled = True
    doc['debug'].disabled = True
    doc['step'].disabled = False
    doc['stop'].disabled = False
    editor.setHighlightActiveLine(True)
    if Debugger.is_recorded():
        if len(Debugger.get_recorded_states()) > 0:
            editor.gotoLine(Debugger.get_recorded_states()[0].next_line_no)
        else:
            doc['step'].disabled = True
    else:
        Debugger.step_debugger()


def debug_stoped(Debugger):
    doc['debug'].disabled = False
    doc['run'].disabled = False
    doc['step'].disabled = True
    doc['back'].disabled = True
    doc['stop'].disabled = True
    editor.setHighlightActiveLine(False)


def debug_step(state):

    doc["console"].value = str(state.stdout)

    editor.gotoLine(state.next_line_no)
    session.addGutterDecoration(state.next_line_no, 'active')

    if (Debugger.is_last_step()):
        doc['step'].disabled = True
    else:
        doc['step'].disabled = False
    if Debugger.is_first_step():
        doc['back'].disabled = True
    else:
        doc['back'].disabled = False


def debug_error(err, Debugger):
    doc['console'].value = str(err.data)
    if len(Debugger.get_recorded_states()) == 0:
        Debugger.stop_debugger()

Debugger.on_debugging_started(debug_started)
Debugger.on_debugging_end(debug_stoped)
Debugger.on_debugging_error(debug_error)
Debugger.on_step_update(debug_step)
