from browser import html, document
from .dialog import *
from .progressbar import *
from .slider import *

def add_stylesheet():
    _link=html.LINK(Href='/src/Lib/ui/css/smoothness/jquery-ui-1.10.3.custom.min.css')
    _link.rel='stylesheet'

    document <= _link
