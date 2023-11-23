"""Transforms CPython's python.gram into python.gram.js_actions
where grammar actions syntax is adapted to Javascript
"""
import os
import re
import urllib.request

import version
vnum = '.'.join(str(num) for num in version.version[:2])

# grammar file is downloaded by script downloads.py
grammar_file = f'python{vnum}.gram'

def transform_action(action):
    action1 = re.sub(r'->v\..*?\.', '.', action)
    action2 = re.sub(r'\(\(.*_ty\) (.*?)\)', r'\1', action1)
    action3 = re.sub(r'\([^(]+ \*\)', '', action2)
    action4 = re.sub(r'\([a-z_]*\*?\)_Py', '_Py', action3)
    action5 = re.sub(r'([a-z_]+)\*', r'\1', action4)
    action6 = re.sub('->', '.', action5)
    action7 = re.sub('_PyPegen_', '$B._PyPegen.', action6)
    action8 = re.sub('_PyAST_', '$B._PyAST.', action7)
    #action9 = re.sub(operators_re, r'$B.ast.\1', action8)
    action9 = re.sub(r'([a-z]+)_ty\b', r'$B.ast.\1', action8)

    # remove parameter types, eg
    # "$B._PyPegen.joined_str(p, a, (asdl_expr_seq)b, c)"
    # replaced by
    # "$B._PyPegen.joined_str(p, a, b, c)"
    args_mo = re.search(r'\(.*\)', action9)
    if args_mo:
        s = action9[args_mo.start() + 1:args_mo.end() - 1]
        s1 = re.sub(r'\((.*?)\)(\w+)', r'\2', s)
        if s1 != s:
            action10 = action9.replace(s, s1)
            action9 = action10

    args_mo = re.search(r'\(.*\)', action9)
    if args_mo:
        s = action9[args_mo.start() + 1:args_mo.end() - 1]
        params = [x.strip() for x in s.split(',')]
        params1 = []
        for param in params:
            if len(param) == 1 and param.isalpha() and param == param.lower():
                params1.append('L.' + param)
            elif param.startswith('"') or param.startswith("'"):
                params1.append(param)
            elif ' *' in param:
                print(param, f'"{param}"')
                params1.append(f'"{param}"')
            else:
                params1.append(param)

        s1 = ', '.join(params1)
        action10 = action9.replace(s, s1)
        action9 = action10

    type_decl = re.match(r'\s*\(.*?\)(.*)', action9)
    if type_decl:
        print(type_decl)
    action10 = '{ (L) => ' + action9.strip('{}') + '}'
    return action10


with open(grammar_file, encoding='utf-8') as f:
    src = f.read()

operators = [
    # binary operators
    'Add', 'Sub', 'Mult', 'Div', 'FloorDiv',
    'Mod', 'Pow', 'LShift', 'RShift', 'BitOr',
    'BitXor', 'BitAnd', 'MatMult',
    # boolean operators
    'And', 'Or',
    # comparison operators
    'Eq', 'NotEq', 'Lt', 'LtE', 'Gt', 'GtE',
    'Is', 'IsNot', 'In', 'NotIn',
    # unary operators
    'Invert', 'Not', 'UAdd', 'USub'
    ]

operators_re = r'\b(' + '|'.join(operators) + r')\b'

sep = re.search("^'''", src, flags=re.M).end()
head = src[:sep]
src = src[sep:]

action_re = re.compile(r"(?<!')\{(.*?)\}", flags=re.S)
new_src = ''
pos = 0
for mo in action_re.finditer(src):
    new_src += src[pos:mo.start()]
    pos = mo.end()
    action = src[mo.start():mo.end()]

    new_action = transform_action(action)

    new_src += new_action

new_src += src[pos:]

with open('python.gram.js_actions', 'w', encoding='utf-8') as out:
    for line in new_src.split('\n'):
        if not line.startswith('#') and line.strip():
            out.write(line + '\n')
