import keyword
import _jsre as re

from browser import html

letters = 'abcdefghijklmnopqrstuvwxyz'
letters += letters.upper()+'_'
digits = '0123456789'

builtin_funcs = ("abs|divmod|input|open|staticmethod|all|enumerate|int|ord|str|any|" +
        "eval|isinstance|pow|sum|basestring|execfile|issubclass|print|super|" +
        "binfile|iter|property|tuple|bool|filter|len|range|type|bytearray|" +
        "float|list|raw_input|unichr|callable|format|locals|reduce|unicode|" +
        "chr|frozenset|long|reload|vars|classmethod|getattr|map|repr|xrange|" +
        "cmp|globals|max|reversed|zip|compile|hasattr|memoryview|round|" +
        "__import__|complex|hash|min|set|apply|delattr|help|next|setattr|" +
        "buffer|dict|hex|object|slice|coerce|dir|id|oct|sorted|intern")

kw_pattern = '^('+'|'.join(keyword.kwlist)+')$'
bf_pattern = '^('+builtin_funcs+')$'

def highlight(txt, string_color="blue", comment_color="green",
    keyword_color="purple"):
    res = html.PRE()
    i = 0
    name = ''
    while i<len(txt):
        car = txt[i]
        if car in ["'",'"']:
            k = i+1
            while k<len(txt):
                if txt[k]==car:
                    nb_as = 0
                    j = k-1
                    while True:
                        if txt[j]=='\\':
                            nb_as+=1
                            j -= 1
                        else:
                            break
                    if nb_as % 2 == 0:
                        res <= html.SPAN(txt[i:k+1],
                            style=dict(color=string_color))
                        i = k
                        break
                k += 1
        elif car == '#': # comment
            end = txt.find('\n', i)
            if end== -1:
                res <= html.SPAN(txt[i:],style=dict(color=comment_color))
                break
            else:
                res <= html.SPAN(txt[i:end],style=dict(color=comment_color))
                i = end-1
        elif car in letters:
            name += car
        elif car in digits and name:
            name += car
        else:
            if name:
                if re.search(kw_pattern,name):
                    res <= html.SPAN(name,style=dict(color=keyword_color))
                elif re.search(bf_pattern,name):
                    res <= html.SPAN(name,style=dict(color=keyword_color))
                else:
                    res <= name
                name = ''
            res <= car
        i += 1
    res <= name
    return res