import os
import shutil
import json

import make_bundle

# prepare script with standard distribution
www = os.path.join(os.path.dirname(os.getcwd()), 'www')
folders = [
    os.path.join(www, 'src', 'Lib'),
    os.path.join(www, 'src', 'libs')
]
res = {}
for folder in folders:
    res.update(make_bundle.bundle(folder))

# copy stdlib in core/lib/brython_stdlib.js
lib_dir = os.path.join(os.getcwd(), 'lib')
bundle_path = os.path.join(lib_dir, 'brython_stdlib.js')
with open(bundle_path, 'w', encoding='utf-8') as out:
    out.write('__BRYTHON__.use_VFS = true;\n')
    out.write('__BRYTHON__.VFS = {}\n'.format(json.dumps(res)))

# copy brython.js
shutil.copyfile(os.path.join(www, 'src', 'brython.js'),
    os.path.join(lib_dir, 'brython.js'))
    