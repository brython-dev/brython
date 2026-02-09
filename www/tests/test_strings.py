# strings
from tester import assertRaises, assert_raises

assert 'a'.__class__ == str
assert isinstance('a', str)

hello = "This is a rather long string containing\n\
several lines of text just as you would do in C.\n\
    Note that whitespace at the beginning of the line is\
 significant."

hello = """\
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
"""
hello = r"This is a rather long string containing\n\
several lines of text much as you would do in C."

word = 'Help' + 'A'
assert word == 'HelpA'
assert '<' + word * 5 + '>' == '<HelpAHelpAHelpAHelpAHelpA>'

x = 'str' 'ing'
assert x == 'string'
assert 'str'.strip() + 'ing' == 'string'

assert ' str '.strip() == 'str'
assert ' str '.rstrip() == ' str'
assert ' str '.lstrip() == 'str '

assert "\t\n str\t\n ".strip() == 'str'
assert "\t\n str\t\n ".rstrip() == '\t\n str'
assert "\t\n str\t\n ".lstrip() == 'str\t\n '

# GH Issue 521: handle brackets (and other special characters) correctly
assert '[str]'.rstrip(']') == '[str'
assert '[str]'.lstrip('[') == 'str]'
assert '[-^str-]'.strip('[^a-b]') == 'str'
assert '[-^str-]'.strip('^a-b') == '[-^str-]'

# string methods
x = 'fooss'
assert x.replace('o', 'X', 20) == 'fXXss'
assert 'GhFF'.lower() == 'ghff'
assert x.lstrip('of') == 'ss'
x = 'aZjhkhZyuy'
assert x.find('Z') == 1
assert x.rfind('Z') == 6
assert x.rindex('Z') == 6
try:
    print(x.rindex('K'))
except ValueError:
    pass
assert x.split() == [x]
assert x.split('h') == ['aZj', 'k', 'Zyuy']
#print(x.split('h',1))
assert x.startswith('aZ')
assert x.strip('auy') == 'ZjhkhZ'
assert x.upper() == 'AZJHKHZYUY'

x = "zer"
assert x.capitalize() == "Zer"
assert str.capitalize(x) == "Zer"

x = "azert$t y t"
assert x.count('t') == 3
assert str.count(x, 't') == 3

assert x.endswith("y t") == True

assert x.find('t') == 4
assert x.find('$') == 5
assert x.find('p') == -1

assert x.index('t') == 4

items = ['sd', 'kj']
assert '-'.join(items) == "sd-kj"

assert "ZER".lower() == "zer"

assert "azerty".lstrip('a') == "zerty"
assert "azerty".lstrip('za') == "erty"
assert "azaerty".lstrip('az') == "erty"

assert "$XE$".replace("$XE$", "!") == "!"
assert "$XE".replace("$XE", "!") == '!'
assert "XE$".replace("XE$", "!") == "!"
assert "XE$".replace("$", "!") == "XE!"
assert "$XE".replace("$", "!") == "!XE"
assert "?XE".replace("?", "!") == "!XE"
assert "XE?".replace("?", "!") == "XE!"
assert "XE!".replace("!", "?") == "XE?"

assert "azterty".find('t') == 2
assert "azterty".rfind('t') == 5
assert "azterty".rfind('p') == -1

assert "azterty".rindex('t') == 5

try:
    "azterty".rindex('p')
except ValueError:
    pass

assert "azerty".rstrip('y') == "azert"
assert "azerty".rstrip('yt') == "azer"
assert "azeryty".rstrip('ty') == "azer"

assert "az er ty".split() == ["az", "er", "ty"]
assert "azferfty".split('f') == ["az", "er", "ty"]
assert " aBc  dEf ".split(maxsplit=1) == ['aBc', 'dEf ']
assert " aBc  dEf ".split() == ['aBc', 'dEf']

assert "az\ner\nty".splitlines() == ["az", "er", "ty"]

assert "azerty".startswith('az')

assert "  azerty ".strip() == "azerty"

assert "bghggbazertyhbg".strip("bhg") == "azerty"

assert "zer".upper() == "ZER"

assert  r'(?:([\w ]+) ([\w.]+) .*\[.* ([\d.]+)\])' == (r'(?:([\w ]+) ([\w.]+) '
        '.*'
        '\[.* ([\d.]+)\])'), 'raw string continuation'


