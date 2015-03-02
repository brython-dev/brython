from browser import document, html, window
from javascript import console, JSConstructor

from .rect import Rect
#import pygame.rect

canvas_ID=1

_canvas_id=None

class Surface:
  def __init__(self, dim=[], depth=16, surf=None):
      if surf is None:
         self._depth=depth
         self._canvas=html.CANVAS(width=dim[0], height=dim[1])
      elif isinstance(surf, Surface):
         self._canvas=surf.copy()
         #self._width=surf.get_width()
         #self._height=surf.get_height()
      elif isinstance(surf, html.CANVAS):
         self._canvas=surf
         #self._width=surf.style.width
         #self._height=surf.style.height

      self._context=self._canvas.getContext('2d')
      self._canvas.id='layer_%s' % canvas_ID
      #setattr(self._canvas.style, 'z-index',canvas_ID)
      #setattr(self._canvas.style, 'position', 'relative')
      #setattr(self._canvas.style, 'left', '0px')
      #setattr(self._canvas.style, 'top', '0px')
      canvas_ID+=1

      #document['pydiv'] <= self._canvas

  def blit(self, source, dest, area=None, special_flags=0):
      #if area is None and isinstance(source, str):
      #   _img = JSConstructor(window.Image)()
      #   _img.src = source

      #   def img_onload(*args):
      #       self._context.drawImage(_img, dest[0], dest[1])

      #   _img.onload=img_onload
      #   _img.width, _img.height

      global _canvas_id

      if _canvas_id is None:
         try:
           _canvas_id=document.get(selector='canvas')[0].getAttribute('id')
         except:
           pass

      if self._canvas.id == _canvas_id:
         self._canvas.width=self._canvas.width
      
      if area is None:
            #lets set area to the size of the source
         if isinstance(source, Surface):
            area=[(0, 0), (source.canvas.width, source.canvas.height)]


      if isinstance(source, Surface):
         _ctx=source.canvas.getContext('2d')
         _subset=_ctx.getImageData(area[0][0],area[0][1], area[1][0], area[1][1])
         # we want just a subset of the source image copied
         self._context.putImageData(_subset, dest[0], dest[1])
         #print(dest[0], dest[1], _subset.width, _subset.height)
         return Rect(dest[0], dest[1], dest[0]+_subset.width, dest[1]+_subset.height)

  def convert(self, surface=None):
      ## fix me...
      return self

  def copy(self):
      _imgdata=self._context.toDataURL('image/png')
 
      _canvas=html.CANVAS(width=self._canvas.width,height=self._canvas.height)
      _ctx=_canvas.getContext('2d')
      _ctx.drawImage(_imgdata, 0, 0)

      return _canvas
             
  def fill(self, color):
      """ fill canvas with this color """
      self._context.fillStyle="rgb(%s,%s,%s)" % color
      #console.log(self._canvas.width, self._canvas.height, self._context.fillStyle)
      self._context.fillRect(0,0,self._canvas.width,self._canvas.height)
      #self._context.fill()

  @property
  def height(self):
      return int(self._canvas.height)

  @property
  def width(self):
      return int(self._canvas.width)

  @property
  def canvas(self):
      return self._canvas

  def scroll(self, dx=0, dy=0):
      _imgdata=self._context.toDataURL('image/png')
      self._context.drawImage(_imgdata, dx, dy)

  def get_at(self, pos):
      #returns rgb
      return self._context.getImageData(pos[0], pos[1],1,1).data

  def set_at(self, pos, color):
      self._context.fillStyle='rgb(%s,%s,%s)' % color
      self._context.fillRect(pos[0], pos[1], 1, 1)

  def get_size(self):
      return self._canvas.width, self._canvas.height

  def get_width(self):
      return self._canvas.width

  def get_height(self):
      return self._canvas.height

  def get_rect(self, centerx=None, centery=None):
      return Rect(0, 0, self._canvas.width, self._canvas.height)

  def set_colorkey(self, key, val):
      pass
