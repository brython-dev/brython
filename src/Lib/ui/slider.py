from . import widget
from browser import doc,html

class Slider(widget.Widget):

  def __init__(self, id=None, label=False):

      self._div_shell=html.DIV(Class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all")

      widget.Widget.__init__(self, self._div_shell, 'slider', id)

      self._handle=html.A(Class="ui-slider-handle ui-state-default ui-corner-all",
                          Href='#', style={'left': '0px'})
      self._value=0
      self._isMouseDown=False
      self.m0 = [None, None]

      def startSlide(ev):
          self._isMouseDown=True
          self._upperBound = self._div_shell.offsetWidth - self._handle.offsetWidth

          pos = widget.getMousePosition(ev)
          self._startMouseX=pos['x']

          print('left', self._handle.style.left,'ev.x',ev.x)
          self._lastElementLeft = int(self._handle.left)
          print('left', self._lastElementLeft)
          updatePosition(ev)

      def updatePosition(ev):
          #pos = widget.getMousePosition(ev)
          #print('mose pos',pos)
          _newPos = self._lastElementLeft + ev.x - self._startMouseX
          
          _newPos = max(0, _newPos)
          _newPos = min(_newPos, self._upperBound)

          self._handle.left = _newPos
          print('new position',self._handle.style.left)
          self._lastElementLeft = _newPos

      def moving(e):
          if self._isMouseDown:
             updatePosition(e)

      def dropCallback(e):
          self._isMouseDown=False
          self._handle.unbind('mousemove', moving)


      self._handle.bind('mousemove', moving)
      self._handle.bind('mouseup', dropCallback)
      #self._handle.bind('mouseout', dropCallback)
      self._handle.bind('mousedown', startSlide)

      def mouseover(e):
          _class=self._handle.getAttribute('class')
          self._handle.setAttribute('class', '%s %s' % (_class, 'ui-state-hover'))

      def mouseout(e):
          self._isMouseDown=False
          _class=self._handle.getAttribute('class')
          self._handle.setAttribute('class', _class.replace('ui-state-hover', ''))

      self._handle.bind('mouseover', mouseover)
      self._handle.bind('mouseout', mouseout)

      self._div_shell <= self._handle

  def get_value(self):
      return self._value

  #def set_value(self, value):
  #    self._value=value
  #   self._handle.style.left='%spx' % value
