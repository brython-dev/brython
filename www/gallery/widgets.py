from browser import document, html, window, svg

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

class Svg(svg.svg):

    def __init__(self, side, color="#000", bg="#fff"):
        svg.svg.__init__(self, width=side, height=side)
        self.style.backgroundColor = bg
        self.style.borderColor = '#f00'
        self.style.borderWidth = '2px'
        self.style.borderRadius = '5px'
        self.g = svg.g()
        self <= self.g

class Square(Svg):

    def __init__(self, side, color, **kw):
        super().__init__(side, **kw)
        a = 0.1 * side
        b = 0.9 * side
        self.g <= svg.rect(x=a, y=a,
                           width=b - a, height=b - a,
                           fill=color)


class Disk(Svg):

    def __init__(self, side, color, **kw):
        super().__init__(side, **kw)

        r = 0.9 * side // 2

        self.g <= svg.circle(cx=side // 2, cy=side // 2, r=r,
                             fill=color)

class Play(Svg):

    def __init__(self, side, color, **kw):
        super().__init__(side, **kw)

        a = 0.1 * side
        b = 0.9 * side
        points = f'{a},{a} {b},{side // 2} {a},{b} {a},{a}'
        self.g <= svg.polygon(points=points, fill=color)

class Pause(Svg):

    def __init__(self, side, color, **kw):
        super().__init__(side, **kw)
        stroke_width = side // 6
        bar1 = f'{side // 3},{side // 4} {side // 3},{3 * side // 4}'
        bar2 = f'{2 * side // 3},{side // 4} {2 * side // 3},{3 * side // 4}'

        for bar in (bar1, bar2):
            self.g <= svg.polygon(points=bar, stroke=color,
                                  stroke_width=stroke_width)

