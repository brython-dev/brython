#########################
## NEW STYLE FORMAT    ##
## ie, string.format() ##
#########################
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

########################
## OLD STYLE FORMAT   ##
## ie, "%xxx" % value ##
########################
# Signed integer decimal, conversion types 'd', 'u' and 'i'
# Signed integer decimal, conversion types 'd', 'u' and 'i'
assert "%5d" % 3 == '    3'
assert "%5d" % 3.3 == '    3'
assert "%5.2d" % 3 == '   03'
assert "%+5d" % 3 == '   +3'
assert "%-5d" % 3 == '3    '
assert "%#5d" % 3 == '    3'
assert "%05d" % 3 == '00003'
assert "%+05d" % 3 == '+0003'
assert "%+05d" % -3 == '-0003'
assert "% 03d" % 3 == " 03"
assert "%0 3d" % 3 == " 03"
assert "%+ 3d" % 3 == " +3"
assert "%- 3d" % 3 == " 3 "
try:
    "%5d" % '3'
    raise Exception('should have raised TypeError')
except TypeError:
    pass

assert "%5i" % 3 == '    3'
assert "%5i" % 3.3 == '    3'
assert "%5.2i" % 3 == '   03'
assert "%+5i" % 3 == '   +3'
assert "%-5i" % 3 == '3    '
assert "%#5i" % 3 == '    3'
assert "%05i" % 3 == '00003'
assert "%+05i" % 3 == '+0003'

assert "%5u" % 3 == '    3'
assert "%5u" % 3.3 == '    3'
assert "%5.2u" % 3 == '   03'
assert "%+5u" % 3 == '   +3'
assert "%-5u" % 3 == '3    '
assert "%#5u" % 3 == '    3'
assert "%05u" % 3 == '00003'
assert "%+05u" % 3 == '+0003'

assert "%f" % 5 == "5.000000"
assert "%5.f" % 50000 == "50000"
assert "%f" % float('inf') == 'inf'
assert "%F" % float('inf') == 'INF'
assert "%f" % float('nan') == 'nan'
assert "%10.5F" % float('nan') == '       NAN'
assert "%#.0f" % 5 == '5.'
assert "%.0f" % 5 == '5'
assert "%+-015.5f" % -32.1 == "-32.10000      "
assert "% f" % -5325.35 == '-5325.350000'

assert "%o" % 10 == '12'
assert "%#o" % -10 == '-0o12'
assert "%# o" % -10 == '-0o12'
assert "%05o" % -15 == '-0017'

assert "%7.5x" % 7 == '  00007'
assert "%x" % 11 == 'b'
assert "% x" % 11 == ' b'
assert "%+x" % 11 == '+b'
assert "%X" % -11 == '-B'
assert "%#5X" % -11 == ' -0XB'
assert "%# X" % 8 == ' 0X8'
assert "%05x" % -15 == '-000f'

assert "%e" % 1 == '1.000000e+00'
assert "%E" % -0.271 == '-2.710000E-01'
assert "%15.4e" % 3.1415 == '     3.1415e+00'
assert "%e" % 900000000000 == '9.000000e+11'

assert "%g" % 5 == "5"
assert "%g" % 100 == '100'
assert "%.2g" % 100 == '1e+02'
assert "%.2G" % 0.00005 == "5E-05"
assert "%07.2g" % 100 == '001e+02'
assert "%#.1g" % 100 == '1.e+02'
assert "%#.g" % 100 == '1.e+02'
assert "%.1g" % 100 == '1e+02'
assert "%#.4g" % 100 == '100.0'
assert "%g" % 55.5 == '55.5'
assert "%.3g" % 14 == '14'

assert "%c" % "h" == 'h'
assert "%c" % 39 == "'"
assert '%c' % 936 == 'Ψ'
try:
    "%c" % "hello"
except TypeError as err:
    assert str(err) == "%c requires int or char"
else:
    raise Exception("Did not raise error")

assert '''%s %s %.2f %.3g %7.5E %1.1x %#o %s''' % ("hi", 5, 851.532, 14,
          -3381, -851.532, 99, "to you") == 'hi 5 851.53 14 -3.38100E+03 -353 0o143 to you'
assert ("%(hi)s" % {"hi": "bye"}) == "bye"

try:
    "%(boo" % {}
except ValueError as err:
    assert str(err) == "incomplete format key"
else:
    raise Exception("Did not raise error")
