# -*- coding: utf-8 -*-

"""Make brython.min.js with terser"""

import os
from directories import src_dir

this_dir = os.getcwd()
src_dir = os.path.join(pdir, 'www', 'src')
os.chdir(src_dir)
if os.system('terser brython.js -o brython.min.js'):
    raise SystemError('could not create brython.min.js')
os.chdir(this_dir)