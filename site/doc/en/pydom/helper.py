from browser import doc, html
import urllib.request

#import codeparser

def populate_example(num, url):
    _fp, _url, _headers=urllib.request.urlopen(url)
    _data=_fp.read()

    _pre = doc['source%d' % num]
    _pre.style.background='#EBECE4'

    _code=html.CODE('')
    _code.set_text(_data)

    #uncomment me once codeparser works in brython
    #_code.set_class('language-brython')
    #_data1=[]
    #for _line in _data.split('\n'):
    #    _cp=codeparser.codeparser(_line)
    #    _data1.append(_cp.highlight())

    #_code.set_text('\n'.join(_data1))
    _pre <= _code
