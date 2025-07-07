import sys
from browser import console

class Trace:

    def __init__(self):
        self.lines = []

    def write(self, *data):
        self.lines.append(" ".join([str(x) for x in data]))

    def format(self):
        return '\n'.join(self.lines) + '\n'

def format_exc():
    trace = Trace()
    exc_class, exc, tb = sys.exc_info()
    exc_msg = str(exc)

    def handle_repeats(filename, lineno, count_repeats):
        if count_repeats > 0:
            trace_lines = trace.lines[:]
            for _ in range(2):
                if not filename.startswith('<'):
                    trace.write(trace_lines[-2])
                    trace.write(trace_lines[-1])
                else:
                    trace.write(trace_lines[-1])
                count_repeats -= 1
                if count_repeats == 0:
                    break
            if count_repeats > 1:
                trace.write(f'[Previous line repeated {count_repeats} ' +
                    f'more time{"s" if count_repeats > 1 else ""}]')

    def show_line():
        trace.write(f'  File "{filename}", line {lineno}, in {name}')
        if not filename.startswith("<"):
            src = open(filename, encoding='utf-8').read()
            lines = src.split('\n')
            line = lines[tb.tb_lineno - 1]
            trace.write(f"    {line.strip()}")

    show = True
    started = False
    save_filename = None
    save_lineno = None
    save_scope = None
    same_line = False
    count_repeats = 0

    while tb is not None:
        if show:
            trace.write("Traceback (most recent call last):")
            show = False
        frame = tb.tb_frame
        code = frame.f_code
        lineno = frame.f_lineno
        name = code.co_name
        filename = code.co_filename
        if filename == save_filename and lineno == save_lineno \
                and name == save_name:
            count_repeats += 1
            tb = tb.tb_next
            continue
        handle_repeats(save_filename, save_lineno, count_repeats)
        save_filename = filename
        save_lineno = lineno
        save_name = name
        count_repeats = 0
        show_line()
        tb = tb.tb_next

    handle_repeats(filename, lineno, count_repeats)

    if isinstance(exc, SyntaxError):
        trace.write(syntax_error(exc))
    else:
        message = exc_msg
        if isinstance(exc, AttributeError):
            suggestion = __BRYTHON__.offer_suggestions_for_attribute_error(exc)
            if suggestion is not None:
                message += f". Did you mean: '{suggestion}'?"
        elif isinstance(exc, NameError):
            suggestion = __BRYTHON__.offer_suggestions_for_name_error(exc)
            if suggestion is not None:
                message += f". Did you mean: '{suggestion}'?"
            elif exc.name in __BRYTHON__.stdlib_module_names:
                message += f". Did you forget to import '{exc.name}'?"
        trace.write(f"{exc_class.__name__}: {message}")

    return trace.format()

def print_exc(file=None):
    if file is None:
        file = sys.stderr
    file.write(format_exc())

def syntax_error(exc):
    trace = Trace()
    args = exc.args
    name = exc.__class__.__name__
    if not args:
        trace.write(f"{name}:", '<no detail available>')
        return trace.format()
    info, *details = args
    head = ''
    if exc.filename:
        head += f'File "{exc.filename}'
    if exc.lineno:
        head += f', line {exc.lineno}'
    if head:
        trace.write(head)
    if line := exc.text:
        indent = len(line) - len(line.lstrip())
        trace.write("    " + line.strip())
    nb_marks = 1
    if exc.end_lineno:
        if exc.end_lineno > exc.lineno:
            nb_marks = len(line) - exc.offset
        else:
            nb_marks = exc.end_offset - exc.offset
        nb_marks = max(nb_marks, 1)
        if exc.offset:
            trace.write("    " + (exc.offset - 1) * " " + "^" * nb_marks)
    trace.write(f"{name}:", info)
    return trace.format()