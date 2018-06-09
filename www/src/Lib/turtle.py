# A revised version of CPython's turtle module written for Brython
# 

# Note: This version is not intended to be used in interactive mode,
# nor use help() to look up methods/functions definitions. The docstrings
# have thus been shortened considerably as compared with the CPython's version.
# 
# All public methods/functions of the CPython version should exist, if only
# to print out a warning that they are not implemented. The intent is to make
# it easier to "port" any existing turtle program from CPython to the browser.
# 
# IMPORTANT: We use SVG for drawing turtles. If we have a turtle at an angle
# of 350 degrees and we rotate it by an additional 20 degrees, we will have
# a turtle at an angle of 370 degrees.  For turtles drawn periodically on 
# a screen (like typical animations, including the CPython turtle module),
# drawing a turtle with a rotation of 370 degrees is the same as a rotation of
# 10 degrees.  However, using SVG, if we "slowly" animate an object, 
# rotating it from 350 to 370 degrees, the result will not be the same 
# as rotating it from 350 to 10 degrees. For this reason, we did not use the
# Vec2D class from the CPython module and handle the rotations quite differently.


import math
import sys

from math import cos, sin

from browser import console, document, html, timer
import _svg as svg
import copy

# Even though it is a private object, use the same name for the configuration
# dict as the CPython's module.

# Commented out configuration items are those found on the CPython version
_CFG = {
        # "width" : 0.5,               # Screen
        # "height" : 0.75,
        "canvwidth" : 500,
        "canvheight": 500,
        # "leftright": None,
        # "topbottom": None,
        "mode": "standard",
        # "colormode": 1.0,
        # "delay": 10,
        # "undobuffersize": 1000, 
        "shape": "classic",
        "pencolor" : "black",
        "fillcolor" : "black",
        # "resizemode" : "noresize",
        "visible" : True,
        # "language": "english",        # docstrings
        # "exampleturtle": "turtle",
        # "examplescreen": "screen",
        # "title": "Python Turtle Graphics",
        # "using_IDLE": False

        # Below are configuration items specific to this version
        "turtle_canvas_wrapper": None,
        "turtle_canvas_id": "turtle-canvas",
        "min_duration": "1ms"
        }

_cfg_copy = copy.copy(_CFG)


def set_defaults(**params):
    """Allows to override defaults."""
    _CFG.update(**params)
    Screen().reset()


class FormattedTuple(tuple):
    '''used to give a nicer representation of the position'''
    def __new__(cls, x, y):
        return tuple.__new__(cls, (x, y))
    def __repr__(self):
        return "(%.2f, %.2f)" % self

def create_circle(r):
    '''Creates a circle of radius r centered at the origin'''
    circle = svg.circle(x=0, y=0, r=r, stroke="black", fill="black")
    circle.setAttribute("stroke-width", 1)
    return circle


def create_polygon(points):
    '''Creates a polygon using the points provided'''
    points = ["%s,%s " % (x, y) for x, y in points]
    polygon = svg.polygon(points=points, stroke="black", fill="black")
    polygon.setAttribute("stroke-width", 1)
    return polygon 


def create_rectangle(width=2, height=2, rx=None, ry=None):
    '''Creates a rectangle centered at the origin. rx and ry can be
       used to have rounded corners'''
    rectangle = svg.rect(x=-width/2, y=-height/2, width=width, 
                         height=height, stroke="black", fill="black")
    rectangle.setAttribute("stroke-width", 1)
    if rx is not None:
        rectangle.setAttribute("rx", rx)
    if ry is not None:
        rectangle.setAttribute("ry", ry)
    return rectangle


def create_square(size=2, r=None):
    '''Creates a square centered at the origin. rx and ry can be
       used to have rounded corners'''
    return create_rectangle(width=size, height=size, rx=r, ry=r)


class TurtleGraphicsError(Exception):
    """Some TurtleGraphics Error
    """
    pass


