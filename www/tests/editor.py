import sys
import time
import binascii

import tb as traceback
import javascript

from browser import console, document, window, alert, bind, html
import browser.widgets.dialog as dialog

# set height of container to 75% of screen
_height = document.documentElement.clientHeight
_s = document['container']
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
    document["editor"] <= editor
    def get_value(): return editor.value
    def set_value(x): editor.value = x
    editor.getValue = get_value
    editor.setValue = set_value
    has_ace = False

if hasattr(window, 'localStorage'):
    from browser.local_storage import storage
else:
    storage = None

if 'set_debug' in document:
    __BRYTHON__.debug = int(document['set_debug'].checked)

def reset_src():
    if "code" in document.query:
        code = document.query.getlist("code")[0]
        editor.setValue(code)
    else:
        if storage is not None and "py_src" in storage:
            editor.setValue(storage["py_src"])
        else:
            editor.setValue('for i in range(10):\n\tprint(i)')
        if "py_test" in storage and 'files' in document:
            document['files'].selectedIndex = int(storage["py_test"])
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
        self.cons = document["console"]
        self.buf = ''

    def write(self, data):
        self.buf += str(data)

    def flush(self):
        self.cons.value += self.buf
        self.buf = ''

    def __len__(self):
        return len(self.buf)

if "console" in document:
    cOut = cOutput()
    sys.stdout = cOut
    sys.stderr = cOut


def to_str(xx):
    return str(xx)

info = sys.implementation.version
version = '%s.%s.%s' % (info.major, info.minor, info.micro)
if info.releaselevel == "rc":
    version += f"rc{info.serial}"
document['version'].text = version

output = ''

def clear_console():
    document["console"].value = ''

def show_console(ev):
    document["console"].value = output
    document["console"].cols = 60

# load a Python script
def load_script(evt):
    _name = evt.target.value
    editor.setValue(open(_name).read())

def trace_exc(run_frame, src, ns):
    result_lines = []
    exc_type, exc_value, traceback = sys.exc_info()

    if __BRYTHON__.debug > 1:
        console.log(exc_value)

    def handle_repeats(filename, lineno, count_repeats):
        if count_repeats > 0:
            for _ in range(2):
                result_lines.append(f'  File {filename}, line {lineno}')
                show_line(filename, lineno, src)
            result_lines.append(f'[Previous line repeated {count_repeats - 2}' +
                ' more times]')

    def show_line(filename, lineno, src):
        if filename == ns['__file__']:
            source = src
        elif filename.startswith('<'):
            return '-- from ' + filename
        else:
            src = open(filename, encoding='utf-8').read()
        lines = src.split('\n')
        line = lines[lineno - 1]
        result_lines.append('    ' + line.strip())
        return line

    started = False
    save_filename = None
    save_lineno = None
    same_line = False
    count_repeats = 0

    while traceback:
        frame = traceback.tb_frame
        # don't show the frames above that of the "run" function
        if frame is run_frame:
            started = True
            result_lines.append('Traceback (most recent call last):')
        elif started:
            lineno = frame.f_lineno
            filename = frame.f_code.co_filename
            if filename == save_filename and lineno == save_lineno:
                count_repeats += 1
                traceback = traceback.tb_next
                continue
            handle_repeats(save_filename, save_lineno, count_repeats)
            count_repeats = 0
            save_filename = filename
            save_lineno = lineno
            name = frame.f_code.co_name
            result_lines.append(f'  File {filename}, line {lineno}, in {name}')
            show_line(filename, lineno, src)
        traceback = traceback.tb_next

    handle_repeats(save_filename, save_lineno, count_repeats)

    if isinstance(exc_value, SyntaxError):
        filename = exc_value.args[1][0]
        lineno = exc_value.args[1][1]
        result_lines.append(f'  File {filename}, line {lineno}')
        line = exc_value.text
        if line:
            result_lines.append('    ' + line.strip())
            indent = len(line) - len(line.lstrip())
            col_offset = exc_value.args[1][2]
            result_lines.append('    ' +  (col_offset - indent - 1) * ' ' + '^')

    result_lines.append(f'{exc_type.__name__}: {exc_value}')
    return '\n'.join(result_lines)

def run(src, filename='editor'):
    t0 = time.perf_counter()
    msg = ''
    ns = {'__name__':'__main__', '__file__': filename}
    state = 1
    try:
        exec(src, ns)
    except Exception as exc:
        print(trace_exc(sys._getframe(), src, ns))
        state = 0
    t1 = time.perf_counter()
    return state, t0, t1, msg

def show_js(ev):
    src = editor.getValue()
    document["console"].value = javascript.py2js(src, '__main__')

def share_code(ev):
    src = editor.getValue()
    if len(src) > 2048:
        d = dialog.InfoDialog("Copy url",
                              f"code length is {len(src)}, must be < 2048",
                              style={"zIndex": 10},
                              ok=True)
    else:
        href = window.location.href.rsplit("?", 1)[0]
        query = document.query
        query["code"] = src
        url = f"{href}{query}"
        url = url.replace("(", "%28").replace(")", "%29")
        d = dialog.Dialog("Copy url")
        area = html.TEXTAREA(rows=0, cols=0)
        d.panel <= area
        area.value = url
        # copy to clipboard
        area.focus()
        area.select()
        document.execCommand("copy")
        d.remove()
        d = dialog.Dialog("Copy url")
        d.panel <= html.DIV("url copied in the clipboard<br>Send it to share the code")
        buttons = html.DIV()
        ok = html.BUTTON("Ok")
        buttons <= html.DIV(ok, style={"text-align": "center"})
        d.panel <= html.BR() + buttons

        @bind(ok, "click")
        def click(evt):
            d.remove()

def reset():
    if has_ace:
        reset_src()
    else:
        reset_src_area()
