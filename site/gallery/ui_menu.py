# Menu classes

from browser import html, document

class Menu(html.DIV):

    def __init__(self):
        html.DIV.__init__(self,style=dict(paddingBottom='5px'))
        
class BarItem:

    def __init__(self, parent, label):
        self.item = html.DIV(label,style=dict(float='left',
            padding='5px 7px 5px 7px',
            borderWidth='1px', borderStyle='solid', borderColor='#FFF')
            )
        self.item.bind('click', self.open)
        parent <= self.item
        self.children = []

    def open(self, ev):
        self.menu = html.DIV(style=dict(position='absolute',
            left=self.item.left,
            top=self.item.top+self.item.height,
            zIndex=99,padding='5px',backgroundColor='#FFF',
            borderStyle='solid', borderWidth='1px', borderColor="#777"))
        for child in self.children:
            self.menu <= child
        self.item.style.borderColor = '#777'
        document <= self.menu
        ev.stopPropagation()

    def close(self):
        self.item.style.borderColor = '#FFF'
        document.remove(self.menu)
        
class MenuListItem:

    def __init__(self, parent, label, action=None):
        item = html.DIV(label, style=dict(padding='10px'))
        item.bind('mouseover', over_menu)
        item.bind('mouseout', out_menu)
        if action is not None:
            item.bind('click', action)
        parent.children.append(item)

def over_menu(ev):
    ev.target.style.backgroundColor='#DDD'

def out_menu(ev):
    ev.target.style.backgroundColor='#FFF'

