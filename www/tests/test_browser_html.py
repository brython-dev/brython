import browser.html as html

assert html.H2 is html.tags['H2']

class MyH1:
    pass

html.tags['H1'] = MyH1

assert html.tags['H1'] == html.H1

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

print('all tests passed...')