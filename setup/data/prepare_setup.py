import os
import shutil
import json

from tools import make_bundle

# prepare script with standard distribution
www = os.path.join(os.path.dirname(os.path.dirname(os.getcwd())), 'www')
folders = [
    os.path.join(www, 'src', 'Lib'),
    os.path.join(www, 'src', 'libs')
]
res = {}
for folder in folders:
    res.update(make_bundle.bundle(folder))

# copy stdlib in brython_stdlib.js
# and initialise brython_modules.js with the same content

bundle_names = ['brython_stdlib.js', 'brython_modules.js']
for name in bundle_names:
    with open(name, 'w', encoding='utf-8') as out:
        out.write('__BRYTHON__.use_VFS = true;\n')
        out.write('__BRYTHON__.VFS = {}\n'.format(json.dumps(res)))

# copy brython.js
shutil.copyfile(os.path.join(www, 'src', 'brython.js'), 'brython.js')
