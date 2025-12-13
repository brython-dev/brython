import os
import re

obj_dir = os.path.join('/cpython', 'Objects')

defines = {}
for dirpath, dirnames, filenames in os.walk(obj_dir):
    for filename in filenames:
        if filename.endswith('.h'):
            path = os.path.join(dirpath, filename)
            with open(path, encoding='utf-8') as f:
                reading_def = False
                for line in f:
                    if reading_def:
                        define += ' ' + line.strip(' \n\\')
                        if not line.strip().endswith('\\'):
                            if define.lstrip().startswith('{'):
                                defines[def_name] = define
                            reading_def = False
                    elif line.startswith('#define'):
                        mo = re.match(r'#define\s+(?P<name>[a-zA-Z_]+)', line)
                        if not mo:
                            print('not mo ???')
                            input()
                        def_name = mo.group('name')
                        line = line[mo.end():]
                        if not line.strip().endswith('\\'):
                            if line.lstrip().startswith('{'):
                                defines[def_name] = line
                        else:
                            define = line.strip(' \n\\')
                            reading_def = True