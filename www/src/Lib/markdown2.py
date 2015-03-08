import browser.html
import re

class URL:
    def __init__(self,src):
        elts = src.split(maxsplit=1)
        self.href = elts[0]
        self.alt = ''
        if len(elts)==2:
            alt = elts[1]
            if alt[0]=='"' and alt[-1]=='"':self.alt=alt[1:-1]
            elif alt[0]=="'" and alt[-1]=="'":self.alt=alt[1:-1]
            elif alt[0]=="(" and alt[-1]==")":self.alt=alt[1:-1]
        
class CodeBlock:
    def __init__(self,line):
        self.lines = [line]
    
    def to_html(self):
        if self.lines[0].startswith("`"):
            self.lines.pop(0)
        res = escape('\n'.join(self.lines))
        res = unmark(res)
        res = '<pre class="marked">%s</pre>\n' %res
        return res,[]

class Marked:
    def __init__(self, line=''):
        self.line = line
        self.children = []

    def to_html(self):
        return apply_markdown(self.line)
        
# get references
refs = {}
ref_pattern = r"^\[(.*)\]:\s+(.*)"

def mark(src):

    global refs
    refs = {}
    # split source in sections
    # sections can be :
    # - a block-level HTML element (markdown syntax will not be processed)
    # - a script
    # - a span-level HTML tag (markdown syntax will be processed)
    # - a code block
    
    # normalise line feeds
    src = src.replace('\r\n','\n')
    
    # lines followed by dashes
    src = re.sub(r'(.*?)\n=+\n', '\n# \\1\n', src)
    src = re.sub(r'(.*?)\n-+\n', '\n## \\1\n', src) 

    lines = src.split('\n')
    
    i = bq = 0
    ul = ol = 0
    
    while i<len(lines):

        # enclose lines starting by > in a blockquote
        if lines[i].startswith('>'):
            nb = 1
            while nb<len(lines[i]) and lines[i][nb]=='>':
                nb += 1
            lines[i] = lines[i][nb:]
            if nb>bq:
                lines.insert(i,'<blockquote>'*(nb-bq))
                i += 1
                bq = nb
            elif nb<bq:
                lines.insert(i,'</blockquote>'*(bq-nb))
                i += 1
                bq = nb
        elif bq>0:
            lines.insert(i,'</blockquote>'*bq)
            i += 1
            bq = 0

        # unordered lists
        if lines[i].strip() and lines[i].lstrip()[0] in '-+*' \
            and (i==0 or ul or not lines[i-1].strip()):
            print('is ul',lines[i])
            # line indentation indicates nesting level
            nb = 1+len(lines[i])-len(lines[i].lstrip())
            lines[i] = '<li>'+lines[i][1+nb:]
            if nb>ul:
                lines.insert(i,'<ul>'*(nb-ul))
                i += 1
            elif nb<ul:
                lines.insert(i,'</ul>'*(ul-nb))
                i += 1
            ul = nb
        elif ul:
            lines.insert(i,'</ul>'*ul)
            i += 1
            ul = 0

        # ordered lists
        mo = re.search(r'^(\d+\.)',lines[i])
        if mo:
            if not ol:
                lines.insert(i,'<ol>')
                i += 1
            lines[i] = '<li>'+lines[i][len(mo.groups()[0]):]
            ol = 1
        elif ol:
            lines.insert(i,'</ol>')
            i += 1
            ol = 0
        i += 1
    
    sections = []
    scripts = []
    section = Marked()

    i = 0
    while i<len(lines):
        line = lines[i]
        if line.strip() and line.startswith('    '):
            if isinstance(section,Marked) and section.line:
                sections.append(section)
            section = CodeBlock(line[4:])
            j = i+1
            while j<len(lines) and lines[j].strip() \
                and lines[j].startswith('    '):
                    section.lines.append(lines[j][4:])
                    j += 1
            sections.append(section)
            section = Marked()
            i = j   
            continue
        elif line.lower().startswith('<script'):
            if isinstance(section,Marked) and section.line:
                sections.append(section)
                section = Marked()
            j = i+1
            while j<len(lines):
                if lines[j].lower().startswith('</script>'):
                    scripts.append('\n'.join(lines[i+1:j]))
                    for k in range(i,j+1):
                        lines[k] = ''
                    break
                j += 1
            i = j
            continue
        else:
            mo = re.search(ref_pattern,line)
            if mo is not None:
                if isinstance(section,Marked) and section.line:
                    sections.append(section)
                    section = Marked()
                key = mo.groups()[0]
                value = URL(mo.groups()[1])
                refs[key.lower()] = value
            else:
                if line.strip():
                    if section.line:
                        section.line += ' '
                    section.line += line
                else:
                    sections.append(section)
                    section = Marked()
            i += 1

    res = ''
    for section in sections:
        mk,_scripts = section.to_html()
        res += '<p>'+mk+'\n'
        scripts += _scripts
    return res,scripts

