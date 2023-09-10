import os
import ast
import json

from bihan import application

root = os.getcwd()
application.static = {
    '/src': os.path.join(root, 'www', 'src'),
    '/tests': os.path.join(root, 'www', 'tests')
    }

def dump_ast(dialog):
    src = dialog.request.json()['py_source'].replace('\r\n', '\n')
    return ast.dump(ast.parse(src), indent=4)

def write_result(dialog):
    dest_dir = os.path.join(root, 'www', 'tests')
    with open(os.path.join(dest_dir, 'test_result.json'), 'w', encoding='utf-8') as out:
        json.dump(dialog.request.fields, out)
    return dest_dir
    
application.run(port=8001, debug=True)