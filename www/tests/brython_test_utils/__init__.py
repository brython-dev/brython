import sys
import time

from browser import console

def discover_brython_test_modules():
    # TODO : Test discovery based on file system paths
    return [
        ("Core language features", [
          ("test_suite.py", "basic test suite"),
          ("test_rmethods.py", "reflected methods"),
          ("test_bytes.py", "bytes"),
          ("test_classes.py", "classes"),
          ("test_decorators.py", "decorators"),
          ("test_descriptors.py", "descriptors"),
          ("test_dict.py", "dicts"),
          ("test_exec.py", "exec / eval"),
          ("test_file.py", "file open / read"),
          ("test_generators.py", "generators"),
          ("test_import.py", "imports"),
          ("test_iterators.py", "iterators"),
          ("test_jsobjects.py", "Javascript objects"),
          ("test_list.py", "lists"),
          ("test_memoryview.py", "memoryview"),
          ("test_numbers.py", "numbers"),
          ("test_pattern_matching.py", "pattern matching"),
          ("test_print.py", "print"),
          ("test_set.py", "sets"),
          ("test_special_methods.py", "special methods"),
          ("test_strings.py", "strings"),
          ("test_fstrings.py", "f-strings"),
          ("test_string_format.py", "string format"),
          ("test_string_methods.py", "string methods")
        ]),
        ("DOM interface", [
            ("dom.py", "DOM")
        ]),
        ("Issues", [
          ("issues_gc.py", "issues (GC)"),
          ("issues_bb.py", "issues (BB)"),
          ("issues.py", "issues")
        ]),
        ("Modules", [
          ("test_ast.py", "ast"),
          ("test_aio.py", "browser.aio"),
          ("test_ajax.py", "browser.ajax"),
          ("test_highlight.py", "browser.highlight"),
          ("test_browser_html.py", "browser.html"),
          ("test_binascii.py", "binascii"),
          ("test_bisect.py", "bisect"),
          ("test_builtins.py", "builtins"),
          ("test_code.py", "code"),
          ("test_collections.py", "collections"),
          ("test_copy.py", "copy"),
          ("test_dataclasses.py", "dataclasses"),
          ("test_datetime.py", "datetime"),
          ("test_decimals.py", "decimals"),
          ("test_functools.py", "functools"),
          ("test_compression.py", "gzip / zlib"),
          ("test_hashlib.py", "hashlib"),
          ("test_io.py", "io"),
          ("test_itertools.py", "itertools"),
          ("test_json.py", "json"),
          ("test_math.py", "math"),
          ("test_pickle.py", "pickle"),
          ("test_random.py", "random"),
          ("test_re.py", "re"),
          ("test_storage.py", "storage"),
          ("test_struct.py", "struct"),
          ("test_sys.py", "sys"),
          ("test_types.py", "types"),
          ("test_unicodedata.py", "unicodedata"),
          ("test_unittest.py", "unittest"),
          ("test_urllib.py", "urllib"),
          #("test_indexedDB.py", "indexedDB"),
          #("test_time.py", "time"),
        ])
    ]

def populate_testmod_input(elem, selected=None):
    """Build a multiple selection control including test modules
    """
    from browser import html
    groups = discover_brython_test_modules()
    for label, options in groups:
        if selected and label not in selected:
            continue
        g = html.OPTGROUP(label=label)
        elem <= g
        for filenm, caption in options:
            if filenm == selected:
                o = html.OPTION(caption, value=filenm, selected='')
            else:
                o = html.OPTION(caption, value=filenm)
            g <= o

def trace_exc(run_frame, src, ns):
    result_lines = []
    exc_type, exc_value, traceback = sys.exc_info()

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

    show = False
    started = False

    while traceback:
        frame = traceback.tb_frame
        # don't show the frames above that of the "run" function
        if frame is run_frame:
            started = True
            result_lines.append('Traceback (most recent call last):')
        elif started:
            lineno = traceback.tb_lineno
            filename = frame.f_code.co_filename
            result_lines.append(f'  File {filename}, line {lineno}')
            show_line(filename, lineno, src)
        traceback = traceback.tb_next

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
    with open(filename, 'w') as out:
        out.write(src)
    state = 1
    try:
        exec(src, ns)
    except Exception as exc:
        #msg = traceback.format_exc()
        #print(msg, file=sys.stderr)
        print(trace_exc(sys._getframe(), src, ns))
        state = 0
    t1 = time.perf_counter()
    return state, t0, t1, msg

def run_test_module(filename, base_path=''):
    if base_path and not base_path.endswith('/'):
        base_path += '/'
    file_path = base_path + filename
    src = open(file_path).read()
    return run(src, file_path)

