import sys
import builtins

import tb as traceback

from browser import console, document, window, html, DOMNode
from browser.widgets.dialog import Dialog

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
                 globals=None, locals=None,
                 rows=30, cols=84, default_css=True,
                 clear_zone=True, banner=True):
        """
        Create the interpreter.
        - "elt_id" is the id of a textarea in the document. If not set, a new
          popup window is added with a textarea.
        - "globals" and "locals" are the namespaces the RPEL runs in
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
        self.current = 0
        self.history = []

        self.globals = {} if globals is None else globals
        self.globals.update(editor_ns)
        self.locals = self.globals if locals is None else locals

        self.buffer = ''
        sys.stdout.write = sys.stderr.write = self.write
        sys.stdout.__len__ = sys.stderr.__len__ = lambda: len(self.buffer)

        self.zone.bind('keypress', self.keypress)
        self.zone.bind('keydown', self.keydown)
        self.zone.bind('mouseup', self.mouseup)

        self.zone.focus()

    def cursor_to_end(self, *args):
        pos = len(self.zone.value)
        self.zone.setSelectionRange(pos, pos)
        self.zone.scrollTop = self.zone.scrollHeight

    def get_col(self):
        # returns the column num of cursor
        sel = self.zone.selectionStart
        lines = self.zone.value.split('\n')
        for line in lines[:-1]:
            sel -= len(line) + 1
        return sel

    def keypress(self, event):
        if event.keyCode == 9:  # tab key
            event.preventDefault()
            self.zone.value += "    "
        elif event.keyCode == 13:  # return
            sel_start = self.zone.selectionStart
            sel_end = self.zone.selectionEnd
            if sel_end > sel_start:
                # If text was selected by the mouse, copy to clipboard
                document.execCommand("copy")
                self.cursor_to_end()
                event.preventDefault() # don't insert line feed
                return
            src = self.zone.value
            if self._status == "main":
                currentLine = src[src.rfind('\n>>>') + 5:]
            elif self._status == "3string":
                currentLine = src[src.rfind('\n>>>') + 5:]
                currentLine = currentLine.replace('\n... ', '\n')
            else:
                currentLine = src[src.rfind('\n...') + 5:]
            if self._status == 'main' and not currentLine.strip():
                self.zone.value += '\n>>> '
                event.preventDefault()
                return
            self.zone.value += '\n'
            self.history.append(currentLine)
            self.current = len(self.history)
            if self._status in ["main", "3string"]:
                try:
                    _ = self.globals['_'] = eval(currentLine,
                                              self.globals,
                                              self.locals)
                    self.flush()
                    if _ is not None:
                        self.write(repr(_) + '\n')
                    self.flush()
                    self.zone.value += '>>> '
                    self._status = "main"
                except IndentationError:
                    self.zone.value += '... '
                    self._status = "block"
                except SyntaxError as msg:
                    if str(msg) == 'invalid syntax : triple string end not found' or \
                            str(msg).startswith('Unbalanced bracket'):
                        self.zone.value += '... '
                        self._status = "3string"
                    elif str(msg) == 'eval() argument must be an expression':
                        try:
                            exec(currentLine,
                                self.globals,
                                self.locals)
                        except:
                            self.print_tb()
                        self.flush()
                        self.zone.value += '>>> '
                        self._status = "main"
                    elif str(msg) == 'decorator expects function':
                        self.zone.value += '... '
                        self._status = "block"
                    else:
                        self.syntax_error(msg.args)
                        self.zone.value += '>>> '
                        self._status = "main"
                except:
                    # the full traceback includes the call to eval(); to
                    # remove it, it is stored in a buffer and the 2nd and 3rd
                    # lines are removed
                    self.print_tb()
                    self.zone.value += '>>> '
                    self._status = "main"
            elif currentLine == "":  # end of block
                block = src[src.rfind('\n>>>') + 5:].splitlines()
                block = [block[0]] + [b[4:] for b in block[1:]]
                block_src = '\n'.join(block)
                # status must be set before executing code in globals()
                self._status = "main"
                try:
                    _ = exec(block_src,
                             self.globals,
                             self.locals)
                    if _ is not None:
                        print(repr(_))
                except:
                    self.print_tb()
                self.flush()
                self.zone.value += '>>> '
            else:
                self.zone.value += '... '

            self.cursor_to_end()
            event.preventDefault()

    def keydown(self, event):
        if event.keyCode == 37:  # left arrow
            sel = self.get_col()
            if sel < 5:
                event.preventDefault()
                event.stopPropagation()
        elif event.keyCode == 36:  # line start
            pos = self.zone.selectionStart
            col = self.get_col()
            self.zone.setSelectionRange(pos - col + 4, pos - col + 4)
            event.preventDefault()
        elif event.keyCode == 38:  # up
            if self.current > 0:
                pos = self.zone.selectionStart
                col = self.get_col()
                # remove current line
                self.zone.value = self.zone.value[:pos - col + 4]
                self.current -= 1
                self.zone.value += self.history[self.current]
            event.preventDefault()
        elif event.keyCode == 40:  # down
            if self.current < len(self.history) - 1:
                pos = self.zone.selectionStart
                col = self.get_col()
                # remove current line
                self.zone.value = self.zone.value[:pos - col + 4]
                self.current += 1
                self.zone.value += self.history[self.current]
            event.preventDefault()
        elif event.keyCode == 8:  # backspace
            src = self.zone.value
            lstart = src.rfind('\n')
            if (lstart == -1 and len(src) < 5) or (len(src) - lstart < 6):
                event.preventDefault()
                event.stopPropagation()
        elif event.keyCode in [33, 34]: # page up, page down
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

    def print_tb(self):
        trace = Trace()
        traceback.print_exc(file=trace)
        self.zone.value += trace.format()

    def syntax_error(self, args):
        info, [filename, lineno, offset, line] = args
        print(f"  File {filename}, line {lineno}")
        print("    " + line)
        print("    " + offset * " " + "^")
        print("SyntaxError:", info)
        self.flush()

class Inspector(Interpreter):

    def __init__(self, title="Frames inspector",
                   rows=30, cols=84, default_css=True):
        frame = sys._getframe().f_back
        super().__init__(None, title,
                      globals=frame.f_globals.copy(),
                      locals=frame.f_locals.copy(),
                      rows=rows, cols=cols, default_css=default_css)

        frames_sel = html.SELECT()
        self.frames = []
        while frame:
            self.frames.append([frame.f_globals.copy(),
                                frame.f_locals.copy()])
            name = frame.f_code.co_name
            name = name.replace("<", "&lt;").replace(">", "&gt;")
            frames_sel <= html.OPTION(name)
            frame = frame.f_back
        frames_sel.bind("change", self.change_frame)
        frame_div = html.DIV("Frame " + frames_sel)
        panel_style = window.getComputedStyle(self.dialog.panel)
        frame_div.style.paddingLeft = panel_style.paddingLeft
        frame_div.style.paddingTop = panel_style.paddingTop
        self.dialog.insertBefore(frame_div, self.dialog.panel)

    def change_frame(self, ev):
        self.globals, self.locals = self.frames[ev.target.selectedIndex]

