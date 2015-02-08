"""Wrapper around the jQuery UI library

Exposes a single object, jq, to manipulate the widgets designed in the library

This object supports :
- subscription : js[elt_id] returns an object matching the element with the
  specified id
- a method get(**kw). The only keyword currently supported is "selector". The
  method returns a list of instances of the class Element, each instance wraps
  the elements matching the CSS selector passed
  
  jq(selector="button") : returns instances of Element for all button tags

  The value can be a list or tuple of CSS selector strings :

  js(selector=("input[type=submit]","a")) : instances of Element for all
  "input" tags with attribute "type" set to "submit" + "a" tags (anchors)

Instances of Element have the same interface as the selections made by the
jQuery function $, with the additional methods provided by jQuery UI. For 
instance, to turn an element into a dialog :

jq[elt_id].dialog()

When jQuery UI methods expect a Javascript object, they can be passed as
key/value pairs :

jq['tags'].autocomplete(source=availableTags)

"""
from browser import html, document, window
import javascript

_path = __file__[:__file__.rfind('/')]+'/'

document <= html.LINK(rel="stylesheet",
    href=_path+'css/smoothness/jquery-ui.css')

# The scripts must be loaded in blocking mode, by using the function 
# load(script_url[, names]) in module javascript
# If we just add them to the document with script tags, eg :
#
# document <= html.SCRIPT(sciprt_url)
# _jqui = window.jQuery.noConflict(True)
#
# the name "jQuery" is not in the Javascript namespace until the script is 
# fully loaded in the page, so "window.jQuery" raises an exception

# Load jQuery and put name 'jQuery' in the global Javascript namespace
javascript.load(_path+'jquery-1.11.2.js', ['jQuery'])
javascript.load(_path+'jquery-ui.js')

_jqui = window.jQuery.noConflict(True)

_events = ['abort',
'beforeinput',
'blur',
'click',
'compositionstart',
'compositionupdate',
'compositionend',
'dblclick',
'error',
'focus',
'focusin',
'focusout',
'input',
'keydown',
'keyup',
'load',
'mousedown',
'mouseenter',
'mouseleave',
'mousemove',
'mouseout',
'mouseover',
'mouseup',
'resize',
'scroll',
'select',
'unload']

class JQFunction:

    def __init__(self, func):
        self.func = func
    
    def __call__(self, *args, **kw):
        if kw:
            # keyword arguments are passed as a single Javascript object
            return self.func(*args, kw)
        else:
            return self.func(*args)

class Element:
    """Wrapper around the objects returned by jQuery selections"""

    def __init__(self, item):
        self.item = item

    def bind(self, event, callback):
        """Binds an event on the element to function callback"""
        getattr(self.item, event)(callback)

    def __getattr__(self, attr):
        res = getattr(self.item, attr)
        if attr in _events:
            # elt.click(f) is handled like elt.bind('click', f)
            return lambda f:self.bind(attr, f)
        if callable(res):
            res = JQFunction(res)
        return res

class jq:

    @staticmethod
    def get(**selectors):
        items = []
        for k,v in selectors.items():
            if k=='selector':
                if isinstance(v,[list, tuple]):
                    values = v
                else:
                    values = [v]
                for value in values:
                    items.append(Element(_jqui(value)))
            elif k=='element':
                items = Element(_jqui(v))
        return items
    
    @staticmethod
    def __getitem__(element_id):
        return jq.get(selector='#'+element_id)[0]
    