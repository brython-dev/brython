import os
import version

import version
vnum = '.'.join(str(num) for num in version.version[:2])

# grammar file is downloaded by script downloads.py
grammar_file = f'python{vnum}.gram'

dest = os.path.join(os.path.dirname(os.getcwd()),
        'www', 'src', 'gen_parseXXX.js')
    
os.system(f'python -m pegen javascript d:/cpython/Grammar/python.gram d:/cpython/Grammar/Tokens ' +
    f'-o {dest}')