# issue 127
assert "aaa+AAA".split("+") == ['aaa', 'AAA']

# issue 265
assert "" in "test"
assert "" in ""
assert not "a" in ""

# issue 285
assert "ab"[1:0:-1] == 'b'

# issue 361
FULL_ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
FULL_ENTEAN_ALPHABET =  "AZYXEWVTISRLPNOMQKJHUGFDCB"
tran_tab = str.maketrans(FULL_ENGLISH_ALPHABET, FULL_ENTEAN_ALPHABET, 'sh')
assert "PETEshelley".translate(tran_tab) == "MEHEelley"

# issue 423
assert 'a'.islower()
assert 'A'.isupper()
assert 'Ⰰ'.isupper() # U+2C00     GLAGOLITIC CAPITAL LETTER AZU
assert 'a0123'.islower()
assert not '0123'.islower() # no uppercase, lowercase or titlecase letter
assert not '0123'.isupper()
assert not '!!!'.isupper()
assert not '!!!'.islower()

# identifiers
assert "x".isidentifier()
assert not "x ".isidentifier()
assert not "x;".isidentifier()
assert not "x$".isidentifier()
assert "André".isidentifier()
assert "안녕하세요".isidentifier()
assert not "1x".isidentifier()

# issue 740
s = "ess\N{LATIN CAPITAL LETTER A}i"
assert s == "essAi"

# repr() of escaped characters

assert repr("a\ab") == "'a\\x07b'"
assert repr("a\bb") == "'a\\x08b'"
assert repr("a\fb") == "'a\\x0cb'"
assert repr("a\nb") == "'a\\nb'"
assert repr("a\rb") == "'a\\rb'"
assert repr("a\tb") == "'a\\tb'"
assert repr("a\\b") == "'a\\\\b'"

# unicode-escape encoding
# https://groups.google.com/forum/?fromgroups=#!topic/brython/jI66k55_zSk
import codecs

d = codecs.decode("Hello,\\nworld!", "unicode-escape")
assert d == "Hello,\nworld!"

d = codecs.decode("Hello,\\tworld!", "unicode-escape")
assert d == "Hello,\tworld!"

d = codecs.decode("Hello,\\bworld!", "unicode-escape")
assert d == "Hello,\bworld!"

d = codecs.decode("Hello,\\'world!", "unicode-escape")
assert d == "Hello,'world!"
d = codecs.decode('Hello,\\"world!', "unicode-escape")
assert d == 'Hello,"world!'


s = bytes("Hello,\\nworld!", "utf-8").decode("unicode-escape")
assert s == "Hello,\nworld!"

s = bytes("Hello,\\tworld!", "utf-8").decode("unicode-escape")
assert s == "Hello,\tworld!"

s = bytes("Hello,\\bworld!", "utf-8").decode("unicode-escape")
assert s == "Hello,\bworld!"


# issue 1049
class Mystring(str):
    pass

assert issubclass(Mystring, str)

# issue 1060
assert str(bytes('abc', encoding='ascii'), encoding='ascii') == "abc"
b = bytes('pythôn', encoding='utf-8')
assert str(b, encoding='ascii', errors='ignore') == "pythn"

# issue 1071
assert 'ß'.encode('ascii', 'ignore') == b''

# issue 1076
assert 'abc'.isascii()
assert not 'abç'.isascii()

# issue 1077
assert str.maketrans({'a': 'A'}) == {97: 'A'}
assert 'xyz'.maketrans({'a': 'A'}) == {97: 'A'}

# issue 1078
assert 'xyz'.maketrans('abc', 'def', 'abd') == {97: None, 98: None, 99: 102,
                                                100: None}

# issue 1103
assert str() == ""

# issue 1231
assert_raises(TypeError, sum, ['a', 'b'],
    msg="unsupported operand type(s) for +: 'int' and 'str'")

# issue 1256
assert "\U00000065" == "e"

# issue 1292
s = 'abcd'
assert s[-100:] == 'abcd'
assert s[:100] == 'abcd'
assert s[-100:100] == 'abcd'

# issue 1306
strs = ['', ' ', '\n', '\n\n', 'a\nb', 'one\ntwo\nthree',
        'one\ntwo\nthree\n', 'one\ntwo\nthree\n\n']
