"""Update brython_modules.js with the scripts in main folder
"""
import os
import json

from tools import make_bundle

folder = os.path.dirname(__file__)
more_modules = make_bundle.bundle(folder)

print('add modules', list(more_modules))

# read modules in /dist/brython_stdlib
bm_path = os.path.join(folder, 'dist', 'brython_stdlib.js')
with open(bm_path, encoding="utf-8") as fobj:
    src = fobj.read()
# skip first line
src = src[src.find('\n'):].lstrip()
# skip assignment to __BRYTHON__.VFS
src = src[src.find('=')+1:].lstrip()
# load all modules in brython_stdlib as a Python dict
mods = json.loads(src.strip())

# update with new modules
mods.update(more_modules)
# save new version of brython_modules
bm_path = os.path.join(folder, 'dist', 'brython_modules.js')
with open(bm_path, "w", encoding="utf-8") as out:
    out.write('__BRYTHON__.use_VFS = true;\n')
    out.write('__BRYTHON__.VFS = {}\n'.format(json.dumps(mods)))
    