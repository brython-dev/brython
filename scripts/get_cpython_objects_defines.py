import os
import re

obj_dir = os.path.join('/cpython', 'Objects')
define_re = re.compile(r'^#\s*define\s+(?P<name>[a-zA-Z_]+)')
defines = {}
for dirpath, dirnames, filenames in os.walk(obj_dir):
    for filename in filenames:
        if filename.endswith('.h'):
            print(filename)
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
                    elif mo := define_re.search(line):
                        def_name = mo.group('name')
                        line = line[mo.end():]
                        if not line.strip().endswith('\\'):
                            if line.lstrip().startswith('{'):
                                defines[def_name] = line
                        else:
                            define = line.strip(' \n\\')
                            reading_def = True

if __name__ == '__main__':
    print(defines)