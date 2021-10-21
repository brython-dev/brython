"""Build src/py_ast.js from the documentation of Python ast module."""

import os
import re
import json

import urllib.request

ast_url = "https://raw.githubusercontent.com/python/cpython/main/Doc/library/ast.rst"
f = urllib.request.urlopen(ast_url)

classes = {}

def add_class(line):
   line = line[len(starter):].strip()
   ix = line.find('(')
   if ix > -1:
       name = line[:ix]
       args = line[ix:][1:-1]
   else:
       name, args = line, ''
   classes[name] = args

kl = False
starter = '.. class:: '
for line in f:
    line = line.decode('utf-8')
    if line.startswith(starter):
        add_class(line)
        kl = True
    elif kl and line.startswith(' ' * len(starter)):
        add_class(line)
    else:
        kl = False

keys = sorted(list(classes))
lines = []
for key in keys:
    lines.append(f"{key}:'{classes[key]}'".replace(' ', ''))

dest_dir = os.path.join(os.path.dirname(os.getcwd()), "www", "src")
with open(os.path.join(dest_dir, 'py_ast.js'), 'w', encoding='utf-8') as out:
    out.write('__BRYTHON__.ast_classes = {\n' + ',\n'.join(lines) + '\n}\n')
