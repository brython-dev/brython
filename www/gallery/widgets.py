from browser import bind, document, html, window, svg

track_style = dict(
    position='relative',
    backgroundColor='#666',
    borderRadius='5px')

slit_style = dict(
    position="relative",
    borderRadius="2px",
    backgroundColor="#333")

thumb_style = dict(
    position="relative",
    borderRadius='5px',
    background='linear-gradient(to right, #333, #333 50%, #eee)')

class Slider(html.DIV):

  def __init__(self, width, height,
               min_value=0, max_value=1, step=None, value=0):
      html.DIV.__init__(self, style=track_style)
      self.width = width
      self.height = height
      self.value = value
      self.min_value = min_value
      self.max_value = max_value
      self.step = step
      self.value_range = max_value - min_value

      style = slit_style | dict(left=width // 10, width=int(width * 0.8),
                                top=height // 3, height=height // 3)
      slit = html.DIV(style=style)
      self <= slit

      thumb_left = int(width / 2)
      thumb_height = height
      thumb_width = width // 15
      thumb_top = int(-slit.top -(thumb_height - self.height)/2)
      style = thumb_style | dict(top=thumb_top, left=width // 2,
                                 height=thumb_height, width=thumb_width)
      self.thumb = html.DIV(style=style)
      self <= self.thumb
      self.thumb.bind('mousedown', self.mousedown)

      self.min_pos = width // 10
      thumb_pos_range = width * 0.8 - thumb_width
      self.max_pos = self.min_pos + thumb_pos_range
      ratio =  (value - self.min_value) / self.value_range
      self.thumb.left = int(self.min_pos + ratio * thumb_pos_range)

      document <= self

  def mousedown(self, ev):
      self.mouse_pos = [ev.x, ev.y]
      self.thumb_pos = self.thumb.left
      document.bind('mouseup', self.mouseup)
      document.bind('mousemove', self.mousemove)

  def mousemove(self, ev):
      dx = ev.x - self.mouse_pos[0]
      new_pos = self.thumb_pos + dx
      new_pos = max(self.min_pos, new_pos)
      new_pos = min(new_pos, self.max_pos)
      self.thumb.left = new_pos
      ratio = (new_pos - self.min_pos) / (self.max_pos - self.min_pos)
      value = self.min_value + ratio * self.value_range
      self.value = value
      if self.step is not None:
        # round to step
        nb_steps = round((value - self.min_value) / self.step)
        self.value = self.min_value + self.step * nb_steps
      ev = window.MouseEvent.new('input')
      self.dispatchEvent(ev)

  def mouseup(self, ev):
      document.unbind('mouseup', self.mouseup)
      document.unbind('mousemove', self.mousemove)

class _Widget:

    @property
    def color(self):
        return self.element.attrs['fill']

    @color.setter
    def color(self, value):
        self.element.attrs['fill'] = value

    @property
    def size(self):
        if isinstance(self, Square):
            return self.element.attrs['width']
        elif isinstance(self, Disk):
            return self.element.attrs['r']

    @size.setter
    def size(self, value):
        if isinstance(self, Square):
            self.element.attrs['width'] = self.element.attrs['height'] = value
        elif isinstance(self, Disk):
            print('set disk size', value, self.element)
            self.attrs['width'] = value
            self.attrs['height'] = value
            self.element.attrs['r'] = f'calc({value} / 2)'
            self.element.attrs['cx'] = f'calc({value} / 2)'
            self.element.attrs['cx'] = f'calc({value} / 2)'
            print('after change', self.element)

class Square(svg.svg, _Widget):

    def __init__(self, side, color="#000", bg="#fff"):
        svg.svg.__init__(self, width=side, height=side)
        self.style.backgroundColor = bg
        a = 0.1 * side
        b = 0.9 * side
        g = svg.g()
        self <= g
        self.element = svg.rect(x=a, y=a,
                                width=b - a, height=b - a,
                                fill=color)
        g <= self.element

class Disk(svg.svg, _Widget):

    def __init__(self, side, color="#000", bg="#fff"):
        svg.svg.__init__(self, width=side, height=side)
        self.style.backgroundColor = bg
        g = svg.g()
        self <= g
        r = 0.9 * side // 2

        self.element = svg.circle(cx=side // 2, cy=side // 2, r=r,
                                  fill=color)
        g <= self.element

class Play(svg.svg, _Widget):

    def __init__(self, side, color="#000", bg="#fff"):
        svg.svg.__init__(self, width=side, height=side)
        self.style.backgroundColor = bg
        g = svg.g()
        self <= g
        a = 0.1 * side
        b = 0.9 * side
        points = f'{a},{a} {b},{side // 2} {a},{b} {a},{a}'

        self.element = svg.polygon(points=points, fill=color)
        g <= self.element

class Pause(svg.svg, _Widget):

    def __init__(self, size, color="#000", bg="#fff"):
        svg.svg.__init__(self, width=size, height=size,
                         style=f"background-color:{bg}")
        g = svg.g()
        self <= g
        stroke_width = size // 6
        bar1 = f'{size // 3},{size // 4} {size // 3},{3 * size // 4}'
        bar2 = f'{2 * size // 3},{size // 4} {2 * size // 3},{3 * size // 4}'

        self.elements = [
                svg.polygon(points=bar1, stroke=color, stroke_width=stroke_width),
                svg.polygon(points=bar2, stroke=color, stroke_width=stroke_width)
            ]

        g <= self.elements[0]
        g <= self.elements[1]