good = [
[], [],
[], [],
[], [],
[' '], [' '],
[' '], [' '],
[' '], [' '],
[''], ['\n'],
[''], ['\r'],
[''], ['\r\n'],
['', ''], ['\n', '\n'],
['', ''], ['\r', '\r'],
['', ''], ['\r\n', '\r\n'],
['a', 'b'], ['a\n', 'b'],
['a', 'b'], ['a\r', 'b'],
['a', 'b'], ['a\r\n', 'b'],
['one', 'two', 'three'], ['one\n', 'two\n', 'three'],
['one', 'two', 'three'], ['one\r', 'two\r', 'three'],
['one', 'two', 'three'], ['one\r\n', 'two\r\n', 'three'],
['one', 'two', 'three'], ['one\n', 'two\n', 'three\n'],
['one', 'two', 'three'], ['one\r', 'two\r', 'three\r'],
['one', 'two', 'three'], ['one\r\n', 'two\r\n', 'three\r\n'],
['one', 'two', 'three', ''], ['one\n', 'two\n', 'three\n', '\n'],
['one', 'two', 'three', ''], ['one\r', 'two\r', 'three\r', '\r'],
['one', 'two', 'three', ''], ['one\r\n', 'two\r\n', 'three\r\n', '\r\n']
]
ii = 0
for ss in strs:
    for sep in ('\n', '\r', '\r\n'):
        ss_ = ss.replace('\n', sep)
        for args in ((), (True,)):
            ll = ss_.splitlines(*args)
            if ll != good[ii]:
                raise AssertionError('%s%s => %s != %s' % (
                    repr(ss_), ' (keepends)' if args==(True,) else '', ll, good[ii]))
            ii += 1

# PEP 616
s = "beforeremove"
assert s.removeprefix("before") == "remove"
assert s == "beforeremove"

assert s.removeprefix("z") == s

s = "removeafter"
assert s.removesuffix("after") == "remove"
assert s == "removeafter"

assert s.removesuffix("z") == s

class S(str):
  pass

s = S("beforeremove")
assert s.removeprefix("before") == "remove"
assert type(s.removeprefix("before")) is str
assert s == "beforeremove"
assert type(s)  is S

assert s.removeprefix("z") == s
assert s is not s.removeprefix("z")

s = S("removeafter")
assert s.removesuffix("after") == "remove"
assert type(s.removesuffix("after")) is str
assert s == "removeafter"
assert type(s) is S

assert s.removesuffix("z") == s
assert s is not s.removesuffix("z")

# issue 1440
assert repr(chr(888)) == r"'\u0378'"

# issue 1500
s = 'abc'
assert s.isprintable()

# upper and lower of surrogate strings
assert '𐐀'.lower() == '𐐨'
assert '𐐨'.upper() == '𐐀'

# issue 1626
class Lamb:
    species_name = "Lamb"
    scientific_name = "Lambius lambalot"

    def __init__(self, name):
        self.name = name

    def __str__(self):
        return "🐑 : " + self.name

lil = Lamb("lil")

import sys

t = []

class Output:

    def write(self, x):
        t.append(str(x))

save_stdout = sys.stdout
sys.stdout = Output()

print(str(lil))
print(lil)

sys.stdout = save_stdout
assert t[0] == '🐑 : lil'
assert t[2] == '🐑 : lil'

assert '🐑 : lil'.replace('🐑 ', 'lamb') == 'lamb: lil'
assert '🐑 : lil'.count('l') == 2
assert '🐑 : lil'.count('🐑 ') == 1
assert '🐑 : lil'.find('🐑 : lil') == 0
assert '🐑 : lil'.find('🐑 ') == 0

lamb = '🐑 '
assert f'{lamb}: lil' == '🐑 : lil'

# issue 1637
try:
    ''.x = 0
    raise AssertionError('should have raised AttributeError')
except AttributeError as exc:
    assert exc.args[0] == ("'str' object has no attribute 'x' " +
        "and no __dict__ for setting new attributes")

try:
    ''.x
    raise AssertionError('should have raised AttributeError')
except AttributeError as exc:
    assert exc.args[0] == "'str' object has no attribute 'x'"

try:
    ''.__dict__
    raise AssertionError('should have raised AttributeError')
except AttributeError as exc:
    assert exc.args[0] == "'str' object has no attribute '__dict__'"

