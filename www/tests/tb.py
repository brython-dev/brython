import sys
from browser import console

class Trace:

    def __init__(self):
        self.buf = ""

    def write(self, *data):
        self.buf += " ".join([str(x) for x in data])

    def format(self):
        """Remove calls to function in this script from the traceback."""
        lines = self.buf.split("\n")
        stripped = [lines[0]]
        for i in range(3, len(lines), 2):
            if __file__ in lines[i]:
                continue
            stripped += lines[i: i+2]
        return "\n".join(stripped)

def print_exc(file=None):
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
            trace.write(f"    {tb.tb_lasti}\n")
        tb = tb.tb_next
    trace.write(f"{exc_class}: {exc_msg}\n")
    if file is None:
        return trace.format()
    file.write(trace.format())

def syntax_error(args):
    trace = Trace()
    info, filename, lineno, offset, line = args
    console.log("args", args)
    trace.write(f"  File {filename}, line {lineno}\n")
    trace.write("    " + line + "\n")
    trace.write("    " + offset * " " + "^\n")
    trace.write("SyntaxError:", info, "\n")
    return trace.buf