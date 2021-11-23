import os
import ast

from bihan import application

root = os.getcwd()
application.static = {
    '/src': os.path.join(root, 'www', 'src'),
    '/tests': os.path.join(root, 'www', 'tests')
    }
print(application.static)

def dump_ast(dialog):
    src = dialog.request.json()['py_source'].replace('\r\n', '\n')
    return ast.dump(ast.parse(src), indent=4)

application.run(port=8001, debug=True)