import string
import keyword
import _jsre as re

from browser import document as doc
from browser import html

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

def colorize(txt):
    res = ''
    i = 0
    name = ''
    while i<len(txt):
        car = txt[i]
        if car in ["'",'"']:
            k = i+1
            while k<len(txt):
                if txt[k]==car:
                    res += html.SPAN(txt[i:k+1],Class='string')
                    i = k
                    break
                k += 1
        elif car == '#': # comment
            res += html.SPAN(txt[i:],Class='comment')
            break
        elif car in string.ascii_letters+'_':
            name += car
        elif car in string.digits and name:
            name += car
        else:
            if name:
                if re.search(kw_pattern,name):
                    res += html.SPAN(name,Class='keyword')
                elif re.search(bf_pattern,name):
                    res += html.SPAN(name,Class='keyword')
                else:
                    res += name
                name = ''
            res += car
        i += 1
    res += name
    return res

class Editor:

    def __init__(self,lnums,panel):
        self.lnums = lnums
        self.panel = panel
        self.selected = None
        self.panel.bind('scroll',self.scroll)
        self.panel.bind('mouseup',self.mouseup)
        self.panel.bind('keydown',self.keydown)
    
    def clear(self):
        self.panel.text = ''
        self.lnums.text = ''
    
    def select(self,lnum):
        if self.selected is not None:
            self.panel[self.selected].style.backgroundColor = "#FFF"
            self.lnums[self.selected].style.backgroundColor = "#EEE"
        self.selected = lnum
        self.panel[self.selected].style.backgroundColor = "#EEE"
        self.lnums[self.selected].style.backgroundColor = "#DDD"
    
    def insert(self,pos,text):
        for i,line in enumerate(text.splitlines()):
            txt = html.PRE(colorize(line.rstrip()),Class="src")
            txt.lnum = i
            self.panel <= txt
            self.lnums <= html.PRE(str(i+1)+' ')
        self.panel.scrollTop = 0
        self.lnums.scrollTop = 0
        self.select(0)
        self.panel.focus()

    def mouseup(self,ev):
        if ev.target.nodeName != 'PRE':
            return
        lnum = int(ev.target.lnum)
        self.select(lnum)

    def keydown(self,ev):
        if self.selected is None:
            return
        elif ev.keyCode==40: #key down
            if int(self.selected)<len(self.panel):
                self.select(self.selected+1)
        elif ev.keyCode==38: #key up
            if int(self.selected)>0:
                self.select(self.selected-1)
        elif ev.keyCode==9: #tab
            sel = doc.getSelection()
            pos = sel.getRangeAt(0)
            node = html.SPAN('    ')
            pos.insertNode(node)
            pos.setStartAfter(node)
            sel.removeAllRanges()
            sel.addRange(pos)
            ev.preventDefault()

    def scroll(self,ev):
        pc = ev.target.scrollTop/ev.target.scrollHeight
        self.lnums.scrollTop = pc*self.lnums.scrollHeight

def make_editor(width,height):
    div = html.DIV(Id="main1")
    lnums = html.DIV(Class="lnum",Id='MyDiv',
        style={'textAlign':'right',
        'width':'30px','height':'200px'
        })
    src = html.DIV(Class="src",style=dict(width=600,height=200,white_space="pre"),
        contentEditable=True)
    div <= lnums+src
    doc <= div
    return Editor(lnums,src)

editor = make_editor(20,80)

src = open('/src/Lib/calendar.py').read()
editor.insert(0,src)
