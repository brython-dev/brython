x=0
from browser.html import A,B,BR
print('A',A)
from os import *

def menu(title,links):
    # links is a list of tuples (name,href)
    res = B(title)
    for _name,href in links:
        res += BR()+A(_name,href=href)
    return res
