"""Copy CPython test suite in Brython folder tests/unittests"""

import os
import sys
import shutil

from directories import root_dir

def ignore_cache(dir_name, files):
    return ['__pycache__']

v = sys.version_info
dest = os.path.join(root_dir, 'www', 'tests', 'unittests', 'test')
print(dest)
if os.path.exists(dest):
    print('exists, remove')
    shutil.rmtree(dest)
orig = os.path.join(os.path.dirname(sys.executable), 'Lib', 'test')
print(orig)
shutil.copytree(orig, dest, ignore=lambda *args: ['__pycache__'])
