#accessing arguments by position
assert '{0}, {1}, {2}'.format('a', 'b', 'c') == 'a, b, c'
assert '{}, {}, {}'.format('a', 'b', 'c')  == 'a, b, c'
assert '{2}, {1}, {0}'.format('a', 'b', 'c') == 'c, b, a'
assert '{2}, {1}, {0}'.format(*'abc') == 'c, b, a'

assert '{0}{1}{0}'.format('abra', 'cad')  == 'abracadabra'

# accessing arguments by name
assert 'Coordinates: {latitude}, {longitude}'.format(latitude='37.24N', longitude='-115.81W') == 'Coordinates: 37.24N, -115.81W'

coord = {'latitude': '37.24N', 'longitude': '-115.81W'}
assert 'Coordinates: {latitude}, {longitude}'.format(**coord) == 'Coordinates: 37.24N, -115.81W'

#accessing arguments' items:
coord = (3, 5)
assert 'X: {0[0]};  Y: {0[1]}'.format(coord) == 'X: 3;  Y: 5'

assert "repr() shows quotes: {!r}; str() doesn't: {!s}".format('test1', 'test2') == "repr() shows quotes: 'test1'; str() doesn't: test2"

assert '{:<30}'.format('left aligned') == 'left aligned                  '
assert '{:>30}'.format('right aligned') == '                 right aligned'
assert '{:^30}'.format('centered') == '           centered           '

# use '*' as a fill char
assert '{:*^30}'.format('centered') == '***********centered***********'

# show it always
assert '{:+f}; {:+f}'.format(3.14, -3.14)  == '+3.140000; -3.140000'
# show a space for positive numbers
assert '{: f}; {: f}'.format(3.14, -3.14)  == ' 3.140000; -3.140000'
# show only the minus -- same as '{:f}; {:f}'
assert '{:-f}; {:-f}'.format(3.14, -3.14)  == '3.140000; -3.140000'

# format also supports binary numbers
assert "int: {0:d};  hex: {0:x};  oct: {0:o};  bin: {0:b}".format(42) == 'int: 42;  hex: 2a;  oct: 52;  bin: 101010'
# with 0x, 0o, or 0b as prefix:
#brython fix me
#assert "int: {0:d};  hex: {0:#x};  oct: {0:#o};  bin: {0:#b}".format(42) == 'int: 42;  hex: 0x2a;  oct: 0o52;  bin: 0b101010'

assert '{:,}'.format(1234567890) == '1,234,567,890'

points = 19.5
total = 22
#brython fix me
#assert 'Correct answers: {:.2%}'.format(points/total) == 'Correct answers: 88.64%'

assert "The year is {}".format(2010) == 'The year is 2010'

#brython fix me
#assert "{0:{width}.{precision}s}".format('hello world', width=8, precision=5) == 'hello   '

import datetime
d = datetime.date(2010, 9, 7)

assert "The year is {0.year}".format(d) == "The year is 2010"
assert "Tested on {0:%Y-%m-%d}".format(d) == "Tested on 2010-09-07"

import datetime
d = datetime.datetime(2010, 7, 4, 12, 15, 58)
assert '{:%Y-%m-%d %H:%M:%S}'.format(d) == '2010-07-04 12:15:58'
