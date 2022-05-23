import sys
import builtins
import re

import tb as traceback

from browser import bind, console, document, window, html, DOMNode, worker, timer
from browser.widgets.dialog import Dialog, InfoDialog

if not hasattr(window, "SharedArrayBuffer"):
    InfoDialog("Not available",
        "This program cannot run because SharedArrayBuffer is not supported.<br>"
        "This is probably because your server does not set the required<br>"
        "HTTP headers:<br>"
        "cross-origin-embedder-policy= 'require-corp'<br>"
        "cross-origin-opener-policy= 'same-origin'")
    sys.exit()

py_worker = worker.Worker("python-worker")

class Trace:

    def __init__(self):
        self.buf = ""

    def write(self, data):
        self.buf += str(data)

    def format(self):
        """Remove calls to function in this script from the traceback."""
        lines = self.buf.split("\n")
        stripped = [lines[0]]
        for i in range(1, len(lines), 2):
            if __file__ in lines[i]:
                continue
            stripped += lines[i: i+2]
        return "\n".join(stripped)

def print_tb():
    trace = Trace()
    traceback.print_exc(file=trace)
    return trace.format()

class Buffer:
    value = None

def wake_up():
    # Called when the timer set by time.sleep terminates
    stdinbufferInt = window.Int32Array.new(Buffer.value)
    window.Atomics.notify(stdinbufferInt, 0, 1)

@bind(py_worker, "message")
def message(ev):
    data = ev.data
    console.log('main script receives', data)
    status = data["status"]
    if status == "main":
        if "result" in data:
            interpreter.zone.value += data['result'] + '\n'
        interpreter.zone.value += '>>> '
    elif status == "block" or status == "3string":
        interpreter.zone.value += '... '
    elif status == "stdin":
        Buffer.value = data["buffer"]
        interpreter.entry_start = interpreter.zone.selectionStart
    elif status == "print":
        args = data["args"]
        kw = data['kw']
        sep = kw.sep if hasattr(kw, 'sep') else ' '
        end = kw.end if hasattr(kw, 'end') else '\n'
        interpreter.write(sep.join(str(arg) for arg in data["args"]))
        interpreter.write(end)
        interpreter.flush()
    elif status == "syntax_error":
        args = data['args']
        interpreter.syntax_error(args)
        interpreter.zone.value += '>>> '
        status = "main"
    elif status == "error":
        interpreter.zone.value += data["value"]
        interpreter.zone.value += '>>> '
        status = "main"
    elif status == "sleep":
        seconds = data["seconds"]
        Buffer.value = data["buffer"]
        timer.set_timeout(wake_up, seconds * 1000)
        status = "main"

    interpreter._status = status

_credits = """    Thanks to CWI, CNRI, BeOpen.com, Zope Corporation and a cast of thousands
    for supporting Python development.  See www.python.org for more information."""

_copyright = """Copyright (c) 2012, Pierre Quentel pierre.quentel@gmail.com
All Rights Reserved.

Copyright (c) 2001-2013 Python Software Foundation.
All Rights Reserved.

Copyright (c) 2000 BeOpen.com.
All Rights Reserved.

Copyright (c) 1995-2001 Corporation for National Research Initiatives.
All Rights Reserved.

Copyright (c) 1991-1995 Stichting Mathematisch Centrum, Amsterdam.
All Rights Reserved."""

_license = """Copyright (c) 2012, Pierre Quentel pierre.quentel@gmail.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer. Redistributions in binary
form must reproduce the above copyright notice, this list of conditions and
the following disclaimer in the documentation and/or other materials provided
with the distribution.
Neither the name of the <ORGANIZATION> nor the names of its contributors may
be used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
"""



class Info:

    def __init__(self, msg):
        self.msg = msg

    def __repr__(self):
        return self.msg


# execution namespace
editor_ns = {
    'credits': Info(_credits),
    'copyright': Info(_copyright),
    'license': Info(_license),
    '__annotations__': {},
    '__builtins__': builtins,
    '__doc__': None,
    '__name__': '__main__'
}

# default style for console textarea
style_sheet = """
.brython-interpreter {
    background-color: #000;
    color: #fff;
    font-family: consolas, courier;
}
"""

active = []

