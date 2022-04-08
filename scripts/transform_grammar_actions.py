"""Transforms python.gram into python.gram.js_actions where grammar actions
syntax is adapted to Javascript
"""

import re

with open('python.gram', encoding='utf-8') as f:
    src = f.read()

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
    new_src += action6

new_src += src[pos:]

with open('python.gram.js_actions', 'w', encoding='utf-8') as out:
    out.write(head + new_src)













