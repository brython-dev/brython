import browser.html as html

assert html.H2 is html.tags['H2']

class MyH1:
    pass

html.tags['H1'] = MyH1

assert html.tags['H1'] == MyH1

assert html.tags == html.tags
nb = len(html.tags)

html.tags['GGHHJJ'] = 77
assert len(html.tags) == nb + 1
assert(len(html.tags.items())) == nb + 1
assert(len(html.tags.keys())) == nb + 1
assert(len(html.tags.values())) == nb + 1
assert 'GGHHJJ' in html.tags

del html.tags['GGHHJJ']
assert len(html.tags) == nb
assert(len(html.tags.items())) == nb
assert(len(html.tags.keys())) == nb
assert(len(html.tags.values())) == nb
assert 'GGHHJJ' not in html.tags

del html.tags['H6']
assert len(html.tags) == nb - 1
assert(len(html.tags.items())) == nb - 1
assert(len(html.tags.keys())) == nb - 1
assert(len(html.tags.values())) == nb - 1
assert 'H6' not in html.tags


# issue 619
from browser.html import H2

class _ElementMixIn:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._sargs = []
        self._kargs = {}

    def mytest(self):
        self._sargs.append(5)

    def mytest2(self):
        self._kargs[5] = '5'


kls = type('h2', (_ElementMixIn, H2,), {})

x = kls()
x.mytest()
assert x._sargs == [5]
x.mytest2()
assert x._kargs[5] == '5'

print('all tests passed...')