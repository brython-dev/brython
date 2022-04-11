"""Transforms python.gram into python.gram.js_actions where grammar actions
syntax is adapted to Javascript
"""

import re

with open('python.gram', encoding='utf-8') as f:
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

sep = re.search("^'''", src, flags=re.M).start()
head = src[:sep]
src = src[sep:]

action_re = re.compile(r"(?<!')\{(.*?)\}", flags=re.S)
new_src = ''
pos = 0
for mo in action_re.finditer(src):
    new_src += src[pos:mo.start()]
    pos = mo.end()
    action = src[mo.start():mo.end()]
    action1 = re.sub(r'->v\..*?\.', '.', action)
    action2 = re.sub(r'\(\(.*_ty\) (.*?)\)', r'\1', action1)
    action3 = re.sub(r'\([^(]+ \*\)', '', action2)
    action4 = re.sub(r'\([a-z_]*\*?\)_Py', '_Py', action3)
    action5 = re.sub(r'([a-z_]+)\*', r'\1', action4)
    action6 = re.sub('->', '.', action5)
    action7 = re.sub('_PyPegen_', '$B._PyPegen.', action6)
    action8 = re.sub('_PyAST_', '$B._PyAST.', action7)
    action9 = re.sub(operators_re, r'$B.ast.\1', action8)
    action10 = re.sub(r'([a-z]+)_ty\b', r'$B.ast.\1', action9)
    new_src += action10

new_src += src[pos:]

with open('python.gram.js_actions', 'w', encoding='utf-8') as out:
    out.write(head + new_src)













