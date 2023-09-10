import os
import webbrowser
import time
import json
import random

template = """<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
body,td,th{
    font-family:sans-serif;
    font-size:12px;
}
</style>

<script type="text/javascript" src="/src/brython_builtins.js"></script>

<script type="text/javascript" src="/src/py_ast_classes.js"></script>
<script type="text/javascript" src="/src/stdlib_paths.js"></script>
<script type="text/javascript" src="/src/unicode_data.js"></script>
<script type="text/javascript" src="/src/version_info.js"></script>

<script type="text/javascript" src="/src/python_tokenizer.js"></script>
<script type="text/javascript" src="/src/py_ast.js"></script>
<script type="text/javascript" src="/src/py2js.js"></script>
<script type="text/javascript" src="/src/loaders.js"></script>
<script type="text/javascript" src="/src/py_utils.js"></script>
<script type="text/javascript" src="/src/py_object.js"></script>
<script type="text/javascript" src="/src/py_type.js"></script>
<script type="text/javascript" src="/src/py_builtin_functions.js"></script>
<script type="text/javascript" src="/src/py_sort.js"></script>
<script type="text/javascript" src="/src/py_exceptions.js"></script>
<script type="text/javascript" src="/src/py_range_slice.js"></script>
<script type="text/javascript" src="/src/py_bytes.js"></script>
<script type="text/javascript" src="/src/py_set.js"></script>
<script type="text/javascript" src="/src/py_import.js"></script>
<script type="text/javascript" src="/src/py_string.js"></script>
<script type="text/javascript" src="/src/py_int.js"></script>
<script type="text/javascript" src="/src/py_long_int.js"></script>
<script type="text/javascript" src="/src/py_float.js"></script>
<script type="text/javascript" src="/src/py_complex.js"></script>
<script type="text/javascript" src="/src/py_dict.js"></script>
<script type="text/javascript" src="/src/py_list.js"></script>
<script type="text/javascript" src="/src/js_objects.js"></script>
<script type="text/javascript" src="/src/py_generator.js"></script>
<script type="text/javascript" src="/src/py_dom.js"></script>
<script type="text/javascript" src="/src/py_pattern_matching.js"></script>
<script type="text/javascript" src="/src/async.js"></script>
<script type="text/javascript" src="/src/py_flags.js"></script>
<script type="text/javascript" src="/src/builtin_modules.js"></script>
<script type="text/javascript" src="/src/ast_to_js.js"></script>
<script type="text/javascript" src="/src/symtable.js"></script>

<script type="text/javascript" src="/src/string_parser.js"></script>
<script type="text/javascript" src="/src/number_parser.js"></script>
<script type="text/javascript" src="/src/action_helpers.js"></script>
<script type="text/javascript" src="/src/python_parser.js"></script>
<script type="text/javascript" src="/src/full_grammar.js"></script>

[[brython-options]]

</head>
<body[[body_onload]]>

<script type="text/python"[[script-options]]>
from browser import ajax, window, timer

[[code]]

def close():
    window.close()

def oncomplete(ev):
    timer.set_timeout(close, 3000)

ajax.get('http://localhost:8001/write_result', data=[[data]],
         oncomplete=oncomplete)

</script>

</body>
</html>
"""

def make_src():
    src = template.replace('[[code]]', code)
    src = src.replace('[[data]]', str(data))
    src = src.replace('[[body_onload]]', body_onload)

    if brython_options:
        options = f'<brython-options {brython_options}></brython-options>\n'
        src = src.replace('[[brython-options]]', options)
    else:
        src = src.replace('[[brython-options]]', '')

    src = src.replace('[[script-options]]', script_options)

    return src


def test():

    with open("test_write_result.html", 'w', encoding='utf-8') as out:
        out.write(src)

    webbrowser.open('http://localhost:8001/tests/test_write_result.html',
                    new=0, autoraise=False)

    time.sleep(1)

    fname = os.path.join(os.path.dirname(__file__), 'test_result.json')

    with open(fname, encoding='utf-8') as f:
        result = json.load(f)
        for key in expected:
            assert expected[key] == result[key], \
                f'key {key}, expected {expected[key]}, got {result[key]}, src {src}'
            print(f'key {key} ok {expected[key]}')

for debug in '012':

    code = "debug = __BRYTHON__.get_option('debug')"
    data = '{"debug": debug}'
    expected = {'debug': f'{debug}'}

    body_onload = f' onload="brython({debug})"'
    brython_options = ''
    script_options = ''

    src = make_src()
    test()

    body_onload = ''
    brython_options = f'debug="{debug}"'
    script_options = ''

    src = make_src()
    test()

    body_onload = ''
    brython_options = ''
    script_options = f' debug="{debug}"'

    src = make_src()
    test()

print('debug ok')

for cache in True, False:
    cache_str = str(cache).lower()
    code = "cache = __BRYTHON__.get_option('cache')"
    data = '{"cache": cache}'
    expected = {'cache': f'{cache_str}'}

    body_onload = f' onload="brython({{cache: {cache_str}}})"'
    brython_options = ''
    script_options = ''

    src = make_src()
    test()

    body_onload = ''
    brython_options = f'cache={cache_str}'
    script_options = ''

    src = make_src()
    test()

    body_onload = ''
    brython_options = ''
    script_options = f' cache={cache_str}'

    src = make_src()
    test()

print('cache tests ok')

ids = ['test']
ids_str = str(ids)
code = "ids = __BRYTHON__.get_option('ids')"
data = '{"ids": ids}'
expected = {'ids': 'test'}

body_onload = f' onload="brython({{ids: {ids_str}}})"'
brython_options = ''
script_options = ' id="test"'

src = make_src()
test()

body_onload = ''
brython_options = f'ids={ids_str}'
script_options = ' id="test"'

src = make_src()
test()

print('ids tests ok')