def escape(czone):
    czone = czone.replace('&','&amp;')
    czone = czone.replace('<','&lt;')
    czone = czone.replace('>','&gt;')
    return czone

def s_escape(mo):
    # used in re.sub
    czone = mo.string[mo.start():mo.end()]
    return escape(czone)

def unmark(code_zone):
    # convert _ to &#95; inside inline code
    code_zone = code_zone.replace('_','&#95;')
    return code_zone

def s_unmark(mo):
    # convert _ to &#95; inside inline code
    code_zone = mo.string[mo.start():mo.end()]
    code_zone = code_zone.replace('_','&#95;')
    return code_zone

def apply_markdown(src):

    scripts = []

    # replace \` by &#96;
    src = re.sub(r'\\\`','&#96;',src)

    # escape < > & in inline code
    code_pattern = r'\`(\S.*?\S)\`'
    src = re.sub(code_pattern,s_escape,src)
    # also convert _
    src = re.sub(code_pattern,s_unmark,src)
    
    # inline links
    link_pattern1 = r'\[(.+?)\]\s?\((.+?)\)'
    def repl(mo):
        g1,g2 = mo.groups()
        g2 = re.sub('_','&#95;',g2)
        return '<a href="%s">%s</a>' %(g2,g1)
    src = re.sub(link_pattern1,repl,src)

    # reference links
    link_pattern2 = r'\[(.+?)\]\s?\[(.*?)\]'
    while True:
        mo = re.search(link_pattern2,src)
        if mo is None:break
        text,key = mo.groups()
        print(text,key)
        if not key:key=text # implicit link name
        if key.lower() not in refs:
            raise KeyError('unknow reference %s' %key)
        url = refs[key.lower()]
        repl = '<a href="'+url.href+'"'
        if url.alt:
            repl += ' title="'+url.alt+'"'
        repl += '>%s</a>' %text
        src = re.sub(link_pattern2,repl,src,count=1)

    # emphasis

    # replace \* by &#42;
    src = re.sub(r'\\\*','&#42;',src)
    # replace \_ by &#95;
    src = re.sub(r'\\\_','&#95;',src)
    # _ and * surrounded by spaces are not markup
    src = re.sub(r' _ ',' &#95; ',src)
    src = re.sub(r' \* ',' &#42; ',src)

    strong_patterns = [('STRONG',r'\*\*(.*?)\*\*'),('B',r'__(.*?)__')]
    for tag,strong_pattern in strong_patterns:
        src = re.sub(strong_pattern,r'<%s>\1</%s>' %(tag,tag),src)

    em_patterns = [('EM',r'\*(.*?)\*'),('I',r'\_(.*?)\_')]
    for tag,em_pattern in em_patterns:
        src = re.sub(em_pattern,r'<%s>\1</%s>' %(tag,tag),src)

    # inline code
    # replace \` by &#96;
    src = re.sub(r'\\\`','&#96;',src)

    code_pattern = r'\`(.*?)\`'
    src = re.sub(code_pattern,r'<code>\1</code>',src)

    # ordered lists
    lines = src.split('\n')
           
    atx_header_pattern = '^(#+)(.*)(#*)'
    for i,line in enumerate(lines):
        print('line [%s]' %line, line.startswith('#'))
        mo = re.search(atx_header_pattern,line)
        if not mo:continue
        print('pattern matches')
        level = len(mo.groups()[0])
        lines[i] = re.sub(atx_header_pattern,
            '<H%s>%s</H%s>\n' %(level,mo.groups()[1],level),
            line,count=1)

    src = '\n'.join(lines)      
    src = re.sub('\n\n+','\n<p>',src)+'\n'

    return src,scripts
