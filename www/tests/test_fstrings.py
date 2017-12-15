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

d = {0:10, 1:20}
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