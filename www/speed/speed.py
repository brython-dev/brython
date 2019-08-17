import time
import sys
import dis
import traceback

from browser import document as doc, window, ajax, bind
from browser import timer
from browser.html import *
from browser.local_storage import storage

import javascript

# set version
info = sys.implementation.version
doc["version"].text = f"{info.major}.{info.minor}.{info.micro}"

# set height of container to 66% of screen
height = doc.documentElement.clientHeight
container = doc['container']
container.style.height = f'{int(height * 0.66)}px'

editor = window.ace.edit("editor")
editor.setTheme("ace/theme/solarized_light")
editor.session.setMode("ace/mode/python")
editor.focus()

editor.setOptions({
 'enableLiveAutocompletion': True,
 'highlightActiveLine': False,
 'highlightSelectedWord': True
})

class cOutput:
    """Class for sys.stdout and sys.stderr"""

    def write(self, data):
        doc["console"].value += str(data)

    def flush(self):
        pass

sys.stdout = cOutput()
sys.stderr = cOutput()

script_num = -1
failed = []
t_start = None

__BRYTHON__.debug = int(doc['set_debug'].checked)

def reset_src():
    if storage is not None and "py_src" in storage:
        editor.setValue(storage["py_src"])
    else:
        editor.setValue('for i in range(10):\n\tprint(i)')
    editor.scrollToRow(0)
    editor.gotoLine(0)

results = []

def forward(req):
    cpython_time = float(req.text)
    results[-1]['CPython'] = cpython_time
    print(f"CPython: {cpython_time:.2f}")
    test_next()

def no_forward(req):
    global save_console
    results[-1]['CPython'] = req.text
    print(f"CPython: {req.text}")
    save_console = doc["console"].value

def run_cpython(script_name, next_step):
    """Send an async POST Ajax call to run the CPython script.
    next_step is the function called when the Ajax call is complete."""
    ajax.post('/time_cpython',
        oncomplete=next_step,
        data=script_name,
        timeout=4)

def execute(option, src, callback):
    script_name = option.value
    doc["console"].value = ""
    src = editor.getValue()
    pos = src.find("JS_CODE")
    if pos > -1:
        src = src[:pos]
    result = {
        "test": script_name.split("/")[-1],
        "description": option.text,
        "src": src.strip()
        }
    storage["py_src"] = src

    t0 = time.perf_counter()

    try:
        exec(src, {})
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0

    brython_time = (time.perf_counter() - t0) * 1000.0
    result['Brython'] = brython_time
    print(f"Brython: {brython_time:.2f}")

    results.append(result)

    run_cpython(script_name, callback)

def test_next():
    global script_num, failed
    script_num += 1
    options = doc['files'].options

    if script_num < len(options):

        option = doc['files'].options[script_num]
        script_name = option.value

        doc["console"].value = script_name + "\n"

        src = open(option.value).read()
        doc['files'].selectedIndex = script_num
        editor.setValue(src)

        execute(option, src, forward)

    else:

        doc['console'].value = ''
        print('completed all tests in %.2f s' %(time.time() - t_start))
        print('failed : %s' %failed)

        w = window.open()

        head = w.document.get(selector="head")
        head[0] <= STYLE("*{font-family: Arial;}")

        body = w.document.body
        table = TABLE(border=1)
        table <= TR(TH('test') + TH('Brython'))

        for result in results:
            row = TR()
            row <= TD(result['test'])
            if "Brython" in result and "CPython" in result:
                row <= TD(int(100 * float(result['Brython']) / float(result['CPython'])),
                    align="right")
            else:
                row <= TD("missing result")
            table <= row
        version = '.'.join(str(x) for x in __BRYTHON__.implementation[:3])
        body <= H1(f"Brython {version} performance (base 100 = CPython)")
        body <= table

@bind("#clear", "click")
def clear(evt):
    """Clear console"""
    doc["console"].value = ""

@bind("#files", "change")
def load_script(evt):
    """Load a Python test script."""
    doc["run"].attrs["disabled"] = True
    script_name = evt.target.value + '?foo=%s' % time.time()

    def loaded(req):
        editor.setValue(req.text)
        doc["console"].value = ""
        # Enable "run" button.
        del doc["run"].attrs["disabled"]

    ajax.get(script_name, oncomplete=loaded, timeout=4)

@bind("#set_debug", "click")
def set_debug(ev):
    """Set Brython debug mode."""
    if ev.target.checked:
        __BRYTHON__.debug = 1
    else:
        __BRYTHON__.debug = 0

# Store console content
save_console = None

@bind("#show_js", "click")
def show_js(ev):
    """Show generated Javascript."""
    global save_console
    save_console = doc["console"].value
    src = editor.getValue()
    doc["console"].value = dis.dis(src)

@bind("#show_console", "click")
def show_console(evt):
    """Show last saved console content."""
    global save_console
    if save_console is not None:
        doc["console"].value = save_console
        save_console = None

@bind("#run", "click")
def run_script(evt):
    """Run a single script."""
    option = doc["files"].options[doc["files"].selectedIndex]
    src = editor.getValue()
    execute(option, src, no_forward)

@bind("#test_all", "click")
def test_all(evt):
    """Run whole test suite."""
    global script_num, failed, t_start, results
    script_num = -1
    t_start = time.time()
    failed = []
    results = []
    test_next()

# Simulate "change" event on files SELECT box to load the first script
change = window.MouseEvent.new("change")
doc["files"].dispatchEvent(change)
