"""Javascript minifier"""
import re

def minify(src):
    
    _res, pos = '', 0
    while pos < len(src):
        if src[pos] in ('"', "'") or \
            (src[pos]=='/' and src[pos-1]=='('):
            # the end of the string is the next quote if it is not
            # after an odd number of backslashes
            start = pos
            while True:
                end = src.find(src[pos], start + 1)
                if end == -1:
                    line = src[:pos].count('\n')
                    raise SyntaxError('string not closed in line %s : %s' %
                                      (line, src[pos:pos + 20]))
                else:
                    # count number of backslashes before the quote
                    nb = 0
                    while src[end-nb-1] == '\\':
                        nb += 1
                    if not nb % 2:
                        break
                    else:
                        start = end+1
            _res += src[pos:end+1]
            pos = end+1
        elif src[pos] == '\r':
            pos += 1
        elif src[pos] == ' ':
            if _res and _res[-1] in '({=[)}];|\n':
                pos += 1
                continue
            _res += ' '
            while pos < len(src) and src[pos] == ' ':
                pos += 1
        elif src[pos:pos + 2] == '//':
            end = src.find('\n', pos)
            if end == -1:
                break
            pos = end
        elif src[pos:pos + 2] == '/*':
            end = src.find('*/', pos)
            if end == -1:
                break
            pos = end+2
        elif src[pos] in '={[(' and _res and _res[-1] == ' ':
            _res = _res[:-1]+src[pos]
            pos += 1
        elif src[pos] in '{[,':
            _res += src[pos]
            while pos < len(src) - 1 and src[pos + 1] in ' \r\n':
                pos += 1
            pos += 1
        elif src[pos] == '}':
            _res += src[pos]
            nxt = pos + 1
            while nxt < len(src) and src[nxt] in ' \r\n':
                nxt += 1
            if nxt < len(src) and src[nxt] == '}':
                pos = nxt - 1
            pos += 1
        else:
            _res += src[pos]
            pos += 1
    # replace consecutive newlines
    _res = re.sub('\n+', '\n', _res)
    # remove newline followed by }
    _res = re.sub('\n}', '}', _res)
    
    return _res

if __name__=="__main__":
    print(minify(open('test.js').read()))
    