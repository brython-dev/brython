import os
import version
import sys

from directories import src_dir
import version
vnum = '.'.join(str(num) for num in version.version[:2])

save_dir = os.getcwd()
scripts_dir = os.path.join(root_dir, 'scripts')

os.chdir(scripts_dir)
# grammar file is downloaded by script downloads.py
grammar_file = f'python{vnum}.gram'

dest = os.path.join(src_dir, 'gen_parse.js')

os.system(f'{sys.executable} -m pegen javascript {grammar_file} Tokens ' +
    f'-o {dest}')

os.chdir(save_dir)