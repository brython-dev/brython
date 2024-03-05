import os
import version
import sys

import version
vnum = '.'.join(str(num) for num in version.version[:2])

# grammar file is downloaded by script downloads.py
grammar_file = f'python{vnum}.gram'

dest = os.path.join(os.path.dirname(os.getcwd()),
        'www', 'src', 'gen_parse.js')
    
os.system(f'{sys.executable} -m pegen javascript {grammar_file} Tokens ' +
    f'-o {dest}')
