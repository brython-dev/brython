# -*- coding: utf-8 -*-

"""Make brython.min.js with terser"""

import os

this_dir = os.getcwd()
# path of parent directory
pdir = os.path.dirname(this_dir)
src_dir = os.path.join(pdir, 'www', 'src')
os.chdir(src_dir)
if os.system('terser brython.js -o brython.min.js'):
    raise SystemError('could not create brython.min.js')
os.chdir(this_dir)