class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Screen(metaclass=Singleton):

    def __init__(self):
        self.shapes = {
            'arrow': (create_polygon, ((-10, 0), (10, 0), (0, 10))),
            'turtle': (create_polygon, ((0, 16), (-2, 14), (-1, 10), (-4, 7),
                        (-7, 9), (-9, 8), (-6, 5), (-7, 1), (-5, -3), (-8, -6),
                        (-6, -8), (-4, -5), (0, -7), (4, -5), (6, -8), (8, -6),
                        (5, -3), (7, 1), (6, 5), (9, 8), (7, 9), (4, 7), (1, 10),
                        (2, 14))),
            'classic': (create_polygon, ((0, 0), (-5, -9), (0, -7), (5, -9))),
            'triangle': (create_polygon, ((10, -5.77), (0, 11.55), (-10, -5.77))),
            'square': (create_square, 20), 
            'circle': (create_circle, 10)
        }
        self.reset()
        self._set_geometry()

    def bgcolor(self, color=None):
        """sets the background with the given color if color is not None,
        else return current background color.
        """
        if color is None:
            return self.background_color
        self.background_color = color
        width = _CFG['canvwidth']
        height = _CFG['canvheight']
        if self.mode() in ['logo', 'standard']:
            x = -width//2 
            y = -height//2 
        else:
            x = 0
            y = -height

        self.frame_index += 1
        rect = svg.rect(x=x, y=y, width=width, height=height, fill=color,
                            style={'display': 'none'})
        an = svg.animate(Id="animation_frame%s" % self.frame_index,
                              attributeName="display", attributeType="CSS",
                              From="block", to="block", dur=_CFG["min_duration"],
                              fill='freeze')
        an.setAttribute('begin', "animation_frame%s.end" % (self.frame_index-1))
        rect <= an

        self.background_canvas <=rect

    def _convert_coordinates(self, x, y):
        """In the browser, the increasing y-coordinate is towards the 
           bottom of the screen; this is the opposite of what is assumed 
           normally for the methods in the CPython turtle module.

           This method makes the necessary orientation. It should be called
           just prior to creating any SVG element.
        """
        return x*self.yscale, self.y_points_down * y*self.yscale


    def create_svg_turtle(self, _turtle, name):
        if name in self.shapes:
            fn = self.shapes[name][0]
            arg = self.shapes[name][1]
        else:
            print("Unknown turtle '%s'; the default turtle will be used")
            fn = self.shapes[_CVG["shape"]][0]
            arg = self.shapes[_CVG["shape"]][1]
        shape = fn(arg)
        if self._mode == 'standard' or self._mode == 'world':
            rotation = -90
        else:
            rotation = 0
        return shape, rotation

    def _dot(self, pos, size, color):
        """Draws a filled circle of specified size and color"""
        if color is None:
            color = 'black'
        if size is None or size < 1:
            size = 1
        self.frame_index += 1

        x, y = self._convert_coordinates(pos[0], pos[1])

        circle = svg.circle(cx=x, cy=y, r=size, fill=color,
                            style={'display': 'none'})
        an = svg.animate(Id="animation_frame%s" % self.frame_index,
                              attributeName="display", attributeType="CSS",
                              From="block", to="block", dur=_CFG["min_duration"],
                              fill='freeze')
        an.setAttribute('begin', "animation_frame%s.end" % (self.frame_index-1))
        circle <= an
        self.canvas <= circle

    def _drawline(self, _turtle, coordlist=None,
                  color=None, width=1, speed=None):
        """Draws an animated line with a turtle
            - coordlist is the egin and end coordinates of the line
            - color should include the current outline and fill colors;
            - width is width of line to be drawn.
            - speed is the animation speed
        """

        outline = color[0]
        fill = color[1]

        x0, y0 = coordlist[0]
        x1, y1 = coordlist[1]

        x0, y0 = self._convert_coordinates(x0, y0)
        x1, y1 = self._convert_coordinates(x1, y1)

        # The speed scale does not correspond exactly to the CPython one...
        if speed == 0:
            duration = _CFG["min_duration"]
        else:
            dist = _turtle._distance
            if speed is None or speed == 1:
                duration = 0.02 * dist
            else:
                duration = 0.02 * dist / speed ** 1.2
            if duration < 0.001:
                duration = _CFG["min_duration"]
            else:
                duration = "%6.3fs" % duration

        drawing = _turtle._drawing 

        _line = svg.line(x1=x0, y1=y0, x2=x0, y2=y0,
                          style={'stroke': outline, 'stroke-width': width})
        if not drawing:
            _line.setAttribute('opacity', 0)

        # always create one animation for timing purpose
        begin = "animation_frame%s.end" % self.frame_index
        self.frame_index += 1
        _an1 = svg.animate(Id="animation_frame%s" % self.frame_index,
                            attributeName="x2", attributeType="XML",
                            From=x0, to=x1, dur=duration, fill='freeze',
                            begin=begin)
        _line <= _an1
        
        ## But, do not bother adding animations that will not be shown.
        if drawing:
            _an2 = svg.animate(attributeName="y2", attributeType="XML",
                            begin=begin,
                            From=y0, to=y1, dur=duration, fill='freeze')
            _line <= _an2

            if width > 2:
                _line_cap = svg.set(attributeName="stroke-linecap", 
                    begin=begin,
                    attributeType="xml", to="round", dur=duration, fill='freeze')
                _line <= _line_cap

        self.canvas <= _line
        return begin, duration, (x0, y0), (x1, y1)

    def _drawpoly(self, coordlist, outline=None, fill=None, width=None):
        """Draws a path according to provided arguments:
            - coordlist is sequence of coordinates
            - fill is filling color
            - outline is outline color
            - width is the outline width
        """
        self.frame_index += 1
        shape = ["%s,%s" % self._convert_coordinates(x, y) for x, y in coordlist]

        style = {'display': 'none'}
        if fill is not None:
            style['fill'] = fill
        if outline is not None:
            style['stroke'] = outline
            if width is not None:
                style['stroke-width'] = width 
            else:
                style['stroke-width'] = 1 

        polygon = svg.polygon(points=" ".join(shape), style=style)

        an = svg.animate(Id="animation_frame%s" % self.frame_index,
                              attributeName="display", attributeType="CSS",
                              From="block", to="block", dur=_CFG["min_duration"],
                              fill='freeze')

        an.setAttribute('begin', "animation_frame%s.end" % (self.frame_index-1))
        polygon <= an
        self.canvas <= polygon


    def _new_frame(self):
        '''returns a new animation frame index and update the current indes'''

        previous_end = "animation_frame%s.end" % self.frame_index
        self.frame_index += 1
        new_frame_id = "animation_frame%s" % self.frame_index
        return previous_end, new_frame_id

    def mode(self, _mode=None):
        if _mode is None:
            return self._mode
        _CFG['mode'] = _mode 
        self.reset()


    def reset(self):
        self._turtles = []
        self.frame_index = 0        
        self.background_color = "white"
        self._set_geometry()

    def _set_geometry(self):
        self.width = _CFG["canvwidth"]
        self.height = _CFG["canvheight"]
        self.x_offset = self.y_offset = 0
        self.xscale = self.yscale = 1

        self.y_points_down = -1
        self._mode = _CFG["mode"].lower()
        if self._mode in ['logo', 'standard']:
            self.translate_canvas = (self.width//2, self.height//2)      
        elif self._mode == 'world':
            self.translate_canvas = (0, self.height)
        self._setup_canvas()

    def _setup_canvas(self):
        self.svg_scene = svg.svg(Id=_CFG["turtle_canvas_id"], width=self.width, 
                             height=self.height)
        translate = "translate(%d %d)" % self.translate_canvas

        # always create one animation for timing purpose
        self.svg_scene <= svg.animate(
            Id="animation_frame%s" % self.frame_index,
            attributeName="width", attributeType="CSS",
            From=self.width, to=self.width, begin="0s", 
            dur=_CFG["min_duration"], fill='freeze')

        # Unlike html elements, svg elements have no concept of a z-index: each
        # new element is drawn on top of each other.
        # Having separate canvas keeps the ordering
        self.background_canvas = svg.g(transform=translate)
        self.canvas = svg.g(transform=translate)
        self.writing_canvas = svg.g(transform=translate)
        self.turtle_canvas = svg.g(transform=translate)
        
        self.svg_scene <= self.background_canvas
        self.svg_scene <= self.canvas
        self.svg_scene <= self.writing_canvas
        self.svg_scene <= self.turtle_canvas


    def setworldcoordinates(self, llx, lly, urx, ury):
        """Set up a user defined coordinate-system.

        Arguments:
        llx -- a number, x-coordinate of lower left corner of canvas
        lly -- a number, y-coordinate of lower left corner of canvas
        urx -- a number, x-coordinate of upper right corner of canvas
        ury -- a number, y-coordinate of upper right corner of canvas

        Note: llx must be less than urx in this version.

        Warning: in user-defined coordinate systems angles may appear distorted. 
        """
        self._mode = "world"

        if urx < llx:
            sys.stderr.write("Warning: urx must be greater than llx; your choice will be reversed")
            urx, llx = llx, urx 
        xspan = urx - llx
        yspan = abs(ury - lly)

        self.xscale = int(self.width) / xspan
        self.yscale = int(self.height) / yspan
        self.x_offset = -llx * self.xscale
        if ury < lly:
            self.y_points_down = 1 # standard orientation in the browser
        else:
            self.y_points_down = -1
        self.y_offset = self.y_points_down * lly * self.yscale
        self.translate_canvas = (self.x_offset, self.height-self.y_offset)
        self._setup_canvas()

    def show_scene(self):
        '''Ends the creation of a "scene" and has it displayed'''

        for t in self._turtles:
            self.turtle_canvas <= t.svg 
        if _CFG["turtle_canvas_wrapper"] is None:
            _CFG["turtle_canvas_wrapper"] = html.DIV(Id="turtle-canvas-wrapper")
            document <= _CFG["turtle_canvas_wrapper"]
        if _CFG["turtle_canvas_id"] not in document:
            _CFG["turtle_canvas_wrapper"] <= self.svg_scene
        def set_svg():
        # need to have a delay for chrome so that first few draw commands are viewed properly.
            _CFG["turtle_canvas_wrapper"].html = _CFG["turtle_canvas_wrapper"].html
        timer.set_timeout(set_svg, 1)  


    def turtles(self):
        """Return the list of turtles on the screen.
        """
        return self._turtles

    def _write(self, pos, txt, align, font, color):
        """Write txt at pos in canvas with specified font
        and color."""
        if isinstance(color, tuple):
            stroke = color[0]
            fill = color[1]
        else:
            fill = color 
            stroke = None
        x, y = self._convert_coordinates(pos[0], pos[1])
        text = svg.text(txt, x=x, y=y, fill=fill,
                        style={'display': 'none',
                               'font-family': font[0],
                               'font-size': font[1],
                               'font-style': font[2]})

        if stroke is not None:
            text.setAttribute('stroke', stroke)
        if align == 'left':
            text.setAttribute('text-anchor', 'start')
        elif align == 'center' or align == 'centre':
            text.setAttribute('text-anchor', 'middle')
        elif align == 'right':
            text.setAttribute('text-anchor', 'end')

        self.frame_index += 1
        an = svg.animate(Id="animation_frame%s" % self.frame_index,
                              attributeName="display", attributeType="CSS",
                              From="block", to="block", dur=_CFG["min_duration"],
                              fill='freeze')
        an.setAttribute('begin', "animation_frame%s.end" % (self.frame_index-1))
        text <= an
        self.writing_canvas <= text        

    def addshape(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.addshape() is not implemented.\n")

    def bgpic(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.bgpic() is not implemented.\n")

    def bye(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.bye() is not implemented.\n")

    def clearscreen(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.clearscreen() is not implemented.\n")

    def colormode(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.colormode() is not implemented.\n")

    def delay(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.delay() is not implemented.\n")

    def exitonclick(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.exitonclick() is not implemented.\n")

    def getcanvas(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.getcanvas() is not implemented.\n")

    def getshapes(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.getshapes() is not implemented.\n")

    def addshape(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.addshape() is not implemented.\n")

    def listen(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.listen() is not implemented.\n")

    def mainloop(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.mainloop() is not implemented.\n")

    def numinput(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.numinput() is not implemented.\n")

    def onkey(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.onkey() is not implemented.\n")

    def onkeypress(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.onkeypress() is not implemented.\n")

    def onkeyrelease(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.onkeyrelease() is not implemented.\n")

    def onscreenclick(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.onscreenclick() is not implemented.\n")

    def ontimer(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.ontimer() is not implemented.\n")

    def register_shape(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.register_shape() is not implemented.\n")

    def resetscreen(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.resetscreen() is not implemented.\n")

    def screensize(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.screensize() is not implemented.\n")

    def setup(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.setup() is not implemented.\n")

    def textinput(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.textinput() is not implemented.\n")

    def title(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.title() is not implemented.\n")

    def tracer(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.tracer() is not implemented.\n")

    def update(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.update() is not implemented.\n")

    def window_height(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.window_height() is not implemented.\n")

    def window_width(self, *args, **kwargs):
        sys.stderr.write("Warning: Screen.window_width() is not implemented.\n")        


class TNavigator:
    """Navigation part of the Turtle.
    Implements methods for turtle movement.
    """
    # START_ORIENTATION = {
    #     "standard": Vec2D(1.0, 0.0),
    #     "world": Vec2D(1.0, 0.0),
    #     "logo": Vec2D(0.0, 1.0)}
    DEFAULT_MODE = "standard"
    DEFAULT_ANGLEOFFSET = 0
    DEFAULT_ANGLEORIENT = 1

    def __init__(self, mode=DEFAULT_MODE):
        self._angleOffset = self.DEFAULT_ANGLEOFFSET
        self._angleOrient = self.DEFAULT_ANGLEORIENT
        self._mode = mode
        self.degree_to_radians = math.pi / 180
        self.degrees()
        self._mode = _CFG['mode']
        self._setmode(mode)
        TNavigator.reset(self)

    def reset(self):
        """reset turtle navigation to its initial values

        The derived class, which will call it directly and add its own
        """
        self._position = (0.0, 0.0)
        self._x = 0 
        self._y = 0
        self._angle = 0
        self._old_heading = 0

    def _setmode(self, mode=None):
        """Set turtle-mode to 'standard', 'world' or 'logo'.
        """
        if mode is None:
            return self._mode
        if mode not in ["standard", "logo", "world"]:
            print(mode, "is an unknown mode; it will be ignored.")
            return
        self._mode = mode
        if mode in ["standard", "world"]:
            self._angleOffset = 0
            self._angleOrient = 1
        else:  # mode == "logo":
            self._angleOffset = -self._fullcircle/4.
            self._angleOrient = 1

    def _setDegreesPerAU(self, fullcircle):
        """Helper function for degrees() and radians()"""
        self._fullcircle = fullcircle
        self._degreesPerAU = 360/fullcircle

    def degrees(self, fullcircle=360.0):
        """ Set angle measurement units to degrees, or possibly other system.
        """
        self._setDegreesPerAU(fullcircle)

    def radians(self):
        """ Set the angle measurement units to radians.
        """
        self._setDegreesPerAU(2*math.pi)

    def _rotate(self, angle):
        """Turn turtle counterclockwise by specified angle if angle > 0."""
        pass

    def _goto(self, x, y):
        pass  # implemented by derived class

    def forward(self, distance):
        """Move the turtle forward by the specified distance.
        """
        x1 = distance * cos(self._angle * self.degree_to_radians)
        y1 = distance * sin(self._angle * self.degree_to_radians)
        self._distance = distance
        self._goto(self._x + x1, self._y + y1)        
    fd = forward

    def back(self, distance):
        """Move the turtle backward by distance.
        """
        x1 = -distance * cos(self._angle * self.degree_to_radians)
        y1 = -distance * sin(self._angle * self.degree_to_radians)
        self._distance = distance
        self._goto(self._x + x1, self._y + y1)   
    backward = back 
    bk = back

    def right(self, angle):
        """Turn turtle right by angle units.
        """
        angle*=self._degreesPerAU
        self._angle += self.screen.y_points_down*angle
        self._rotate_image(-angle)
    rt = right 

    def left(self, angle):
        """Turn turtle left by angle units.
        """
        angle*=self._degreesPerAU
        self._angle += -self.screen.y_points_down*angle
        self._rotate_image(angle)
    lt = left

    def pos(self):
        """Return the turtle's current location (x,y), as a formatted tuple
        """
        return FormattedTuple(self._x, self._y)
    position = pos 

    def xcor(self):
        """ Return the turtle's x coordinate.
        """
        return self._x

    def ycor(self):
        """ Return the turtle's y coordinate
        """
        return self._y

    def goto(self, x, y=None):
        """Move turtle to an absolute position.
        """
        if y is None:
            x, y = x[0], x[1] # "*x" here raises SyntaxError
        # distance only needed to calculate the duration of
        # the animation which is based on "distance" and "speed" as well. 
        # We use the Manhattan distance here as it is *much* faster on Chrome, 
        # than using the proper distance with calls to math.sqrt, while
        # giving acceptable results
        # 
        # forward, backward, etc., call _goto directly with the distance
        # given by the user
        self._distance = abs(self._x - x) + abs(self._y - y)
        self._goto(x, y)
    setpos = goto 
    setposition = goto 


    def home(self):
        """Move turtle to the origin - coordinates (0,0), facing in the
           default orientation
        """
        self.goto(0, 0)
        self.setheading(0)

    def setx(self, x):
        """Set the turtle's first coordinate to x
        """
        self._distance = abs(x - self._x)
        self._goto(x, self._y)

    def sety(self, y):
        """Set the turtle's second coordinate to y
        """
        self._distance = abs(y - self._y)
        self._goto(self._x, y)

    def distance(self, x, y=None):
        """Return the distance from the turtle to (x,y) in turtle step units.
        """
        if y is None:
            assert isinstance(x, tuple)
            x, y = x
        return math.sqrt((self._x - x)**2 + (self._y - y)**2)

    def towards(self, x, y=None):
        """Return the angle of the line from the turtle's position to (x, y).
        """
        if y is None:
            assert isinstance(x, tuple)
            x, y = x
        x, y = x - self._x, y - self._y 
        result = round(math.atan2(y, x)*180.0/math.pi, 10) % 360.0
        result /= self._degreesPerAU
        return (self._angleOffset + self._angleOrient*result) % self._fullcircle

    def heading(self):
        """ Return the turtle's current heading.
        """
        angle = self._angle / self._degreesPerAU 
        return (self._angleOffset + self._angleOrient*angle) % self._fullcircle

    def setheading(self, to_angle):
        """Set the orientation of the turtle to to_angle.
        """
        self._rotate(to_angle - self._angle)
    seth = setheading

    def circle(self, radius, extent=None, steps=None):
        """ Draw an approximate (arc) circle with given radius, using straight
            line segments.

        Arguments:
        radius -- a number
        extent (optional) -- a number
        steps (optional) -- an integer

        Draw a circle with given radius. The center is radius units left
        of the turtle; extent - an angle - determines which part of the
        circle is drawn. If extent is not given, draw the entire circle.
        If extent is not a full circle, one endpoint of the arc is the
        current pen position. Draw the arc in counterclockwise direction
        if radius is positive, otherwise in clockwise direction. Finally
        the direction of the turtle is changed by the amount of extent.

        As the circle is approximated by an inscribed regular polygon,
        steps determines the number of steps to use. If not given,
        it will be calculated automatically. Maybe used to draw regular
        polygons.
        """
        speed = self.speed()
        if extent is None:
            extent = self._fullcircle
        if steps is None:
            frac = abs(extent)/self._fullcircle
            steps = 1+int(min(11+abs(radius)/6.0, 59.0)*frac)
        w = 1.0 * extent / steps
        w2 = 0.5 * w
        l = 2.0 * radius * math.sin(w2*math.pi/180.0*self._degreesPerAU)
        if radius < 0:
            l, w, w2 = -l, -w, -w2
        self._rotate(w2)
        for i in range(steps):
            self.speed(speed)
            self.forward(l)
            self.speed(0)
            self._rotate(w)
        self._rotate(-w2)
        self.speed(speed)

class TPen:
    """Drawing part of the Turtle.
    """

    def __init__(self):
        TPen._reset(self)

    def _reset(self, pencolor=_CFG["pencolor"],
               fillcolor=_CFG["fillcolor"]):
        self._pensize = 1
        self._shown = True
        self._drawing = True        
        self._pencolor = 'black'
        self._fillcolor = 'black'
        self._speed = 3
        self._stretchfactor = (1., 1.)


    def resizemode(self, rmode=None):
        sys.stderr.write("Warning: TPen.resizemode() is not implemented.\n")

    def pensize(self, width=None):
        """Set or return the line thickness.
        """
        if width is None:
            return self._pensize
        self.pen(pensize=width)
    width = pensize

    def pendown(self):
        """Pull the pen down -- drawing when moving.
        """
        if self._drawing:
            return
        self.pen(pendown=True)
    pd = pendown 
    down = pendown 

    def penup(self):
        """Pull the pen up -- no drawing when moving.
        """
        if not self._drawing:
            return
        self.pen(pendown=False)
    pu = penup 
    up = penup

    def isdown(self):
        """Return True if pen is down, False if it's up.
        """
        return self._drawing

    def speed(self, speed=None):
        """ Return or set the turtle's speed.

        Optional argument:
        speed -- an integer in the range 0..10 or a speedstring (see below)

        Set the turtle's speed to an integer value in the range 0 .. 10.
        If no argument is given: return current speed.

        If input is a number greater than 10 or smaller than 0.5,
        speed is set to 0.
        Speedstrings  are mapped to speedvalues in the following way:
            'fastest' :  0
            'fast'    :  10
            'normal'  :  6
            'slow'    :  3
            'slowest' :  1
        speeds from 1 to 10 enforce increasingly faster animation of
        line drawing and turtle turning.

        Attention:
        speed = 0 : *no* animation takes place. forward/back makes turtle jump
        and likewise left/right make the turtle turn instantly.
        """
        speeds = {'fastest': 0, 'fast': 10, 'normal': 6, 'slow': 3, 'slowest': 1}
        if speed is None:
            return self._speed
        if speed in speeds:
            speed = speeds[speed]
        elif 0.5 < speed < 10.5:
            speed = int(round(speed))
        else:
            speed = 0
        self.pen(speed=speed)

    def color(self, *args):
        """Return or set the pencolor and fillcolor.

        IMPORTANT: this is very different than the CPython's version.

        Colors are using strings in any format recognized by a browser
        (named color, rgb, rgba, hex, hsl, etc.)

        Acceptable arguments:

            no argument: returns (pencolor, fillcolor)
            single string -> sets both pencolor and fillcolor to that value
            two string arguments -> taken to be pencolor, fillcolor
            tuple of two strings -> taken to be (pencolor, fillcolor)
        """
        if args:
            l = len(args)
            if l == 1:
                if isinstance(args[0], tuple):
                    pencolor = args[0][0]
                    fillcolor = args[0][1]
                else:
                    pencolor = fillcolor = args[0]
            elif l == 2:
                pencolor, fillcolor = args

            if not isinstance(pencolor, str) or not isinstance(fillcolor, str):
                raise TurtleGraphicsError("bad color arguments: %s" % str(args))

            self.pen(pencolor=pencolor, fillcolor=fillcolor)
        else:
            return self._pencolor, self._fillcolor

    def pencolor(self, color=None):
        """ Return or set the pencolor.
        
        IMPORTANT: this is very different than the CPython's version.

        Colors are using strings in any format recognized by a browser
        (named color, rgb, rgba, hex, hsl, etc.)
        """
        if color is not None:
            if not isinstance(color, str):
                raise TurtleGraphicsError("bad color arguments: %s" % str(color))
            if color == self._pencolor:
                return
            self.pen(pencolor=color)
        else:
            return self._pencolor

    def fillcolor(self, color=None):
        """ Return or set the fillcolor.
        
        IMPORTANT: this is very different than the CPython's version.

        Colors are using strings in any format recognized by a browser
        (named color, rgb, rgba, hex, hsl, etc.)
        """
        if color is not None:
            if not isinstance(color, str):
                raise TurtleGraphicsError("bad color arguments: %s" % str(color))
            if color == self._fillcolor:
                return
            self.pen(fillcolor=color)
        else:
            return self._pencolor

    def showturtle(self):
        """Makes the turtle visible.
        """
        if self._shown:
            return
        self.pen(shown=True)
        self.left(0) # this will update the display to the correct rotation
    st = showturtle

    def hideturtle(self):
        """Makes the turtle invisible.
        """
        if self._shown:
            self.pen(shown=False)
    ht = hideturtle

    def isvisible(self):
        """Return True if the Turtle is shown, False if it's hidden.
        """
        return self._shown

    def pen(self, pen=None, **pendict):
        """Return or set the pen's attributes.

        Arguments:
            pen -- a dictionary with some or all of the below listed keys.
            **pendict -- one or more keyword-arguments with the below
                         listed keys as keywords.

        Return or set the pen's attributes in a 'pen-dictionary'
        with the following key/value pairs:
           "shown"      :   True/False
           "pendown"    :   True/False
           "pencolor"   :   color-string or color-tuple
           "fillcolor"  :   color-string or color-tuple
           "pensize"    :   positive number
           "speed"      :   number in range 0..10
        """
        _pd = {"shown": self._shown,
               "pendown": self._drawing,
               "pencolor": self._pencolor,
               "fillcolor": self._fillcolor,
               "pensize": self._pensize,
               "speed": self._speed
               }

        if not (pen or pendict):
            return _pd

        if isinstance(pen, dict):
            p = pen
        else:
            p = {}
        p.update(pendict)

        _p_buf = {}
        for key in p:
            _p_buf[key] = _pd[key]
        if "pendown" in p:
            self._drawing = p["pendown"]
        if "pencolor" in p:
            old_color = self._pencolor
            self._pencolor = p["pencolor"]
            previous_end, new_frame_id = self.screen._new_frame()
            anim = svg.animate(Id=new_frame_id, begin=previous_end, 
                               dur=_CFG["min_duration"], fill="freeze",
                               attributeName="stroke", attributeType="XML",
                               From=old_color, to=self._pencolor)
            self.svg <= anim
        if "pensize" in p:
            self._pensize = p["pensize"]
        if "fillcolor" in p:
            old_color = self._fillcolor
            self._fillcolor = p["fillcolor"]
            previous_end, new_frame_id = self.screen._new_frame()
            anim = svg.animate(Id=new_frame_id, begin=previous_end, 
                               dur=_CFG["min_duration"], fill="freeze",
                               attributeName="fill", attributeType="XML",
                               From=old_color, to=self._fillcolor)
            self.svg <= anim
        if "speed" in p:
            self._speed = p["speed"]
        if "shown" in p:
            old_shown = self._shown
            if old_shown:
                opacity = 0
                old_opacity = 1
            else:
                opacity = 1
                old_opacity = 0
            previous_end, new_frame_id = self.screen._new_frame()
            anim = svg.animate(Id=new_frame_id, begin=previous_end, 
                               dur=_CFG["min_duration"], fill="freeze",
                               attributeName="opacity", attributeType="XML",
                               From=old_opacity, to=opacity)
            self.svg <= anim
            self.forward(0) # updates the turtle visibility on screen
            self._shown = p["shown"]


# No RawTurtle/RawPen for this version, unlike CPython's; only Turtle/Pen
class Turtle(TPen, TNavigator):
    """Animation part of the Turtle.
    Puts Turtle upon a TurtleScreen and provides tools for
    its animation.
    """
    _pen = None
    screen = None

    def __init__(self, shape=_CFG["shape"], visible=_CFG["visible"]):

        self.screen = Screen()
        TPen.__init__(self)
        TNavigator.__init__(self, self.screen.mode())
        self._poly = None
        self._creatingPoly = False
        self._fillitem = self._fillpath = None

        self.name = shape
        self.svg, rotation = self.screen.create_svg_turtle(self, name=shape)
        self.svg.setAttribute("opacity", 0)
        self._shown = False
        if visible:
            self.showturtle() # will ensure that turtle become visible at appropriate time
        self.screen._turtles.append(self)
        self.rotation_correction = rotation
        # apply correction to image orientation
        self._old_heading = self.heading() + self.rotation_correction
        speed = self.speed()
        self.speed(0)
        self.left(-self._angleOffset) # this will update the display to include the correction
        self.speed(speed)

    def reset(self):
        """Delete the turtle's drawings and restore its default values.
        """
        ## TODO: review this and most likely revise docstring.
        TNavigator.reset(self)
        TPen._reset(self)
        self._old_heading = self.heading() + self.rotation_correction
        self.home()
        self.color(_CFG["pencolor"], _CFG["fillcolor"])

    def clear(self):
        sys.stderr.write("Warning: Turtle.clear() is not implemented.\n")

    def shape(self, name=None):
        """Set turtle shape to shape with given name 
        / return current shapename if no name is provided
        """
        if name is None:
            return self.name 
        _turtle = self._make_copy(name=name)

        visible = self.isvisible()
        if visible:
            self.hideturtle()
        self.screen.turtle_canvas <= self.svg
        self.svg = _turtle 
        self.screen._turtles.append(self)
        if visible:
            self.showturtle()

    def clearstamp(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.clearstamp() is not implemented.\n")

    def clearstamps(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.clearstamps() is not implemented.\n")

    def onclick(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.onclick() is not implemented.\n")

    def ondrag(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.ondrag() is not implemented.\n")

    def onrelease(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.onrelease() is not implemented.\n")

    def undo(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.undo() is not implemented.\n")

    def setundobuffer(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.setundobuffer() is not implemented.\n")

    def undobufferentries(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.undobufferentries() is not implemented.\n")

    def shapesize(self, *args, **kwargs):
        sys.stderr.write("Warning: Turtle.shapesize() is not implemented.\n")
    turtlesize = shapesize

    def shearfactor(self, shear=None):
        sys.stderr.write("Warning: Turtle.shearfactor() is not implemented.\n")

    def settiltangle(self, angle):
        sys.stderr.write("Warning: Turtle.settiltangle() is not implemented.\n")

    def tiltangle(self, angle=None):
        sys.stderr.write("Warning: Turtle.tiltangle() is not implemented.\n")

    def tilt(self, angle):
        sys.stderr.write("Warning: Turtle.tilt() is not implemented.\n")

    def shapetransform(self, t11=None, t12=None, t21=None, t22=None):
        sys.stderr.write("Warning: Turtle.shapetransform() is not implemented.\n")

    def get_shapepoly(self):
        sys.stderr.write("Warning: Turtle.get_shapepoly() is not implemented.\n")

    def _goto(self, x, y):
        """Move the pen to the point end, thereby drawing a line
        if pen is down. All other methods for turtle movement depend
        on this one.
        """

        begin, duration, _from, _to = self.screen._drawline(self,
                                  ((self._x, self._y), (x, y)),
                                  (self._pencolor, self._fillcolor), 
                                  self._pensize, self._speed)
        if self._shown:
            self.svg <= svg.animateMotion(begin=begin, dur=_CFG["min_duration"],
                                          fill="remove")

            self.svg <= svg.animateMotion(From="%s,%s" % _from, to="%s,%s" % _to,
                                          dur=duration, begin=begin, fill="freeze")


        if self._fillpath is not None:
            self._fillpath.append((x, y))
        self._position = (x, y)
        self._x = x 
        self._y = y 


    def _rotate(self, angle):
        """Turns pen clockwise by angle.
        """
        angle*=self._degreesPerAU
        self._angle += -self.screen.y_points_down*angle
        self._rotate_image(angle)

    def _rotate_image(self, angle):
        new_heading = self._old_heading - angle
        
        if self.isvisible():
            previous_end, new_frame_id = self.screen._new_frame()
            if self._speed == 0:
                duration = _CFG["min_duration"]
            else:
                duration = (abs(angle)/(self._speed * 360))
                if duration < 0.001:
                    duration = _CFG["min_duration"]
                else:
                    duration = "%6.3fs" % duration

            self.svg <= svg.animateMotion(begin=previous_end, 
                                          dur=_CFG["min_duration"], fill="remove")
            self.svg <= svg.animateTransform(attributeName="transform",
                                             Id = new_frame_id,
                                             type="rotate",
                                             From=(self._old_heading, 0, 0),
                                             to=(new_heading, 0, 0), 
                                             begin=previous_end,
                                    dur=duration, fill="freeze")
        self._old_heading = new_heading

    def filling(self):
        """Return fillstate (True if filling, False else).
        """
        return self._fillpath is not None

    def begin_fill(self):
        """Called just before drawing a shape to be filled.
        """
        self._fillpath = [(self._x, self._y)]

    def end_fill(self):
        """Fill the shape drawn after the call begin_fill().
        """
        if self.filling() and len(self._fillpath) > 2:
            self.screen._drawpoly(self._fillpath, outline=self._pencolor,
                                  fill=self._fillcolor, )
        else:
            print("No path to fill.")
        self._fillpath = None

    def dot(self, size=None, color=None):
        """Draw a filled circle with diameter size, using color.
        """
        item = self.screen._dot((self._x, self._y), size, color=color)

    def _write(self, txt, align, font, color=None):
        """Performs the writing for write()
        """
        if color is None:
            color = self._pencolor
        self.screen._write((self._x, self._y), txt, align, font, color)


    def write(self, arg, align="left", font=("Arial", 8, "normal"), color=None):
        """Write text at the current turtle position.

        Arguments:
        arg -- info, which is to be written to the TurtleScreen; it will be
           converted to a string.
        align (optional) -- one of the strings "left", "center" or right"
        font (optional) -- a triple (fontname, fontsize, fonttype)
        """
        self._write(str(arg), align.lower(), font, color=color)

    def begin_poly(self):
        """Start recording the vertices of a polygon.
        """
        self._poly = [(self._x, self._y)]
        self._creatingPoly = True

    def end_poly(self):
        """Stop recording the vertices of a polygon.
        """
        self._creatingPoly = False

    def get_poly(self):
        """Return the lastly recorded polygon.
        """
        # check if there is any poly?
        if self._poly is not None:
            return tuple(self._poly)

    def getscreen(self):
        """Return the TurtleScreen object, the turtle is drawing on.
        """
        return self.screen

    def getturtle(self):
        """Return the Turtle object itself.

           Only reasonable use: as a function to return the 'anonymous turtle'
        """
        return self
    getpen = getturtle

    def _make_copy(self, name=None):
        '''makes a copy of the current svg turtle, but possibly using a
           different shape. This copy is then ready to be inserted 
           into a canvas.'''

        if name is None:
            name = self.name

        # We recreate a copy of the existing turtle, possibly using a different
        # name/shape; we set the opacity to
        # 0 since there is no specific time associated with the creation of
        # such an object: we do not want to show it early.
        _turtle, rotation = self.screen.create_svg_turtle(self, name=name)
        _turtle.setAttribute("opacity", 0)
        _turtle.setAttribute("fill", self._fillcolor)
        _turtle.setAttribute("stroke", self._pencolor)

        # We use timed animations to get it with the proper location, orientation
        # and appear at the desired time.
        previous_end, new_frame_id = self.screen._new_frame()
        x, y = self.screen._convert_coordinates(self._x, self._y)        
        _turtle <= svg.animateMotion(begin=previous_end, dur=_CFG["min_duration"],
                                          fill="remove")

        _turtle <= svg.animateMotion(Id=new_frame_id,
                                     From="%s,%s" % (x, y), to="%s,%s" % (x, y),
                                     dur=_CFG["min_duration"], begin=previous_end, 
                                     fill="freeze")
        _turtle <= svg.animateTransform(attributeName="transform",
                                        type="rotate",
                                        From=(self._old_heading, 0, 0),
                                        to=(self._old_heading, 0, 0), 
                                        begin=previous_end,
                                        dur=_CFG["min_duration"], fill="freeze")
        _turtle <= svg.animate(begin=previous_end, 
                           dur=_CFG["min_duration"], fill="freeze",
                           attributeName="opacity", attributeType="XML",
                           From=0, to=1)
        return _turtle

    def stamp(self):
        '''draws a permanent copy of the turtle at its current location'''

        _turtle = self._make_copy(name=self.name)
        self.screen.canvas <= _turtle


    def clone(self):
        """Create and return a clone of the turtle.
        """
        n = Turtle(self.name)

        attrs = vars(self)
        new_dict = {}
        for attr in attrs:
            if isinstance(getattr(self, attr), (int, str, float)):
                new_dict[attr] = getattr(self, attr)
        n.__dict__.update(**new_dict)
        # ensure that visible characteristics are consistent with settings
        if not n._shown:
            n._shown = True  # otherwise, hideturtle() would have not effect
            n.hideturtle()
        n.left(0)
        n.fd(0)
        n.color(n.color())
        return n


Pen = Turtle


def done():
    Screen().show_scene()
show_scene = done


def replay_scene():
    "Start playing an animation by 'refreshing' the canvas."
    if (_CFG["turtle_canvas_id"] in document and
            document[_CFG["turtle_canvas_id"]] is not None):
        element = document[_CFG["turtle_canvas_id"]]
        element.parentNode.removeChild(element)  
    show_scene()  


def restart():
    "For Brython turtle: clears the existing drawing and canvas"
    _CFG.update(_cfg_copy)
    Screen().reset()
    Turtle._pen = None 

    if (_CFG["turtle_canvas_id"] in document and
            document[_CFG["turtle_canvas_id"]] is not None):
        element = document[_CFG["turtle_canvas_id"]]
        element.parentNode.removeChild(element)

### Creating functions based

import inspect
def getmethparlist(ob):
    """Get strings describing the arguments for the given object

    Returns a pair of strings representing function parameter lists
    including parenthesis.  The first string is suitable for use in
    function definition and the second is suitable for use in function
    call.  The "self" parameter is not included.
    """
    defText = callText = ""
    # bit of a hack for methods - turn it into a function
    # but we drop the "self" param.
    # Try and build one for Python defined functions
    args, varargs, varkw = inspect.getargs(ob.__code__)
    items2 = args[1:]
    realArgs = args[1:]
    defaults = ob.__defaults__ or []
    defaults = ["=%r" % (value,) for value in defaults]
    defaults = [""] * (len(realArgs)-len(defaults)) + defaults
    items1 = [arg + dflt for arg, dflt in zip(realArgs, defaults)]
    if varargs is not None:
        items1.append("*" + varargs)
        items2.append("*" + varargs)
    if varkw is not None:
        items1.append("**" + varkw)
        items2.append("**" + varkw)
    defText = ", ".join(items1)
    defText = "(%s)" % defText
    callText = ", ".join(items2)
    callText = "(%s)" % callText
    return defText, callText

_tg_screen_functions = ['addshape', 'bgcolor', 'bgpic', 'bye',
        'clearscreen', 'colormode', 'delay', 'exitonclick', 'getcanvas',
        'getshapes', 'listen', 'mainloop', 'mode', 'numinput',
        'onkey', 'onkeypress', 'onkeyrelease', 'onscreenclick', 'ontimer',
        'register_shape', 'resetscreen', 'screensize', 'setup',
        'setworldcoordinates', 'textinput', 'title', 'tracer', 'turtles', 'update',
        'window_height', 'window_width']

_tg_turtle_functions = ['back', 'backward', 'begin_fill', 'begin_poly', 'bk',
        'circle', 'clear', 'clearstamp', 'clearstamps', 'clone', 'color',
        'degrees', 'distance', 'dot', 'down', 'end_fill', 'end_poly', 'fd',
        'fillcolor', 'filling', 'forward', 'get_poly', 'getpen', 'getscreen', 'get_shapepoly',
        'getturtle', 'goto', 'heading', 'hideturtle', 'home', 'ht', 'isdown',
        'isvisible', 'left', 'lt', 'onclick', 'ondrag', 'onrelease', 'pd',
        'pen', 'pencolor', 'pendown', 'pensize', 'penup', 'pos', 'position',
        'pu', 'radians', 'right', 'reset', 'resizemode', 'rt',
        'seth', 'setheading', 'setpos', 'setposition', 'settiltangle',
        'setundobuffer', 'setx', 'sety', 'shape', 'shapesize', 'shapetransform', 'shearfactor', 'showturtle',
        'speed', 'st', 'stamp', 'tilt', 'tiltangle', 'towards',
        'turtlesize', 'undo', 'undobufferentries', 'up', 'width',
        'write', 'xcor', 'ycor']


__all__ = (_tg_screen_functions + _tg_turtle_functions +
           ['done', 'restart', 'replay_scene', 'Turtle', 'Screen'])

## The following mechanism makes all methods of RawTurtle and Turtle available
## as functions. So we can enhance, change, add, delete methods to these
## classes and do not need to change anything here.

__func_body = """\
def {name}{paramslist}:
    if {obj} is None:
        {obj} = {init}
    return {obj}.{name}{argslist}
"""
def _make_global_funcs(functions, cls, obj, init):
    for methodname in functions:
        try:
            method = getattr(cls, methodname)          
        except AttributeError:
            print("methodname missing:", methodname)
            continue
        pl1, pl2 = getmethparlist(method)
        defstr = __func_body.format(obj=obj, init=init, name=methodname,
                                    paramslist=pl1, argslist=pl2)
        exec(defstr, globals())

_make_global_funcs(_tg_turtle_functions, Turtle, 'Turtle._pen', 'Turtle()')

_make_global_funcs(_tg_screen_functions, Screen, 'Turtle.screen', 'Screen()')
