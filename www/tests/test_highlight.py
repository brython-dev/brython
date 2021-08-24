from browser import highlight

src = """from browser import document, alert"""

assert highlight.highlight(src).html == \
    '<span class="python-keyword">from</span> browser ' \
    '<span class="python-keyword">import</span> document, alert'

print('all tests ok...')