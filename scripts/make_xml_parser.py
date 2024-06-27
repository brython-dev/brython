import re


import make_dist
from generate_xml_parser import make_rules, generate_parser

with open("custom_xml.gram", encoding="utf-8") as f:
    grammar = f.readlines()

lines = []
for i, line in enumerate(grammar):
    if not line.strip():
        continue
    if not re.match(r'.*::=.*', line):
        if line.startswith(' '):
            lines[-1] += ' ' + line.strip()
        else:
            continue # comment line
    else:
        lines.append(line.strip())

# filter rules
ignore = 'NameChar', 'Letter', 'Digit', 'BaseChar', 'Ideographic', 'CombiningChar', 'Extender'
filtered = []

for line in lines:
    mo = re.match(r'(.*)::=', line)
    rule = mo.groups()[0].strip()
    if not rule in ignore:
        filtered.append(line)

norm_grammar = '\n'.join(filtered)
 
rules = make_rules(norm_grammar)
dest = make_dist.abs_path('libs/xml_parser.js')
generate_parser(rules, dest)

with open(make_dist.abs_path('libs/xml_helpers.js'), encoding='utf-8') as f:
    helpers = f.read()

with open(dest, encoding='utf-8') as f:
    content = f.read()

with open(dest, 'w', encoding='utf-8') as out:
    out.write("(function($B){\n")
    out.write(helpers + '\n' + content)
    out.write("\n})(__BRYTHON__)")