# tests for partition
assert ''.partition('.') == ('', '', '')
assert 'a'.partition('.') == ('a', '', '')
assert '.'.partition('.') == ('', '.', '')
assert 'a.'.partition('.') == ('a', '.', '')
assert 'a.b'.partition('.') == ('a', '.', 'b')
assert 'a.b.c'.partition('.') == ('a', '.', 'b.c')
assert 'a__b'.partition('__') == ('a', '__', 'b')
assert 'a'.partition('__') == ('a', '', '')
assert 'a__b__c'.partition('__') == ('a', '__', 'b__c')

try:
    ''.partition('')
    raise AssertionError('should have raised ValueError')
except ValueError as exc:
    assert exc.args[0] == 'empty separator'

try:
    ''.partition(5)
    raise AssertionError('should have raised TypeError')
except TypeError as exc:
    assert exc.args[0] == "must be str, not int"

# tests for rpartition
assert ''.rpartition('.') == ('', '', '')
assert 'a'.rpartition('.') == ('', '', 'a')
assert '.'.rpartition('.') == ('', '.', '')
assert 'a.'.rpartition('.') == ('a', '.', '')
assert 'a.b'.rpartition('.') == ('a', '.', 'b')
assert 'a.b.c'.rpartition('.') == ('a.b', '.', 'c')
assert 'a__b'.rpartition('__') == ('a', '__', 'b')
assert 'a'.rpartition('__') == ('', '', 'a')
assert 'a__b__c'.rpartition('__') == ('a__b', '__', 'c')

try:
    ''.rpartition('')
    raise AssertionError('should have raised ValueError')
except ValueError as exc:
    assert exc.args[0] == 'empty separator'

try:
    ''.rpartition(5)
    raise AssertionError('should have raised TypeError')
except TypeError as exc:
    assert exc.args[0] == "must be str, not int"

# issue 1772
test = '🤔'
assert ord(test) == 129300
assert len(test) == 1

# issue 1815
assert 'a' * -1 == ''

# PR 1911
assert 'abc'.startswith('b', 1)

# issue 1995
assert '5'.isnumeric()

# issue 1997
class A:
    def __repr__(self):
        return 1

assert_raises(TypeError, str, A(),
    msg="__str__ returned non-string (type int)")

# issue 2132
text = codecs.encode("Beautiful is better than ugly.", "rot13")
assert text == "Ornhgvshy vf orggre guna htyl."

# issue 2136
s = " "
s *= 3
assert s == "   "

# issue 2137
assert '\u007f'.encode('utf-8') == b'\x7f'
assert '\u07ff'.encode('utf-8') == b'\xdf\xbf'
assert '\uffff'.encode('utf-8') == b'\xef\xbf\xbf'

# issue 2154
assert 'abcdef'[3:1] == ''

# issue 2155
assert_raises(TypeError, ord, 'ab')

# issue 2403
assert '%.*E' % (1, 0.9999) == '1.0E+00'
assert '%.*E' % (1, 9.9999) == '1.0E+01'

assert float('%.3g' % 9.99999e-06) == 1e-05

# issue 2438
b = "a🐑 :".encode("utf_16_le")
assert list(b) == [97, 0, 61, 216, 17, 220, 32, 0, 58, 0]
assert b.decode('utf_16_le') == "a🐑 :"

b = "a🐑 :".encode("utf_16_be")
assert list(b) == [0, 97, 216, 61, 220, 17, 0, 32, 0, 58]
assert b.decode('utf_16_be') == "a🐑 :"

b = "a🐑 :".encode("utf_32_be")
assert list(b) == [0, 0, 0, 97, 0, 1, 244, 17, 0, 0, 0, 32, 0, 0, 0, 58]
assert b.decode('utf_32_be') == "a🐑 :"

b = "a🐑 :".encode("utf_32_le")
assert list(b) == [97, 0, 0, 0, 17, 244, 1, 0, 32, 0, 0, 0, 58, 0, 0, 0]
assert b.decode('utf_32_le') == "a🐑 :"

b = "a🐑 :".encode("utf_16")
assert list(b) == [254, 255, 97, 0, 61, 216, 17, 220, 32, 0, 58, 0]
assert b.decode('utf_16') == "a🐑 :"

# issue 2619
assert_raises(TypeError, str, b'a', 5)
assert_raises(TypeError, str, b'a', 'utf-8', 5)

# issue 2659
s = 'abc'
s.__doc__

print("passed all tests...")
