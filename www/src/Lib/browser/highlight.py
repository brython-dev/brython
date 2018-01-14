import keyword
import _jsre as re

from browser import html

letters = 'abcdefghijklmnopqrstuvwxyz'
letters += letters.upper()+'_'
digits = '0123456789'

builtin_funcs = """abs|dict|help|min|setattr|
all|dir|hex|next|slice|
any|divmod|id|object|sorted|
ascii|enumerate|input|oct|staticmethod|
bin|eval|int|open|str|
bool|exec|isinstance|ord|sum|
bytearray|filter|issubclass|pow|super|
bytes|float|iter|print|tuple|
callable|format|len|property|type|
chr|frozenset|list|range|vars|
classmethod|getattr|locals|repr|zip|
compile|globals|map|reversed|__import__|
complex|hasattr|max|round|
delattr|hash|memoryview|set|
"""

kw_pattern = '^('+'|'.join(keyword.kwlist)+')$'
bf_pattern = '^('+builtin_funcs.replace("\n", "")+')$'

def escape(txt):
    txt = txt.replace('<', '&lt;')
    txt = txt.replace('>', '&gt;')
    return txt

def highlight(txt):
    res = html.PRE()
    i = 0
    name = ''
    while i < len(txt):
        car = txt[i]
        if car in ["'", '"']:
            found_match = False
            k = i + 1
            while k < len(txt):
                if txt[k] == car:
                    nb_as = 0
                    j = k - 1
                    while True:
                        if txt[j] == '\\':
                            nb_as += 1
                            j -= 1
                        else:
                            break
                    if nb_as % 2 == 0:
                        res <= name + html.SPAN(escape(txt[i:k + 1]),
                            Class="python-string")
                        i = k
                        name = ''
                        found_match = True
                        break
                k += 1
            if not found_match:
                name += car
        elif car == '#': # comment
            end = txt.find('\n', i)
            if end== -1:
                res <= html.SPAN(escape(txt[i:]), Class="python-comment")
                break
            else:
                res <= html.SPAN(escape(txt[i:end]), Class="python-comment")
                i = end-1
        elif car in letters:
            name += car
        elif car in digits and name:
            name += car
        else:
            if name:
                if re.search(kw_pattern,name):
                    res <= html.SPAN(name, Class="python-keyword")
                elif re.search(bf_pattern,name):
                    res <= html.SPAN(name, Class="python-builtin")
                else:
                    res <= name
                name = ''
            res <= car
        i += 1
    res <= name
    return res