import sys
import builtins
import re

import tb as traceback

from browser import console, document, window, html, DOMNode
from browser.widgets.dialog import Dialog

_credits = """    Thanks to CWI, CNRI, BeOpen.com, Zope Corporation and a cast of thousands
    for supporting Python development.  See www.python.org for more information."""

_copyright = """Copyright (c) 2012, Pierre Quentel pierre.quentel@gmail.com
All Rights Reserved.

Copyright (c) 2001-2022 Python Software Foundation.
All Rights Reserved.

Copyright (c) 2000 BeOpen.com.
All Rights Reserved.

Copyright (c) 1995-2001 Corporation for National Research Initiatives.
All Rights Reserved.

Copyright (c) 1991-1995 Stichting Mathematisch Centrum, Amsterdam.
All Rights Reserved."""

_help = "Type help() for interactive help, or help(object) for help about object."

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
    '__file__': '<stdin>',
    '__name__': '__main__'
}

# default style for console textarea
style_sheet = """
.brython-interpreter {
    background-color: #000;
    color: #fff;
    font-family: consolas, courier;
    caret-color: #fff;
    overflow-y: auto;
    overflow-x: hidden;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

pre{
    display:inline;
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

# ANSI-style color characters support
# cf. https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters

color_character_pattern = re.compile(r'^\033\[([0-9;]*)m')

def swap_color_bgcolor(element):
    """Used for color character 7: Revert"""
    element.style.color, element.style.backgroundColor = \
        element.style.backgroundColor, element.style.color

cc_styles = {
    0: ["fontStyle", "normal"],
    1: ["fontWeight", "bold"],
    2: ["fontWeight", "lighter"],
    3: ["fontStyle", "italic"],
    4: ["textDecoration", "underline"],
    5: ["animation", "blinker 1s step-start infinite"],
    6: ["animation", "blinker 0.5s step-start infinite"],
    7: swap_color_bgcolor
}

cc_colors = {
    30: "Black",
    31: "Red",
    32: "Green",
    33: "Yellow",
    34: "Blue",
    35: "Magenta",
    36: "Cyan",
    37: "White"
}

cc_bgcolors = {k + 10: v for (k, v) in cc_colors.items()}


class Trace:

    def __init__(self, exc):
        self.buf = ""
        self.is_syntax_error = exc.__name__ in ['SyntaxError',
                                                'IndentationError']

    def write(self, data):
        self.buf += str(data)

    def format(self):
        """Remove calls to function in this script from the traceback."""
        lines = self.buf.strip().split("\n")
        stripped = [lines[0]] if not self.is_syntax_error else ['']
        for i in range(1, len(lines), 2):
            if __file__ in lines[i]:
                continue
            stripped += lines[i: i+2]
        return "\n".join(stripped)


class Interpreter:
    """Add a Python interactive interpreter in a textarea."""

    def __init__(self, elt_id=None, title="Interactive Interpreter",
                 globals=None, locals=None, history=None,
                 rows=30, cols=120, default_css=True,
                 clear_zone=True, banner=True):
        """
        Create the interpreter.
        - "elt_id" is the id of a div in the document. If not set, a new
          popup window is added with a div.
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

        self.cc_style = None
        self.cc_color = None
        self.cc_bgcolor = None
        self.default_cc_color = '#fff'
        self.default_cc_bgcolor = '#000'

        if elt_id is None:
            self.dialog = Dialog(title=title, top=10, left=10,
                default_css=default_css)
            self.dialog.bind('blur', self.blur)
            self.dialog.bind('click', self.focus)
            self.dialog.close_button.bind('click', self.close)
            self.zone = html.DIV(Class="brython-interpreter",
                                 contenteditable=True)
            self.zone.style.width = f'{cols}ch'
            self.zone.style.height = f'{rows}ch'
            self.dialog.panel <= self.zone
        else:
            if isinstance(elt_id, str):
                try:
                    elt = document[elt_id]
                    if elt.tagName != "DIV":
                        raise ValueError(
                            f"element {elt_id} is a {elt.tagName}, " +
                            "not a DIV")
                    self.zone = elt
                except KeyError:
                    raise KeyError(f"no element with id '{elt_id}'")
            elif isinstance(elt_id, DOMNode):
                if elt_id.tagName == "DIV":
                    self.zone = elt_id
                else:
                    raise ValueError("element is not a DIV")
            else:
                raise ValueError("element should be a string or " +
                    f"a DIV, got '{elt_id.__class__.__name__}'")
            if self.zone.contentEditable != 'true':
                raise ValueError("DIV element must be contenteditable")
        v = sys.implementation.version
        if clear_zone:
            self.clear()
        if banner:
            self.insert(
                f"Brython {v[0]}.{v[1]}.{v[2]} on "
                f"{window.navigator.appName} {window.navigator.appVersion}"
                "\n"
            )
            self.insert('Type "help", "copyright", "credits" '
                                'or "license" for more information.' + '\n')
        self.insert_prompt()

        self._status = "main"
        self.history = history or []
        self.current = len(self.history)

        self.globals = {} if globals is None else globals
        self.globals.update(editor_ns)
        self.locals = self.globals if locals is None else locals

        self.zone.bind('keypress', self.keypress)
        self.zone.bind('keydown', self.keydown)
        self.zone.bind('mouseup', self.mouseup)

        self.zone.bind('focus', self.focus)
        self.zone.bind('blur', self.blur)
        self.focus()

        self.cursor_to_end()

        active.append(self)

    def clear(self):
        self.zone.text = ''

    def insert(self, text):
        # used for header text and prompts
        pre = html.PRE(style="display:inline;white-space:pre-wrap;")
        pre.text = text
        if self.cc_color is not None:
            pre.style.color = self.cc_color
        if self.cc_bgcolor is not None:
            pre.style.backgroundColor = self.cc_bgcolor
        if self.cc_style is not None:
            style = cc_styles[self.cc_style]
            if isinstance(style, list):
                attr, value = style
                setattr(pre.style, attr, value)
            else:
                style(pre)
        self.zone <= pre

    def insert_prompt(self):
        self.insert('>>> ')

    def insert_continuation(self):
        self.insert('\n... ')

    def insert_cr(self):
        self.insert('\n')

    def get_content(self):
        return self.zone.text

    def blur(self, ev):
        if hasattr(self, 'dialog'):
            self.dialog.style.zIndex = 0

    def close(self, ev):
        active.remove(self)

    def cursor_to_end(self, *args):
        # set caret at the end of last child
        sel = window.getSelection()
        # self.zone.lastChild is a PRE, take its internal text node
        last_child = self.zone.lastChild.firstChild
        if last_child is None: # issue 2175
            last_child = self.zone.lastChild
        pos = len(last_child.text)
        # put caret at the end of text
        sel.setBaseAndExtent(last_child, pos, last_child, pos)
        # make sure last line is visible
        self.zone.lastChild.scrollIntoView()

    def focus(self, *args):
        """When the interpreter gets focus, set sys.stdout and stderr"""
        if hasattr(self, 'dialog'):
            # put other active windows in the background
            for w in active:
                if w is not self:
                    w.dialog.style.zIndex = 0
            self.dialog.style.zIndex = 1
        sys.stdout = sys.stderr = Output(self)
        self.zone.focus()

    def keypress(self, event):
        if event.key == "Tab":
            event.preventDefault()
            self.insert("    ")
        elif event.key == "Enter":
            event.preventDefault() # don't insert line feed yet
            selection = window.getSelection().toString()
            if selection:
                # If text was selected by the mouse, copy to clipboard
                self.cursor_to_end()
                return
            self.handle_line(event)

    def feed(self, src):
        """src is Python source code, possibly on several lines.
        Simulate typing the code in the interpreter.
        Can be used for debugging, or showing how a code snippet executes.
        """
        current_indent = 0
        lines = src.strip().split('\n')
        for line in lines:
            self.insert(line)
            self.handle_line()

    def add_to_history(self, line):
        self.history.append(line)

    def handle_line(self, event=None):
        src = self.get_content().strip()
        if self._status == "main":
            currentLine = src[src.rfind('\n>>>') + 5:]
        elif self._status in ["3string", "parenth_expr"]:
            currentLine = src[src.rfind('\n>>>') + 5:]
            currentLine = currentLine.replace('\n... ', '\n')
        else:
            currentLine = src[src.rfind('\n...') + 5:]
        if self._status == 'main' and not currentLine.strip():
            self.insert_cr()
            self.insert_prompt()
            self.cursor_to_end()
            if event is not None:
                event.preventDefault()
            return
        self.add_to_history(currentLine)
        self.current = len(self.history)
        if self._status in ["main", "3string", "parenth_expr"]:
            # special case
            if currentLine == "help":
                self.write(_help)
                self.insert_prompt()
                if event is not None:
                    event.preventDefault()
                return
            try:
                code = compile(currentLine, '<stdin>', 'eval')
            except IndentationError:
                self.insert_continuation()
                self._status = "block"
            except SyntaxError as msg:
                if str(msg).startswith('unterminated triple-quoted string literal'):
                    self.insert_continuation()
                    self._status = "3string"
                elif str(msg) == 'decorator expects function':
                    self.insert_continuation()
                    self._status = "block"
                elif str(msg).endswith('was never closed'):
                    self.insert_continuation()
                    self._status = "parenth_expr"
                else:
                    try:
                        code = compile(currentLine, '<stdin>', 'exec')
                        exec(code, self.globals, self.locals)
                    except SyntaxError as exc:
                        if exc.args[0].startswith('expected an indented block'):
                            self.insert_continuation()
                            self._status = "block"
                        else:
                            self.insert_cr()
                            self.print_tb(exc)
                            self.insert_prompt()
                    except Exception as exc:
                        self.insert_cr()
                        self.print_tb(msg)
                        self.insert_prompt()
                        self._status = "main"
                    else:
                        self.insert_cr()
                        self.insert_prompt()
                        self._status = "main"
            except Exception as exc:
                # the full traceback includes the call to eval(); to
                # remove it, it is stored in a buffer and the 2nd and 3rd
                # lines are removed
                self.print_tb(exc)
                self.insert_prompt()
                self._status = "main"
            else:
                self.insert_cr()
                try:
                    self.globals['_'] = eval(code,
                                              self.globals,
                                              self.locals)
                    if self.globals['_'] is not None:
                        self.write(repr(self.globals['_']) + '\n')
                    self.insert_prompt()
                    self._status = "main"
                except Exception as exc:
                    self.print_tb(exc)
                    self.insert_prompt()
                    self._status = "main"

        elif currentLine == "":  # end of block
            block = src[src.rfind('\n>>>') + 5:].splitlines()
            block = [block[0]] + [b[4:] for b in block[1:]]
            block_src = '\n'.join(block)
            self.insert_cr()
            mode = eval if self._status == "parenth_expr" else exec
            # status must be set before executing code in globals()
            self._status = "main"
            if mode is eval:
                try:
                    self.globals['_'] = eval(block_src,
                                              self.globals,
                                              self.locals)
                    if self.globals['_'] is not None:
                        self.write(repr(self.globals['_']) + '\n')
                    self._status = "main"
                except Exception as exc:
                    self.print_tb(exc)
                    self._status = "main"
            else:
                try:
                    mode(block_src, self.globals, self.locals)
                except Exception as exc:
                    self.print_tb(exc)
            self.insert_prompt()

        else:
            self.insert_continuation()

        self.cursor_to_end()
        if event is not None:
            event.preventDefault()

    def keydown(self, event):
        sel = window.getSelection()
        if event.key in ("ArrowLeft", "Backspace"):
            # make sure the caret does not reach the prompt
            if sel.anchorNode is not self.zone:
                caret_column = sel.anchorOffset
                if caret_column >= 5:
                    return
            event.preventDefault()
            event.stopPropagation()
        elif event.key == "Home":
            anchor = sel.anchorNode
            sel.setBaseAndExtent(anchor, 4, anchor, 4)
            event.preventDefault()
            event.stopPropagation()
        elif event.key == "ArrowUp":
            if self.current > 0:
                last_child = self.zone.lastChild
                last_child.text = last_child.text[:4] + self.history[self.current - 1]
                self.current -= 1
                self.cursor_to_end()
            event.preventDefault()
        elif event.key == "ArrowDown":
            if self.current < len(self.history) - 1:
                self.current += 1
                last_child = self.zone.lastChild
                last_child.text = last_child.text[:4] + self.history[self.current]
                self.cursor_to_end()
            event.preventDefault()
        elif event.key in ["PageUp", "PageDown"]:
            event.preventDefault()

    def mouseup(self, ev):
        """If nothing was selected by the mouse, set cursor to end of zone"""
        sel = window.getSelection()
        if sel.type == 'Caret':
            self.cursor_to_end()

    def write(self, data):
        """Use for stdout / stderr."""
        data = str(data)
        mo = color_character_pattern.search(data)
        if mo:
            data = data[mo.end():]
            last_child = self.zone.lastChild
            if not mo.groups()[0]:
                tags = []
            else:
                tags = mo.groups()[0].split(';')
            self.cc_style = 0
            self.cc_color = self.default_cc_color
            self.cc_bgcolor = self.default_cc_bgcolor
            for tag in tags:
                tag = int(tag)
                if tag in cc_styles:
                    self.cc_style = tag
                elif tag in cc_colors:
                    self.cc_color = cc_colors[tag]
                elif tag in cc_bgcolors:
                    self.cc_bgcolor = cc_bgcolors[tag]
        self.insert(data)
        self.cursor_to_end()

    def print_tb(self, exc):
        trace = Trace(exc)
        traceback.print_exc(file=trace)
        self.write(trace.format().lstrip())
        self.insert_cr()


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

