import sys
import traceback

from browser import document as doc
from browser import window, alert, console

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

CODE_ELT = doc['code']

def credits():
    print(_credits)
credits.__repr__ = lambda:_credits

def copyright():
    print(_copyright)
copyright.__repr__ = lambda:_copyright

def license():
    print(_license)
license.__repr__ = lambda:_license


OUT_BUFFER = ''

def write(data):
    global OUT_BUFFER
    OUT_BUFFER += str(data)

def flush():
    global CODE_ELT, OUT_BUFFER
    CODE_ELT.value += OUT_BUFFER
    OUT_BUFFER = ''

sys.stdout.write = sys.stderr.write = write
sys.stdout.__len__ = sys.stderr.__len__ = lambda: len(OUT_BUFFER)

history = []
current = 0
_status = "main"  # or "block" if typing inside a block

# execution namespace
editor_ns = {'credits':credits,
    'copyright':copyright,
    'license':license,
    '__name__':'__main__'}

def cursorToEnd(*args):
    pos = len(doc['code'].value)
    doc['code'].setSelectionRange(pos, pos)
    doc['code'].scrollTop = doc['code'].scrollHeight

def get_col(area):
    # returns the column num of cursor
    sel = doc['code'].selectionStart
    lines = doc['code'].value.split('\n')
    for line in lines[:-1]:
        sel -= len(line) + 1
    return sel


def myKeyPress(event):
    global _status, current
    if event.keyCode == 9:  # tab key
        event.preventDefault()
        doc['code'].value += "    "
    elif event.keyCode == 13:  # return
        src = doc['code'].value
        if _status == "main":
            currentLine = src[src.rfind('>>>') + 4:]
        elif _status == "3string":
            currentLine = src[src.rfind('>>>') + 4:]
            currentLine = currentLine.replace('\n... ', '\n')
        else:
            currentLine = src[src.rfind('...') + 4:]
        if _status == 'main' and not currentLine.strip():
            doc['code'].value += '\n>>> '
            event.preventDefault()
            return
        doc['code'].value += '\n'
        history.append(currentLine)
        current = len(history)
        if _status == "main" or _status == "3string":
            try:
                _ = editor_ns['_'] = eval(currentLine, editor_ns)
                flush()
                if _ is not None:
                    write(repr(_)+'\n')
                flush()
                doc['code'].value += '>>> '
                _status = "main"
            except IndentationError:
                doc['code'].value += '... '
                _status = "block"
            except SyntaxError as msg:
                if str(msg) == 'invalid syntax : triple string end not found' or \
                    str(msg).startswith('Unbalanced bracket'):
                    doc['code'].value += '... '
                    _status = "3string"
                elif str(msg) == 'eval() argument must be an expression':
                    try:
                        exec(currentLine, editor_ns)
                    except:
                        traceback.print_exc()
                    flush()
                    doc['code'].value += '>>> '
                    _status = "main"
                elif str(msg) == 'decorator expects function':
                    doc['code'].value += '... '
                    _status = "block"
                else:
                    traceback.print_exc()
                    flush()
                    doc['code'].value += '>>> '
                    _status = "main"
            except:
                traceback.print_exc()
                flush()
                doc['code'].value += '>>> '
                _status = "main"
        elif currentLine == "":  # end of block
            block = src[src.rfind('>>>') + 4:].splitlines()
            block = [block[0]] + [b[4:] for b in block[1:]]
            block_src = '\n'.join(block)
            # status must be set before executing code in globals()
            _status = "main"
            try:
                _ = exec(block_src, editor_ns)
                if _ is not None:
                    print(repr(_))
            except:
                traceback.print_exc()
            flush()
            doc['code'].value += '>>> '
        else:
            doc['code'].value += '... '

        cursorToEnd()
        event.preventDefault()

def myKeyDown(event):
    global _status, current
    if event.keyCode == 37:  # left arrow
        sel = get_col(doc['code'])
        if sel < 5:
            event.preventDefault()
            event.stopPropagation()
    elif event.keyCode == 36:  # line start
        pos = doc['code'].selectionStart
        col = get_col(doc['code'])
        doc['code'].setSelectionRange(pos - col + 4, pos - col + 4)
        event.preventDefault()
    elif event.keyCode == 38:  # up
        if current > 0:
            pos = doc['code'].selectionStart
            col = get_col(doc['code'])
            # remove current line
            doc['code'].value = doc['code'].value[:pos - col + 4]
            current -= 1
            doc['code'].value += history[current]
        event.preventDefault()
    elif event.keyCode == 40:  # down
        if current < len(history) - 1:
            pos = doc['code'].selectionStart
            col = get_col(doc['code'])
            # remove current line
            doc['code'].value = doc['code'].value[:pos - col + 4]
            current += 1
            doc['code'].value += history[current]
        event.preventDefault()
    elif event.keyCode == 8:  # backspace
        src = doc['code'].value
        lstart = src.rfind('\n')
        if (lstart == -1 and len(src) < 5) or (len(src) - lstart < 6):
            event.preventDefault()
            event.stopPropagation()


doc['code'].bind('keypress', myKeyPress)
doc['code'].bind('keydown', myKeyDown)
doc['code'].bind('click', cursorToEnd)
v = sys.implementation.version
doc['code'].value = "Brython %s.%s.%s on %s %s\n>>> " % (
    v[0], v[1], v[2], window.navigator.appName, window.navigator.appVersion)
#doc['code'].value += 'Type "copyright", "credits" or "license" for more information.'
doc['code'].focus()
cursorToEnd()

