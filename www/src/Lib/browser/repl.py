import sys
import tb as traceback

from browser import document, window

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

def credits():
    print(_credits)
credits.__repr__ = lambda:_credits

def copyright():
    print(_copyright)
copyright.__repr__ = lambda:_copyright

def license():
    print(_license)
license.__repr__ = lambda:_license

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


# execution namespace
editor_ns = {
    'credits':credits,
    'copyright':copyright,
    'license':license,
    '__name__':'__main__'
}

class Repl:

    def __init__(self, elt_id):
        self.zone = document[elt_id]
        self.zone.bind('keypress', self.myKeyPress)
        self.zone.bind('keydown', self.myKeyDown)
        self.zone.bind('click', self.cursorToEnd)
        v = sys.implementation.version
        self.zone.value = "Brython %s.%s.%s on %s %s\n>>> " % (
            v[0], v[1], v[2], window.navigator.appName, window.navigator.appVersion)
        self.zone.focus()
        self.cursorToEnd()
        self._status = "main"
        self.current = 0
        self.history = []

        self.buffer = ''
        sys.stdout.write = sys.stderr.write = self.write
        sys.stdout.__len__ = sys.stderr.__len__ = lambda: len(self.buffer)

    def cursorToEnd(self, *args):
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

    def myKeyPress(self, event):
        if event.keyCode == 9:  # tab key
            event.preventDefault()
            self.zone.value += "    "
        elif event.keyCode == 13:  # return
            src = self.zone.value
            if self._status == "main":
                currentLine = src[src.rfind('>>>') + 4:]
            elif self._status == "3string":
                currentLine = src[src.rfind('>>>') + 4:]
                currentLine = currentLine.replace('\n... ', '\n')
            else:
                currentLine = src[src.rfind('...') + 4:]
            if self._status == 'main' and not currentLine.strip():
                self.zone.value += '\n>>> '
                event.preventDefault()
                return
            self.zone.value += '\n'
            self.history.append(currentLine)
            self.current = len(self.history)
            if self._status in ["main", "3string"]:
                try:
                    _ = editor_ns['_'] = eval(currentLine, editor_ns)
                    self.flush()
                    if _ is not None:
                        self.write(repr(_)+'\n')
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
                            exec(currentLine, editor_ns)
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
                block = src[src.rfind('>>>') + 4:].splitlines()
                block = [block[0]] + [b[4:] for b in block[1:]]
                block_src = '\n'.join(block)
                # status must be set before executing code in globals()
                self._status = "main"
                try:
                    _ = exec(block_src, editor_ns)
                    if _ is not None:
                        print(repr(_))
                except:
                    self.print_tb()
                self.flush()
                self.zone.value += '>>> '
            else:
                self.zone.value += '... '

            self.cursorToEnd()
            event.preventDefault()

    def myKeyDown(self, event):
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
        elif event.ctrlKey and event.keyCode == 65: # ctrl+a
            src = self.zone.value
            pos = self.zone.selectionStart
            col = get_col()
            self.zone.setSelectionRange(pos - col + 4, len(src))
            event.preventDefault()
        elif event.keyCode in [33, 34]: # page up, page down
            event.preventDefault()

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
        info, filename, lineno, offset, line = args
        print(f"  File {filename}, line {lineno}")
        print("    " + line)
        print("    " + offset * " " + "^")
        print("SyntaxError:", info)
        self.flush()

def open(elt_id):
    Repl(elt_id)
