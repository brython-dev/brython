"""Make a bundle for a Brython page
Packs all modules and packages in the page folder and in site-packages
"""

import os
import json
import fnmatch

from . import python_minifier

def bundle(folder, ignore=None):
    if ignore is None:
        # check if there is an ".bundle-ignore" file
        ignore = []
        ignore_path = os.path.join(folder, '.bundle-ignore')
        if os.path.exists(ignore_path):
            ignore = [line.strip() for line in
                open(ignore_path, encoding='utf-8').readlines()]

    paths = []
    res = {}
    for dirpath, dirnames, filenames in os.walk(folder):
        if '__pycache__' in dirnames:
            dirnames.remove('__pycache__')
        exclude_dir = []
        for dirname in dirnames:
            init_path = os.path.join(dirpath, dirname, '__init__.py')
            if not os.path.exists(init_path):
                exclude_dir.append(dirname)
        for _dir in exclude_dir:
            dirnames.remove(_dir)
        for filename in filenames:
            name, ext = os.path.splitext(filename)
            if ext == '.py':
                fullpath = os.path.join(dirpath, filename)[len(folder)+1:]
                fullpath = fullpath.replace(os.sep, '/')
                for match in ignore:
                    if fnmatch.fnmatch(fullpath, match):
                        break
                else:
                    parts = fullpath.split('/')
                    if parts[-1]=='__init__.py':
                        mod_name = '.'.join(parts[:-1])
                        is_package = True
                        print('package', mod_name)
                    else:
                        parts[-1] = parts[-1].split('.')[0]
                        mod_name = '.'.join(parts)
                        is_package = False
                    with open(os.path.join(dirpath, filename), 
                        encoding="utf-8") as fobj:
                            mini = python_minifier.minify(fobj.read())
                            if is_package:
                                res[mod_name] = [ext, mini, 1]
                            else:
                                res[mod_name] = [ext, mini]
            elif ext == '.js':
                fullpath = os.path.join(dirpath, filename)[len(folder)+1:]
                for match in ignore:
                    if fnmatch.fnmatch(fullpath, match):
                        break
                else:
                    parts = fullpath.split(os.sep)
                    parts[-1] = parts[-1].split('.')[0]
                    mod_name = '.'.join(parts)
                    with open(os.path.join(dirpath, filename), 
                        encoding="utf-8") as fobj:
                            mini = fobj.read()
                            res[mod_name] = [ext, mini]                
    return res

if __name__ == '__main__':
    www = os.path.join(os.path.dirname(os.getcwd()), 'www')
    folders = [
        os.path.join(www, 'src', 'Lib'),
        os.path.join(www, 'src', 'libs')
    ]
    res = {}
    for folder in folders:
        res.update(bundle(folder))
    bundle_path = os.path.join(os.getcwd(), 'lib', 'brython_stdlib.js')
    with open(bundle_path, 'w', encoding='utf-8') as out:
        out.write('__BRYTHON__.VFS = {}\n'.format(json.dumps(res)))
    print(sorted(list(res.keys())))