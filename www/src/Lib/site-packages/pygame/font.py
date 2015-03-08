from browser import html
from . import surface

def init():
    return

def quit():
    return

def get_init():
    return True

def get_default_font():
    return "10px sans-serif"


class Font:
  def __init__(self, obj, size):
      self._obj=obj
      self._size=size

  def render(self, text, antialias, color, background=None):
      _canvas=html.CANVAS()
      _ctx=_canvas.getContext('2d')

      if background is not None:
         _ctx.fillStyle='rgb(%s,%s,%s)' % color 
         _ctx.fillRect(0,0, _canvas.width, _canvas.height)

      _ctx.fillStyle='rgb(%s,%s,%s)' % color
      _ctx.fillText(text, 0, 0)

      return surface.Surface(surf=_canvas)    #surface

  def size(self, text):
      _canvas = html.CANVAS(width=1000, height=1000)
      _ctx = _canvas.getContext('2d')
      #_ctx.fillText(text, 0, 0)

      # get text metrics
      _metrics = _ctx.measureText(text);
      return (_metrics.width, _metrics.height)

