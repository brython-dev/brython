import re

m = re.search('world', 'hello world')
assert m is not None
assert m.string == 'hello world'
assert m.groups() == ()

m = re.match('world', 'hello world')
assert m is None

m = re.match('hello', 'hello world')
assert m is not None
assert m.string == 'hello world'
assert m.groups() == ()

# Samples code in Python 3 doc MatchObject.groups (indices only)

m = re.match(r"(\d+)\.(\d+)", "24.1632")
assert m.groups() == ('24', '1632')

m = re.match(r"(\d+)\.?(\d+)?", "24")
assert m.groups() == ('24', None)
assert m.groups('0') == ('24', '0')

m = re.match(r"(\d+)\.?(\d+)? (--)", "24 --")
assert m.groups() == ('24', None, '--')
assert m.groups('0') == ('24', '0', '--')

# Samples code in Python 3 doc MatchObject.group (indices only)

m = re.match(r"(\w+) (\w+)", "Isaac Newton, physicist")
assert m.group(0) == 'Isaac Newton'
assert m.group(1) == 'Isaac'
assert m.group(2) == 'Newton'
assert m.group(1, 2) == ('Isaac', 'Newton')

m = re.match(r"(..)+", "a1b2c3")
assert m.group(0) == 'a1b2c3'
assert m.group(1) == 'c3'

print('all tests ok..')

