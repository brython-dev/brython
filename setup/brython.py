import os
import shutil
import json

print('Installing brython')
src_path = os.path.join(os.path.dirname(__file__), 'data')

if os.listdir(os.getcwd()):
    print('Brython can only be installed in an empty folder')
    import sys
    sys.exit()

for path in 'server.py', 'index.html':
    shutil.copyfile(os.path.join(src_path, path),
        path)

os.mkdir('dist')
shutil.copyfile(os.path.join(src_path, 'lib', 'brython.js'),
    os.path.join(os.getcwd(), 'dist', 'brython.js'))
shutil.copyfile(os.path.join(src_path, 'lib', 'brython_stdlib.js'),
    os.path.join(os.getcwd(), 'dist', 'brython_stdlib.js'))

os.mkdir('stdlib')
py_dest_dir = os.path.join(os.getcwd(), 'stdlib', 'Lib')
os.mkdir(py_dest_dir)
js_dest_dir = os.path.join(os.getcwd(), 'stdlib', 'libs')
os.mkdir(js_dest_dir)

with open(os.path.join(src_path, 'lib', 'brython_stdlib.js'),
    encoding="utf-8") as fobj:
        stdlib = fobj.read()
        vfs = stdlib.split('\n', 1)[1]
        libs = vfs.split('=', 1)[1].strip()
        libs = json.loads(libs)
        for mod_name, data in libs.items():
            elts = mod_name.split('.')
            ext = data[0] # .py or .js
            src = data[1] # source code
            if len(data)>2:
                elts.append('__init__')
            path = py_dest_dir if ext=='.py' else js_dest_dir
            for elt in elts[:-1]:
                path = os.path.join(path, elt)
                if not os.path.exists(path):
                    os.mkdir(path)
            name = elts[-1]+ext
            with open(os.path.join(path, name), "w", encoding="utf-8") as out:
                out.write(src)
