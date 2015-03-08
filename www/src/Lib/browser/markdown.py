# -*- coding: utf-8 -*-

try:
    import _jsre as re
except:
    import re

import random
import time

letters = 'abcdefghijklmnopqrstuvwxyz'
letters += letters.upper()+'0123456789'

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
        if line.startswith("```") and len(line)>3:
            self.info = line[3:]
        else:
            self.info = None
    
    def to_html(self):
        if self.lines[0].startswith("`"):
            self.lines.pop(0)
        res = escape('\n'.join(self.lines))
        res = unmark(res)
        _class = self.info or "marked"
        res = '<pre class="%s">%s</pre>\n' %(_class, res)
        return res,[]

class HtmlBlock:

    def __init__(self, src):
        self.src = src
    
    def to_html(self):
        return self.src
        
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
    t0 = time.time()
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

    lines = src.split('\n')+['']
    
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
            and len(lines[i].lstrip())>1 \
            and lines[i].lstrip()[1]==' ' \
            and (i==0 or ul or not lines[i-1].strip()):
            # line indentation indicates nesting level
            nb = 1+len(lines[i])-len(lines[i].lstrip())
            lines[i] = '<li>'+lines[i][nb:]
            if nb>ul:
                lines.insert(i,'<ul>'*(nb-ul))
                i += 1
            elif nb<ul:
                lines.insert(i,'</ul>'*(ul-nb))
                i += 1
            ul = nb
        elif ul and not lines[i].strip():
            if i<len(lines)-1 and lines[i+1].strip() \
                and not lines[i+1].startswith(' '):
                    nline = lines[i+1].lstrip()
                    if nline[0] in '-+*' and len(nline)>1 and nline[1]==' ':
                        pass
                    else:
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
        elif ol and not lines[i].strip() and i<len(lines)-1 \
            and not lines[i+1].startswith(' ') \
            and not re.search(r'^(\d+\.)',lines[i+1]):
            lines.insert(i,'</ol>')
            i += 1
            ol = 0
        
        i += 1
    
    if ul:
        lines.append('</ul>'*ul)
    if ol:
        lines.append('</ol>'*ol)
    if bq:
        lines.append('</blockquote>'*bq)

    t1 = time.time()
    #print('part 1', t1-t0)    
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
            while j<len(lines) and lines[j].startswith('    '):
                section.lines.append(lines[j][4:])
                j += 1
            sections.append(section)
            section = Marked()
            i = j   
            continue

        elif line.strip() and line.startswith("```"):
            # fenced code blocks à la Github Flavoured Markdown
            if isinstance(section,Marked) and section.line:
                sections.append(section)
            section = CodeBlock(line)
            j = i+1
            while j<len(lines) and not lines[j].startswith("```"):
                section.lines.append(lines[j])
                j += 1
            sections.append(section)
            section = Marked()
            i = j+1
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

        # atext header
        elif line.startswith('#'):
            level = 1
            line = lines[i]
            while level<len(line) and line[level]=='#' and level<=6:
                level += 1
            if not line[level+1:].strip():
                if level==1:
                    i += 1
                    continue
                else:
                    lines[i] = '<H%s>%s</H%s>\n' %(level-1,'#',level-1)
            else:
                lines[i] = '<H%s>%s</H%s>\n' %(level,line[level+1:],level)

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
                if not line.strip():
                    line = '<p></p>'
                if section.line:
                    section.line += '\n'
                section.line += line
                    
            i += 1
    t2 = time.time()
    #print('section 2', t2-t1)
    if isinstance(section,Marked) and section.line:
        sections.append(section)

    res = ''
    for section in sections:
        mk,_scripts = section.to_html()
        res += mk
        scripts += _scripts
    #print('end mark', time.time()-t2)
    return res,scripts

