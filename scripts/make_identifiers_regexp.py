# -*- coding: utf-8 -*-


"""This scripts builds the Javascript file identifiers_re.js in folder "src"

This scripts holds the regular expressions used to detect Unicode variable
names in the source code, allowing names that include non-ASCII characters

PEP 3131 (http://www.python.org/dev/peps/pep-3131/) describes the set of
Unicode points that are accepted. Brython implements this PEP partially :
- "astral" code points (with 5 hexadecimal digits) are ignored
- in order to avoid a too long regular expression, a limit is set for the last
accepted code point (by default u06FF)."""


import os
import re


last_code_point = '06FF'
src = open('DerivedCoreProperties.txt')
out = open(os.path.join(os.path.dirname(os.getcwd()),
                        'src', 'identifiers_re.js'), 'w')
state = None
elts = {}
props = ['XID_Start', 'XID_Continue']
prop_pattern = re.compile("# Derived Property: (.+)")
sv = ''


for line in src:
    mo = prop_pattern.search(line)
    if mo:
        prop = mo.groups()[0]
        print((line, prop))
        if prop in props:
            if state:
                out.write(']/\n')
            state = prop
            elts[state] = []
        else:
            state = None
        if prop in props:
            out.write('__BRYTHON__.re_%s = /[a-zA-Z_' % prop)
    elif state and state in props:
        mo = re.search('^([0-F.]+)', line)
        if mo:
            # ignore "astral" code points, with more than 4 hexadecimal digits
            _range = mo.groups()[0]
            points = _range.split('..')
            ln = sum(len(point) for point in points)
            if ln in [4, 8]:
                if points[0] > last_code_point:
                    continue
                else:
                    print((state, line))
                elts[state].append(_range)
                out.write('-'.join(
                          [r'\u%s' % item for item in points]))  # lint:ok


out.write(']/\n')
out.close()