class Output:

    def __init__(self, interpreter):
        self.interpreter = interpreter

    def write(self, *args, **kw):
        self.interpreter.write(*args, **kw)

    def __len__(self):
        return len(self.interpreter.buffer)

class Trace:

    def __init__(self):
        self.buf = ""

    def write(self, data):
        self.buf += str(data)

    def format(self):
        """Remove calls to function in this script from the traceback."""
        lines = self.buf.split("\n")
        stripped = [lines[0]]
        for i in range(1, len(lines), 2):
            if __file__ in lines[i]:
                continue
            stripped += lines[i: i+2]
        return "\n".join(stripped)


class Interpreter:
    """Add a Python interactive interpreter in a textarea."""

    def __init__(self, elt_id=None, title="Interactive Interpreter",
                 globals=None, locals=None, history=None,
                 rows=30, cols=84, default_css=True,
                 clear_zone=True, banner=True):
        """
        Create the interpreter.
        - "elt_id" is the id of a textarea in the document. If not set, a new
          popup window is added with a textarea.
        - "globals" and "locals" are the namespaces the RPEL runs in
        - "history", if set, must be a list of strings
        """
        if default_css:
            # Insert default CSS stylesheet if not already loaded
            for stylesheet in document.styleSheets:
                if stylesheet.ownerNode.id == "brython-interpreter":
                    break
            else:
                document <= html.STYLE(style_sheet, id="brython-interpreter")

        if elt_id is None:
            self.dialog = Dialog(title=title, top=10, left=10,
                default_css=default_css)
            self.dialog.bind('blur', self.blur)
            self.dialog.bind('click', self.focus)
            self.dialog.close_button.bind('click', self.close)
            self.zone = html.TEXTAREA(rows=rows, cols=cols,
                Class="brython-interpreter")
            self.dialog.panel <= self.zone
        else:
            if isinstance(elt_id, str):
                try:
                    elt = document[elt_id]
                    if elt.tagName != "TEXTAREA":
                        raise ValueError(
                            f"element {elt_id} is a {elt.tagName}, " +
                            "not a TEXTAREA")
                    self.zone = elt
                except KeyError:
                    raise KeyError(f"no element with id '{elt_id}'")
            elif isinstance(elt_id, DOMNode):
                if elt_id.tagName == "TEXTAREA":
                    self.zone = elt_id
                else:
                    raise ValueError("element is not a TEXTAREA")
            else:
                raise ValueError("element should be a string or " +
                    f"a TEXTAREA, got '{elt_id.__class__.__name__}'")
        v = sys.implementation.version
        if clear_zone:
            self.zone.value = ''
        if banner:
            self.zone.value += (
                f"Brython {v[0]}.{v[1]}.{v[2]} on "
                f"{window.navigator.appName} {window.navigator.appVersion}"
                "\n"
            )
        self.zone.value += ">>> "
        self.cursor_to_end()
        self._status = "main"
        self.history = history or []
        self.current = len(self.history)

        self.globals = {} if globals is None else globals
        self.globals.update(editor_ns)
        self.locals = self.globals if locals is None else locals

        self.buffer = ''
        self.zone.bind('keypress', self.keypress)
        self.zone.bind('keydown', self.keydown)
        self.zone.bind('mouseup', self.mouseup)

        self.zone.bind('focus', self.focus)
        self.zone.bind('blur', self.blur)
        self.zone.focus()

        active.append(self)

    def blur(self, ev):
        if hasattr(self, 'dialog'):
            self.dialog.style.zIndex = 0

    def close(self, ev):
        active.remove(self)

    def cursor_to_end(self, *args):
        pos = len(self.zone.value)
        self.zone.setSelectionRange(pos, pos)
        self.zone.scrollTop = self.zone.scrollHeight

    def focus(self, *args):
        """When the interpreter gets focus, set sys.stdout and stderr"""
        if hasattr(self, 'dialog'):
            # put other active windows in the background
            for w in active:
                if w is not self:
                    w.dialog.style.zIndex = 0
            self.dialog.style.zIndex = 1
        self.output = sys.stdout = sys.stderr = Output(self)
        self.zone.focus()

    def get_col(self):
        # returns the column num of cursor
        sel = self.zone.selectionStart
        lines = self.zone.value.split('\n')
        for line in lines[:-1]:
            sel -= len(line) + 1
        return sel

    def keypress(self, event):
        if event.key == "Tab":  # tab key
            event.preventDefault()
            self.zone.value += "    "
        elif event.key == "Enter":  # return
            sel_start = self.zone.selectionStart
            sel_end = self.zone.selectionEnd
            if sel_end > sel_start:
                # If text was selected by the mouse, copy to clipboard
                document.execCommand("copy")
                self.cursor_to_end()
                event.preventDefault() # don't insert line feed
                return
            src = self.zone.value
            self.handle_line(self, event)

    def feed(self, src):
        """src is Python source code, possibly on several lines.
        Simulate typing the code in the interpreter.
        Can be used for debugging, or showing how a code snippet executes.
        """
        current_indent = 0
        for line in src.split('\n'):
            mo = re.match('^\s*', line)
            indent = mo.end() - mo.start()
            current_indent = indent
            self.zone.value += line
            self.handle_line(line)

    def handle_line(self, code, event=None):
        src = self.zone.value
        if self._status == "main":
            currentLine = src[src.rfind('\n>>>') + 5:]
        elif self._status == "3string":
            currentLine = src[src.rfind('\n') + 5:]
        elif self._status == 'stdin':
            start = self.entry_start # set in message() to initial cursor pos
            currentLine = src[self.entry_start:]
        else:
            currentLine = src[src.rfind('\n...') + 5:]
        if self._status == 'main' and not currentLine.strip():
            self.zone.value += '\n>>> '
            if event is not None:
                event.preventDefault()
            return
        self.history.append(currentLine)
        self.current = len(self.history)
        if self._status == 'stdin':
            # set value of buffer and notify worker
            buffer = Buffer.value
            stdinbufferInt = window.Int32Array.new(buffer)
            input_bytes = currentLine.encode('utf-8')
            stdinbufferInt[0] = len(input_bytes)
            for i, byte in enumerate(input_bytes):
                stdinbufferInt[i + 1] = byte
            window.Atomics.notify(stdinbufferInt, 0, 1)
        else:
            py_worker.send(currentLine)

    def keydown(self, event):
        if event.key == "ArrowLeft":
            sel = self.get_col()
            if sel < 5:
                event.preventDefault()
                event.stopPropagation()
        elif event.key == "Home":
            pos = self.zone.selectionStart
            col = self.get_col()
            self.zone.setSelectionRange(pos - col + 4, pos - col + 4)
            event.preventDefault()
        elif event.key == "ArrowUp":
            if self.current > 0:
                pos = self.zone.selectionStart
                col = self.get_col()
                # remove current line
                self.zone.value = self.zone.value[:pos - col + 4]
                self.current -= 1
                self.zone.value += self.history[self.current]
            event.preventDefault()
        elif event.key == "ArrowDown":
            if self.current < len(self.history) - 1:
                pos = self.zone.selectionStart
                col = self.get_col()
                # remove current line
                self.zone.value = self.zone.value[:pos - col + 4]
                self.current += 1
                self.zone.value += self.history[self.current]
            event.preventDefault()
        elif event.key == "Backspace":
            src = self.zone.value
            lstart = src.rfind('\n')
            if (lstart == -1 and len(src) < 5) or (len(src) - lstart < 6):
                event.preventDefault()
                event.stopPropagation()
        elif event.key in ["PageUp", "PageDown"]:
            event.preventDefault()


    def mouseup(self, ev):
        """If nothing was selected by the mouse, set cursor to prompt."""
        sel_start = self.zone.selectionStart
        sel_end = self.zone.selectionEnd
        if sel_end == sel_start:
            self.cursor_to_end()

    def write(self, data):
        self.buffer += str(data)

    def flush(self):
        self.zone.value += self.buffer
        self.buffer = ''

    def syntax_error(self, args):
        info, [filename, lineno, offset, line, end_lineno, end_offset] = args
        print(f"  File {filename}, line {lineno}")
        print("    " + line)
        print("    " + offset * " " + "^" * (end_offset - offset))
        print("SyntaxError:", info)
        self.flush()

interpreter = Interpreter()

