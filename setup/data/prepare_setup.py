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

# create zip file
version = "0.0.3"
name = 'Brython-%s' %version
dest_path = name
dist1 = tarfile.open(dest_path + '.tar.gz', mode='w:gz')
dist2 = tarfile.open(dest_path+'.tar.bz2', mode='w:bz2')
dist3 = zipfile.ZipFile(dest_path + '.zip', mode='w',
                        compression=zipfile.ZIP_DEFLATED)

paths = ['index.html', 'brython.js', 'brython_stdlib.js', 'brython_modules.js']

for arc, wfunc in (dist1, dist1.add), (dist2, dist2.add), (dist3, dist3.write):
    for path in paths:
        wfunc(os.path.join(pdir, path), arcname=os.path.join(name, path))

    arc.close()
