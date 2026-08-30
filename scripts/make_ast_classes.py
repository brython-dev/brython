"""Build src/py_ast_classes.js from CPython's Python.asdl"""

import os
import re
import json

from pprint import pprint

import version
vnum = '.'.join(str(num) for num in version.version[:2])

import urllib.request

f = open(f'Python{vnum}.asdl', encoding='utf-8')
type_def = False
ast_options = []
ast_types = {}
ast_type = None

types = []

for line in f:
    line = line.strip()
    if line.startswith('--'):
        continue
    elif '=' in line:
        if not type_def:
            type_def = True
        elif ast_type and ast_type not in ast_types:
            ast_types[ast_type] = {'options': ast_options}
        parts = [x.strip() for x in line.split('=')]
        ast_type = parts[0]
        types.append(ast_type)
        ast_options = [x.strip() for x in parts[1].split('|')]
    elif line.startswith('|'):
        ast_options += [x.strip() for x in line[1:].strip().split('|')]
    elif line.startswith('}'):
        ast_types[ast_type] = {'options': ast_options}
        break
    elif type_def:
        if line.startswith('attributes'):
            ast_types[ast_type] = {'options': ast_options,
                'attributes': line[len('attributes'):]}
        else:
            ast_options[-1] += line
    else:
        if type_def:
            ast_types[ast_type] = {'options': ast_options}

print('types', types)

pprint(ast_types)


arg_types = {}

def parse_arguments(ast_type, arg_string):
    args = [x.strip() for x in arg_string.split(',')]
    arg_dict = {}
    arg_types[ast_type] = args
    for arg in args:
        arg_type, arg_name = arg.split()
        #arg_types[ast_type][arg_name] = arg_type
        if arg_type[-1] == '*':
            arg_name += '*'
        elif arg_type[-1] == '?':
            arg_name += '?'
        arg_dict[arg_name] = arg_type
    return args #arg_dict

classes = {}

for ast_type in ast_types:
    names = []
    for option in ast_types[ast_type]['options']:
        if '(' not in option:
            classes[option] = ''
            names.append(option)
        elif option.startswith('('):
            classes[ast_type] = ','.join(parse_arguments(ast_type, option[1:-1]))
        else:
            mo = re.match(r'(.*)\((.*)\)', option)
            name, arguments = mo.groups()
            names.append(name)
            classes[name] = ','.join(parse_arguments(name, arguments))
    if names:
        classes[ast_type] = names

attributes = {}

for ast_type in ast_types:
    if 'attributes' in ast_types[ast_type]:
        attributes[ast_type] = ast_types[ast_type]['attributes'].strip(' ()')

print('arg_types')
pprint(arg_types)

keys = sorted(list(classes))

lines = []
for key in keys:
    lines.append(f"{key}:{classes[key]!r}") #.replace(' ', ''))


dest_dir = os.path.join(os.path.dirname(os.getcwd()), "www", "src")

with open(os.path.join(dest_dir, 'py_ast_classes.js'), 'w', encoding='utf-8') as out:
    out.write("// generate file - don't edit manually\n")
    out.write('"use strict";\n')
    out.write('__BRYTHON__.ast_classes = {\n' + ',\n'.join(lines) + '\n}\n')
    out.write(f'__BRYTHON__.ast_attributes = {json.dumps(attributes, indent=4)}\n')
