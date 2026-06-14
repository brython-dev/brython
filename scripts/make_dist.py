# -*- coding: utf-8 -*-

"""Script to compact all Brython scripts in a single one."""

import os
import re
import sys
import shutil

import javascript_minifier
from version import version, implementation
from directories import src_dir, root_dir
from core_scripts import core_scripts

cpython_version = sys.version_info
if cpython_version[0] != version[0] or \
        cpython_version[1] != version [1]:
    print("This script requires Python {}.{}".format(*version[:2]))
    sys.exit(1)

# version name
vname = '.'.join(str(x) for x in implementation[:3])
if implementation[3] == 'rc':
    vname += 'rc%s' % implementation[4]
vname2 = '.'.join(str(x) for x in implementation[:2])
vname1 = str(implementation[0])


def run():
    import make_stdlib_static     # generates /src/stdlib_paths.js
    import make_version_info      # generates /src/version_info.js

    # build brython.js from base Javascript files

    res = f"""// brython.js brython.info
// version {version}
// implementation {implementation}
// version compiled from commented, indented source files at
// github.com/brython-dev/brython
"""

    res_no_static = res # same but without static stdlib files
    src_size = 0

    for fname in core_scripts:
        src = open(os.path.join(src_dir, fname) + '.js').read() + '\n'
        src_size += len(src)
        try:
            mini = javascript_minifier.minify(src) + ";\n"
        except:
            print('error in', fname)
            raise
        res += mini
        if fname == 'stdlib_paths':
            res_no_static += "__BRYTHON__.stdlib = {}\n"
        else:
            res_no_static += mini


    with open(os.path.join(src_dir, 'brython.js'), 'w', newline="\n") as out:
        out.write(res)

    with open(os.path.join(src_dir, 'brython_no_static.js'), 'w', newline="\n") as out:
        out.write(res_no_static)

    print(('size : originals %s compact %s gain %.2f' %
          (src_size, len(res), 100 * (src_size - len(res)) / src_size)))

    sys.path.append("scripts")

    try:
        import make_VFS
    except ImportError:
        print("Cannot find make_VFS, so we won't make brython_stdlib.js.js")
        make_VFS = None
        sys.exit()

    make_VFS.process(os.path.join(src_dir, 'brython_stdlib.js'))

    # also copy to setup/brython/data
    setup_data_dir = os.path.join(root_dir, 'setup', 'brython', 'data')
    shutil.copyfile(os.path.join(src_dir, 'brython_no_static.js'),
        os.path.join(setup_data_dir, 'brython.js'))
    for filename in ['brython_stdlib.js', 'unicode.txt']:
        shutil.copyfile(os.path.join(src_dir, filename),
            os.path.join(setup_data_dir, filename))


if __name__ == "__main__":
    run()
