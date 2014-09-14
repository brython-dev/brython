import os
import re

folder = os.path.join(os.path.dirname(os.getcwd()),'site','doc')

def repl(mo):
    return 'href="?page=%s">' %mo.groups()[0].replace('/','%2F')

loader = """
import time
from browser import doc, window, markdown
import header
header.show('../../')

def load():
    target = 'content'
    url = doc.query.getfirst('page','intro')+'.md'
    
    # fake query string to bypass browser cache
    qs = '?foo=%s' %time.time()
    try:
        src = open(url+qs).read()
    except IOError:
        doc[target].html = "Page %s not found" %url
        return False
    
    mk,scripts = markdown.mark(src)
    doc[target].html = mk
    for script in scripts:
        exec(script,globals())

language = "fr"

load()
"""

for lang in ['fr', 'en', 'es', 'pt']:
    dyn = open(os.path.join(folder,lang,'index.html')).read()
    static = open(os.path.join(folder,lang,'static_index.html'),'wb')
    pattern = 'href="#" onClick="load\(\'(.+)\.md\',\'content\'\)">'
    res = re.sub(pattern, repl, dyn)
    
    script_pattern = '<script type="text/python3?">.*?</script>'
    res = re.sub(script_pattern,'<script type="text/python3">%s</script>' %loader, res, flags=re.S)
    
    res = res.replace('<body onLoad="brython(1);load(\'intro.md\',\'content\')">',
        '<body onLoad="brython(1)">')
    static.write(res)
    static.close()
    