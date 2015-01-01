from javascript import console
from browser import timer
import math

class Queue:
  def __init__(self):
      self._list=[]

  def empty(self):
      return len(self._list) == 0

  def put(self, element):
      self._list.append(element)

  def get(self):
      if len(self._list) == 0:
         raise BaseError

      _element=self._list[0]
      if len(self._list) == 1:
         self._list=[]
      else:
         self._list=self._list[1:]

      return _element

dm={}

def aaline(canvas, color, startpos, endpos, width, outline, blend=1):
    #console.log("aaline")
    if canvas not in dm:
       dm[canvas]=DrawManager(canvas)
       dm[canvas].process()

    _dl=DrawLine(startpos[0], startpos[1], endpos[0], endpos[1], color, 
                 width, outline, speed=10)
    dm[canvas].add_line(_dl)  #color, startpos, endpos, width, outline)

def aapolygon(canvas, color, coordinates, width, outline, blend=1):
    #console.log("aapolygon")
    if canvas not in dm:
       dm[canvas]=DrawManager(canvas)
       dm[canvas].process()

    _dp=DrawPolygon(coordinates, color, width, outline, speed=10)
    dm[canvas].add_polygon(_dp)

def aapolygon_bg(canvas, shape):
    if canvas not in dm:
       dm[canvas]=DrawManager(canvas)
       dm[canvas].process()

    dm[canvas].add_polygon_bg(shape) 

class DrawPolygon:
  def __init__(self, coordinates, color, width, outline, speed=10):
      self.moveTo=coordinates[0]
      self.segments=coordinates[1:]
      self.color=color
      self.width=width
      self.outline=outline

class DrawLine:
  def __init__(self, x0, y0, x1, y1, color, width, outline, speed=None):
      self._type='LINE'
      self._x0=x0
      self._x1=x1
      self._y0=y0
      self._y1=y1

      self._speed=speed
      self._color=color
      self._width=width
      self._outline=outline

  def get_segments(self):
      if self._speed==0:  #no animate since speed is 0 (return one segment)
         return [{'type': self._type, 'x0':self._x0, 'y0': self._y0,
                  'x1': self._x1, 'y1': self._y1, 'color': self._color}]
      
      #need to figure out how to translate speed into pixels, etc
      #maybe speed is pixels per ms?  10 = 10 pixels per millisecond?
      _x=(self._x1 - self._x0)
      _x*=_x

      _y=(self._y1 - self._y0)
      _y*=_y

      _distance=math.sqrt(_x + _y)

      if _distance < self._speed:  # we can do this in one segment
         return [{'type': self._type, 'x0':self._x0, 'y0': self._y0,
                  'x1': self._x1, 'y1': self._y1, 'color': self._color}]
         
      _segments=[]
      _num_segments=math.floor(_distance/self._speed)
      _pos_x=self._x0
      _pos_y=self._y0
      _x_diff=self._x1 - self._x0
      _y_diff=self._y1 - self._y0
      for _i in range(1,_num_segments+1):
          _x=self._x0 + _i/_num_segments * _x_diff
          _y=self._y0 + _i/_num_segments * _y_diff
            
          _segments.append({'type': 'LINE': 'x0': _pos_x, 'y0': _pos_y,
                            'x1': _x, 'y1': _y, 'color': self._color})

          _pos_x=_x
          _pos_y=_y

      if _pos_x != self._x1 or _pos_y != self._y1:
         _segments.append({'type': 'LINE': 'x0': _pos_x, 'y0': _pos_y,
                           'x1': _x, 'y1': _y, 'color': self._color})

      return _segments

class DrawManager:
  def __init__(self, canvas):
      self._queue=Queue()
      self._canvas=canvas
      self._ctx=canvas.getContext('2d')
      self._interval=None

      self._bg=None  #used to capture bg before polygon is drawn

  def __del__(self):
      if self._interval is not None:
         timer.clear_Interval(self._interval)
         self._interval=None

      del self._queue

  def rect_from_shape(self, points):
      _width=self._canvas.width
      _height=self._canvas.height
      _min_x=_width
      _max_x=0
      _min_y=_height
      _max_y=0

      for _point in points:
          _x, _y = _point
          _min_x=min(_min_x, _x)
          _min_y=min(_min_y, _y)
          _max_x=max(_max_x, _x)
          _max_y=max(_max_y, _y)

      _w2=_width/2
      _h2=_height/2
      return math.floor(_min_x-0.5)+_w2, math.floor(_min_y-0.5+_h2), \
             math.ceil(_max_x+0.5)+_w2, math.ceil(_max_y+0.5+_h2)

  def __interval(self):
      if not self._queue.empty():
         _dict=self._queue.get()

         if _dict['type'] == 'LINE':
            self._ctx.beginPath()
            self._ctx.moveTo(_dict['x0'], _dict['y0'])
            self._ctx.lineTo(_dict['x1'], _dict['y1'])
            #if _dict['outline'] is not None:
            #   self._ctx.strokeStyle=_dict['outline']   #set line color
            if _dict['color'] is not None:
               self._ctx.fillStyle=_dict['color']
            self._ctx.stroke()
         elif _dict['type'] == 'POLYGON':
            if self._bg is not None:
               self._ctx.putImageData(self._bg[0], self._bg[1], self._bg[2])
               console.log(self._bg[0])
               self._bg=None

            self._ctx.beginPath()
            _moveTo=_dict['moveTo']
            self._ctx.moveTo(_moveTo[0], _moveTo[1])
            for _segment in _dict['segments']:
                self._ctx.lineTo(_segment[0], _segment[1])

            if _dict['width']:
               self._ctx.lineWidth=_dict['width']
            if _dict['outline']:
               self._ctx.strokeStyle=_dict['outline']
            if _dict['color']:
                self._ctx.fillStyle=_dict['color']
                self._ctx.fill() 

            self._ctx.closePath()
            self._ctx.stroke()
         elif _dict['type'] == 'POLYGON_BG':
            _x0,_y0,_x1,_y1=self.rect_from_shape(_dict['shape'])
            console.log(_x0,_y0,_x1, _y1)
            self._bg=[]
            self._bg.append(self._ctx.getImageData(_x0,_y0,abs(_x1)-abs(_x0),abs(_y1)-abs(_y0)))
            self._bg.append(_x0)
            self._bg.append(_y0)

  def process(self):
      self._interval=timer.set_interval(self.__interval, 10)

  def add_line(self, dl): #color, startpos, endpos, width, outline, speed=None):
      for _segment in dl.get_segments():
          self._queue.put(_segment)

  def add_polygon(self, dp):
      self._queue.put({'type': 'POLYGON', 'moveTo': dp.moveTo,
                       'segments': dp.segments, 'color': dp.color,
                       'outline': dp.outline, 'width': dp.width})

  def add_polygon_bg(self, shape):
      self._queue.put({'type': 'POLYGON_BG', 'shape': shape})
