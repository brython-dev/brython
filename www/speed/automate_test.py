"""Runs a list of tests in speed/benchmarks with different versions of
Brython, sends the result to cgi script cgi-bin/save_bench_results.py
that stores the result in a text file.

Use the script test_report.py to generate a formatted report comparing
the speed of different versions to the current version of CPython on this
engine.
"""
import os
import sys
import random
import locale

locale.setlocale(locale.LC_ALL, '')

def create_test(version):
    scripts = ["assignment.py", # simple assignment
    "augm_assign.py", # augmented assignment
    "assignment_float.py", # simple assignment to float
    "build_dict.py", # build dictionary
    "add_dict.py", # build dictionary 2
    "set_dict_item.py", # set dictionary item
    "build_list.py", # build list
    "set_list_item.py", # set list item
    "add_integers.py", # integer addition
    "add_strings.py", # string addition
    "str_of_int.py", # cast int to string
    "create_function_no_arg.py", # create function without arguments
    "create_function_single_pos_arg.py", # create function, single positional argument
    "create_function_complex_args.py", # create function, complex arguments
    "function_call.py", # function call
    "function_call_complex.py", # function call, complex arguments
    "create_class_simple.py", # create simple class
    "create_class_with_init.py", # create class with init
    "create_instance_simple_class.py", # create instance of simple class
    "create_instance_with_init.py", # create instance of class with init
    ]
    
    test = open('brython_bench_%s.html' %version, 'w')
    test.write("""<html>
<head>
<meta charset="utf-8">
<script src="https://cdn.rawgit.com/brython-dev/brython/%s/www/src/brython.js"></script>
</head>
<body onload="brython()">
<script type="text/python">
from browser import document
""" %version)

    src = "import time\n"
    src += "perf = {'version':'%s'}\n" %version
    for script in scripts:
        src += "t0 = time.time()\n"
        src += open(os.path.join('benchmarks', script)).read()+'\n'
        src += "perf['%s'] = time.time()-t0\n" %script
    
    test.write(src)
    test.write("""from browser import ajax

def complete(*args):
    print('done')

req = ajax.ajax()
req.open('GET', '/cgi-bin/save_bench_results.py?result=%s' %perf, True)
req.bind('complete', complete)

req.send()
</script>
</body>
</html>""")
    test.close()

    # run test with CPython
    ns = {}
    exec(src, ns)
    
    del ns['perf']['version']
    v = sys.version_info
    out = open('cpython_%s.%s.%s.txt' %(v.major, v.minor, v.micro), 'w')
    for script in ns['perf']:
        out.write('%s:%s\n' %(script, ns['perf'][script]))
    out.close()

def run_test(version):
    import webbrowser
    webbrowser.open("http://localhost:8000/speed/brython_bench_%s.html?foo=%s" 
        %(version, random.randint(1,10000)))

if __name__ == '__main__':
    for version in ['3.2.2', '3.2.1', '3.2.0', '3.1.3', '3.1.2', '3.1.1']:
        create_test(version)
        run_test(version)
