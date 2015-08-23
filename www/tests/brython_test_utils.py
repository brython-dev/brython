import sys
import time
import traceback

def discover_test_modules():
    # TODO : Test discovery based on file system paths
    return [
        ("Core language features", [
          ("test_suite.py", "basic test suite"),
          ("test_rmethods.py", "reflected methods"),
          ("test_bytes.py", "bytes"),
          ("test_classes.py", "classes"),
          ("test_decimals.py", "decimals"),
          ("test_decorators.py", "decorators"),
          ("test_descriptors.py", "descriptors"),
          ("test_dict.py", "dicts"),
          ("test_import.py", "imports"),
          ("test_iterators.py", "iterators"),
          ("test_generators.py", "generators"),
          ("test_list_methods.py", "lists"),
          ("test_numbers.py", "numbers"),
          ("test_print.py", "print"),
          ("test_set.py", "sets"),
          ("test_strings.py", "strings"),
          ("test_string_format.py", "string format"),
          ("test_string_methods.py", "string methods")
        ]),
        ("Issues", [
          ("issues_gc.py", "issues (GC)"),
          ("issues_bb.py", "issues (BB)"),
          ("issues.py", "issues")
        ]),
        ("Modules", [
          ("test_random.py", "random"),
          ("test_re.py", "re"),
          ("test_unittest.py", "unittest"),
          ("test_bisect.py", "bisect"),
          ("test_collections.py", "collections"),
          ("test_datetime.py", "datetime"),
          ("test_hashlib.py", "hashlib"),
          ("test_indexedDB.py", "indexedDB"),
          ("test_itertools.py", "itertools"),
          ("test_json.py", "JSON"),
          ("test_math.py", "math"),
          ("test_storage.py", "storage"),
#          ("test_time.py", "time"),
          ("test_types.py", "types")
        ])]

def populate_testmod_input(elem, selected=None):
    """Build a multiple selection control including test modules
    """
    from browser import html
    groups = discover_test_modules()
    for label, options in groups:
        g = html.OPTGROUP(label=label)
        elem <= g
        for filenm, caption in options:
            if filenm == selected:
                o = html.OPTION(caption, value=filenm, selected='')
            else:
                o = html.OPTION(caption, value=filenm)
            g <= o

def run(src):
    t0 = time.perf_counter()
    try:
        ns = {'__name__':'__main__'}
        exec(src, ns)
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    t1 = time.perf_counter()
    return state, t0, t1

def run_test_module(filename, base_path=''):
    src = open(base_path + filename).read()
    return run(src)

