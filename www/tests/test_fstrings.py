from tester import assertRaises

try:
    "{:+3}".format('essai')
except ValueError:
    pass

x = f'{"""a}c"""[1]}'
"""ab
cd"""

assert x == "}"

d = {0: 'zero'}
assert f"""{d[0
]}""" == "zero"

assert f'{"quoted string"}' == "quoted string"
assert f'{{ {4*10} }}' == "{ 40 }"
assert f'{{{4*10}}}' == "{40}"

x = 25.48765433
assert f'{x:.3f}' == "25.488"
nb = 3
assert f'{x:.{nb}f}' == "25.488"

def fn(l, incr):
    result = l[0]
    l[0] += incr
    return result

lst = [0]
assert f'{fn(lst,2)} {fn(lst,3)}' == '0 2'
assert f'{fn(lst,2)} {fn(lst,3)}' == '5 7'
assert lst == [10]

d = {0: 10, 1: 20}
for i in range(3):
    if i == 2:
        try:
            f'{i}:{d[i]}'
            raise AssertionError("should have raised KeyError")
        except KeyError:
            pass
    else:
        f'{i}:{d[i]}'

for x in (32, 100, 'fifty'):
   try:
       f'x = {x:+3}'
   except ValueError:
       if x != 'fifty':
           raise

# quote inside fstring
t = 8
assert f"'{t}px'" == "'8px'"

# issue 1086
d = f'''ddf
u{123}
zz'''
assert d == "ddf\nu123\nzz"

# issue 1183
a = f""
assert a == ""

entry = "hello"
a = f"""
<p>
{entry}
</p>
"""
assert a == """
<p>
hello
</p>
"""

# debug f-strings (new in Python 3.8)
x = 5.323
assert f"{x = :.1f}" == "x = 5.3"
y = 8
assert f"{y=}" == "y=8"

# issue 1267
a = 5
assert f'{"is" if a == 1 else "are"}' == "are"
a = 1
assert f'{"is" if a == 1 else "are"}' == "is"

# issue 1427
from math import cos, radians
theta = 30
assert f'{theta=}  {cos(radians(theta))=:.3f}' == \
  "theta=30  cos(radians(theta))=0.866"

# issue 1554
assertRaises(SyntaxError, exec, 'f"Bad format {}"')

# issue 1734
assert f'[{"Text":10}]' == '[Text      ]'
assert f'[{"Text:":10}]' == '[Text:     ]'

x = 45
assert f'{x}' 'b' == '45b'

# issue 1863
a = 2
s = f'foo { a }'
assert s == 'foo 2'

print("passed all tests")