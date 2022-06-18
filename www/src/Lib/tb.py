import sys
from browser import console

class Trace:

    def __init__(self):
        self.buf = ""

    def write(self, *data):
        self.buf += " ".join([str(x) for x in data])

    def format(self):
        """Remove calls to function in this script from the traceback."""
        return self.buf

def format_exc():
    trace = Trace()
    exc_info = sys.exc_info()
    exc_class = exc_info[0].__name__
    exc_msg = str(exc_info[1])
    tb = exc_info[2]
    if exc_info[0] is SyntaxError:
        return syntax_error(exc_info[1].args)
    trace.write("Traceback (most recent call last):\n")
    while tb is not None:
        frame = tb.tb_frame
        code = frame.f_code
        name = code.co_name
        filename = code.co_filename
        trace.write(f"  File {filename}, line {tb.tb_lineno}, in {name}\n")
        if not filename.startswith("<"):
            src = open(filename, encoding='utf-8').read()
            lines = src.split('\n')
            line = lines[tb.tb_lineno - 1]
            trace.write(f"    {line.strip()}\n")
        tb = tb.tb_next
    trace.write(f"{exc_class}: {exc_msg}\n")
    return trace.format()

def print_exc(file=None):
    if file is None:
        file = sys.stderr
    file.write(format_exc())

def syntax_error(args):
    trace = Trace()
    info, [filename, lineno, offset, line, *extra] = args
    trace.write(f"  File {filename}, line {lineno}\n")
    indent = len(line) - len(line.lstrip())
    trace.write("    " + line.lstrip() + "\n")
    nb_marks = 1
    if extra:
        end_lineno, end_offset = extra
        if end_lineno > lineno:
            nb_marks = len(line) - offset
        else:
            nb_marks = end_offset - offset
    trace.write("    " + (offset - 1) * " " + "^" * nb_marks + "\n")
    trace.write("SyntaxError:", info, "\n")
    return trace.buf