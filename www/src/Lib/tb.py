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
    tb = exc_info[2].tb_next
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
            trace.write(f"    {tb.tb_lasti}\n")
        tb = tb.tb_next
    trace.write(f"{exc_class}: {exc_msg}\n")
    return trace.format()

def print_exc(file=None):
    if file is None:
        file = sys.stderr
    file.write(format_exc())

def syntax_error(args):
    trace = Trace()
    info, filename, lineno, offset, line = args
    trace.write(f"  File {filename}, line {lineno}\n")
    trace.write("    " + line + "\n")
    trace.write("    " + offset * " " + "^\n")
    trace.write("SyntaxError:", info, "\n")
    return trace.buf