def escape(czone):
    czone = czone.replace('&','&amp;')
    czone = czone.replace('<','&lt;')
    czone = czone.replace('>','&gt;')
    czone = czone.replace('_','&#95;')
    czone = czone.replace('*','&#42;')
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
    key = None

    t0 = time.time()
    i = 0
    while i<len(src):
        if src[i]=='[':
            start_a = i+1
            while True:
                end_a = src.find(']',i)
                if end_a == -1:
                    break
                if src[end_a-1]=='\\':
                    i = end_a+1
                else:
                    break
            if end_a>-1 and src[start_a:end_a].find('\n')==-1:
                link = src[start_a:end_a]
                rest = src[end_a+1:].lstrip()
                if rest and rest[0]=='(':
                    j = 0
                    while True:
                        end_href = rest.find(')',j)
                        if end_href == -1:
                            break
                        if rest[end_href-1]=='\\':
                            j = end_href+1
                        else:
                            break
                    if end_href>-1 and rest[:end_href].find('\n')==-1:
                        tag = '<a href="'+rest[1:end_href]+'">'+link+'</a>'
                        src = src[:start_a-1]+tag+rest[end_href+1:]
                        i = start_a+len(tag)
                elif rest and rest[0]=='[':
                    j = 0
                    while True:
                        end_key = rest.find(']',j)
                        if end_key == -1:
                            break
                        if rest[end_key-1]=='\\':
                            j = end_key+1
                        else:
                            break
                    if end_key>-1 and rest[:end_key].find('\n')==-1:
                        if not key:
                            key = link
                        if key.lower() not in refs:
                            raise KeyError('unknown reference %s' %key)
                        url = refs[key.lower()]
                        tag = '<a href="'+url+'">'+link+'</a>'
                        src = src[:start_a-1]+tag+rest[end_key+1:]
                        i = start_a+len(tag)
        
        i += 1

    t1 = time.time()
    #print('apply markdown 1', t1-t0)
    # before applying the markup with _ and *, isolate HTML tags because 
    # they can contain these characters

    # We replace them temporarily by a random string
    rstr = ''.join(random.choice(letters) for i in range(16))
    
    i = 0
    state = None
    start = -1
    data = ''
    tags = []
    while i<len(src):
        if src[i]=='<':
            j = i+1
            while j<len(src):
                if src[j]=='"' or src[j]=="'":
                    if state==src[j] and src[j-1]!='\\':
                        state = None
                        j = start+len(data)+1
                        data = ''
                    elif state==None:
                        state = src[j]
                        start = j
                    else:
                        data += src[j]
                elif src[j]=='>' and state is None:
                    tags.append(src[i:j+1])
                    src = src[:i]+rstr+src[j+1:]
                    i += len(rstr)
                    break
                elif state=='"' or state=="'":
                    data += src[j]
                elif src[j]=='\n':
                    # if a sign < is not followed by > in the same ligne, it
                    # is the sign "lesser than"
                    src = src[:i]+'&lt;'+src[i+1:]
                    j=i+4
                    break
                j += 1
        elif src[i]=='`' and i>0 and src[i-1]!='\\':
            # ignore the content of inline code
            j = i+1
            while j<len(src):
                if src[j]=='`' and src[j-1]!='\\':
                    break
                j += 1
            i = j
        i += 1                    

    t2 = time.time()
    #print('apply markdown 2', len(src), t2-t1)

    # escape "<", ">", "&" and "_" in inline code
    code_pattern = r'\`(.*?)\`'
    src = re.sub(code_pattern,s_escape,src)

    # replace escaped ` _ * by HTML characters
    src = src.replace(r'\\`','&#96;')
    src = src.replace(r'\_','&#95;')
    src = src.replace(r'\*','&#42;')

    # emphasis
    strong_patterns = [('STRONG',r'\*\*(.*?)\*\*'),('B',r'__(.*?)__')]
    for tag,strong_pattern in strong_patterns:
        src = re.sub(strong_pattern,r'<%s>\1</%s>' %(tag,tag),src)

    em_patterns = [('EM',r'\*(.*?)\*'),('I',r'\_(.*?)\_')]
    for tag,em_pattern in em_patterns:
        src = re.sub(em_pattern,r'<%s>\1</%s>' %(tag,tag),src)

    # inline code
    code_pattern = r'\`(.*?)\`'
    src = re.sub(code_pattern,r'<code>\1</code>',src)
    
    # restore tags
    while True:
        pos = src.rfind(rstr)
        if pos==-1:
            break
        repl = tags.pop()
        src = src[:pos]+repl+src[pos+len(rstr):]

    src = '<p>'+src+'</p>'

    t3 = time.time()
    #print('apply markdown 3', t3-t2)

    return src,scripts
