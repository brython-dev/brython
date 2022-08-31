"""Build src/py_ast.js from the documentation of Python ast module."""

import os
import re
import json

import version
vnum = '.'.join(str(num) for num in version.version[:2])

import urllib.request

ast_url = f"https://raw.githubusercontent.com/python/cpython/{vnum}/Parser/Python.asdl"
f = urllib.request.urlopen(ast_url)


with open('Python.asdl', 'wb') as out:
    out.write(f.read())


f = open('Python.asdl', encoding='utf-8')
type_def = False
ast_options = []
ast_types = {}
ast_type = None

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


def parse_arguments(arg_string):
    args = [x.strip() for x in arg_string.split(',')]
    arg_dict = {}
    for arg in args:
        arg_type, arg_name = arg.split()
        if arg_type[-1] == '*':
            arg_name += '*'
        elif arg_type[-1] == '?':
            arg_name += '?'
        arg_dict[arg_name] = arg_type
    return arg_dict

classes = {}

for ast_type in ast_types:
    names = []
    for option in ast_types[ast_type]['options']:
        if '(' not in option:
            classes[option] = ''
            names.append(option)
        elif option.startswith('('):
            classes[ast_type] = ','.join(parse_arguments(option[1:-1]))
        else:
            mo = re.match(r'(.*)\((.*)\)', option)
            name, arguments = mo.groups()
            names.append(name)
            classes[name] = ','.join(parse_arguments(arguments))
    if names:
        classes[ast_type] = names

keys = sorted(list(classes))

lines = []
for key in keys:
    lines.append(f"{key}:{classes[key]!r}".replace(' ', ''))


dest_dir = os.path.join(os.path.dirname(os.getcwd()), "www", "src")
start_tag = '// --- start AST classes'
end_tag = '// --- end AST classes'

with open(os.path.join(dest_dir, 'py_ast.js'), encoding='utf-8') as f:
    content = f.read()
    start = content.find(start_tag)
    if start == -1:
        raise Exception('start tag not found')
    end = content.find(end_tag)
    if end == -1:
        raise Exception('start tag not found')
    head = content[:start]
    tail = content[end:]

with open(os.path.join(dest_dir, 'py_ast.js'), 'w', encoding='utf-8') as out:
    out.write(head)
    out.write(start_tag + '\n')
    out.write('$B.ast_classes = {\n' + ',\n'.join(lines) + '\n}\n')
    out.write(tail)

