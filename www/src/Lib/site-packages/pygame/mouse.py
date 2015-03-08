from browser import document #, mouseCoords
from javascript import console

_mouse_x, _mouse_y=0,0

_canvas=None

def _getMousePosition(e):
    global _mouse_x, _mouse_y, _canvas
    _rect=_canvas.getBoundingCientRRect()
    _mouse_x=e.clientX - _rect.left
    _mouse_y=e.clientY - _rect.top

def get_pos():
    global _canvas
    if _canvas is None:
       _c=document.get(selector='canvas')
       if len(_c) > 0:
          _canvas=_c[0]
          console.log(_canvas.id)
          _canvas.mousemove=_getMousePosition

    return _mouse_x, _mouse_y
