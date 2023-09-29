import os

from make_dist import run, pdir, vname, vname1, vname2, abs_path
import version
brython_version = '.'.join(str(x) for x in version.version[:2])
print('brython', brython_version)

with open(os.path.join(pdir, '.travis.yml.tmpl'), encoding='utf-8') as f:
    template = f.read()

template = template.replace('[[version]]', brython_version)

with open(os.path.join(pdir, '.travis.yml'), 'w', encoding='utf-8') as out:
    out.write(template)