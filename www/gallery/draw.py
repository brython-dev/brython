from browser import window, document, alert, html

container = document['container'] # Game board
zone = document['zone'] # Zone where cells move
ctx = zone.getContext('2d')
tools = document['tools']

# Window dimensions
width = window.innerWidth
height = window.innerHeight
dim = min(width, height)

if width>height:
    tools_pos = 'right'
else:
    tools_pos = 'bottom'

d = int(0.03*dim) # Distance of board to top and left of browser window
padding = int(dim/25) # Board padding

# Adapt container and zone dimensions to browser window dimensions
container.top = container.left = d
container.style.width = container.style.height = dim-2*d-2*padding
container.style.padding = '%spx' %padding

zwidth = dim - 2*d - 2*padding
zone.height = zwidth
zone.width = zwidth

# Get position of zone upper left corner relative to window
ztop, zleft = zone.abs_top, zone.abs_left

# Global variables

class Panel:

    def __init__(self, zone):
        self.X0 = self.Y0 = None    # Initial mouse or finger position
        self.tool = 'pen'      # Current tool
        self.drawing = False   # Current state
        
        self.color = color
        self.bgcolor = bgcolor
        self.rubber_size = 5
        self.line_width = 1
        
        zone.bind('mousedown', self.click)
        zone.bind('mousemove', self.move)
        zone.bind('mouseup', self.release)
        
        zone.bind('touchstart', self.click)
        zone.bind('touchmove', self.move)
        zone.bind('touchend', self.release)
    
    def mouse_pos(self, ev):
        # New mouse / finger position
        if ev.type[:5] == 'mouse' or ev.type=='click':
            x, y = ev.pageX, ev.pageY
        else:
            touch = ev.targetTouches[0]
            x, y = touch.pageX, touch.pageY

        return x, y
    
    def click(self, ev):
        """Handler for mousedown or finger touch"""
        
        if ev.type == 'touchstart':
            if len(ev.targetTouches)>1:
                return
    
        # New mouse / finger position
        self.X0, self.Y0 = self.mouse_pos(ev)

        if self.tool == 'pen':
            ctx.lineWidth = self.line_width
            ctx.strokeStyle = self.color

        elif self.tool == 'select':
            self.store = ctx.getImageData(0, 0, zone.width, zone.height)

        elif self.tool == 'rubber':
            ctx.fillStyle = self.bgcolor

        self.drawing = True
    
    def release(self, ev):
        """Handler for mouse or finger release"""
        
        if self.tool == 'select':
            self.tool = 'selected'
            self.X1, self.Y1 = self.mouse_pos(ev)
            self.X0, self.X1 = min(self.X0, self.X1), max(self.X0, self.X1)
            self.Y0, self.Y1 = min(self.Y0, self.Y1), max(self.Y0, self.Y1)
            zone.style.cursor = 'move'

        self.drawing = False
    
    def move(self, ev):
        """Handler for mouse or finger move"""
    
        if not self.drawing:
            return
      
        # New mouse / finger position
        X, Y = self.mouse_pos(ev)
    
        if self.tool == 'pen':
            ctx.beginPath()
            ctx.moveTo(self.X0-zleft, self.Y0-ztop)
            ctx.lineTo(X-zleft, Y-ztop)
            ctx.stroke()
            ctx.closePath()
            self.X0, self.Y0 = X, Y
            
        elif self.tool == 'select':
            ctx.putImageData(self.store, 0, 0)
            ctx.strokeRect(self.X0-zleft, self.Y0-ztop, 
                X-self.X0, Y-self.Y0)
        
        elif self.tool == 'selected':
            if X>=self.X0 and X<=self.X1 and Y>=self.Y0 and Y<=self.Y1:
                zone.style.cursor = 'move'
            else:
                zone.style.cursor = 'default'

        elif self.tool == 'rubber':
            ctx.strokeStyle = '#808'
            ctx.rect(X-zleft, Y-ztop,
                self.rubber_size, self.rubber_size)
            ctx.fill()


def no_sel(ev):
    ev.preventDefault()
    ev.stopPropagation()

# avoid default behaviour to select text when dragging mouse 
document.bind('mousedown', no_sel)
document.bind('mousemove', no_sel)
document.bind('touchmove', no_sel)

def pick_rgb(ev, tool):
    div = ev.target
    x, y = panel.mouse_pos(ev)
    current = getattr(panel, tool).strip('#')
    color_elts = [current[i:i+2] for i in (0, 2, 4)]
    
    rgb = int(256*((x-div.abs_left)/div.width))
    
    # move slider
    slider = div.get(selector='DIV')[0]
    slider.left = int(div.width*rgb/256)
    
    comp = hex(rgb)[2:]
    if len(comp)==1:
        comp = '0'+comp
    color_elts[div.num] = comp
    
    new_color = '#'+''.join(color_elts)
    
    setattr(panel, tool, new_color)
    color_buttons[tool].style.backgroundColor = new_color

color_panel = None

def pick_color(tool):
    global color_panel
    
    if color_panel is not None:
        print('remove color panel')
        color_panel.parent.remove(color_panel)
        color_panel = None
        return
    else:
        print('create color panel')

    color_panel = html.DIV(Class="color_panel")
    container <= color_panel
    color_panel.top = zwidth//10
    color_panel.left = zwidth//10
    color_panel.style.width = int(0.9*zwidth)
    color_panel.style.height = int(0.9*zwidth)
    
    color = getattr(panel, tool)
    print(color)
    
    for i, base_color in enumerate(['#ff0000', '#00ff00', '#0000ff']):
        div = html.DIV('&nbsp;', style=dict(position="absolute",
            left = int(0.05*zwidth),
            top = int((i+1)*0.2*zwidth),
            width = int(0.8*zwidth),
            backgroundColor = base_color,
            lineHeight = int(0.01*zwidth)
            )
        )
        div.num = i
        div.bind('click', lambda ev: pick_rgb(ev, tool))
        color_panel <= div
        slider = html.DIV('&nbsp;', Class='slider')
        slider.width = zwidth//50
        rgb = int(color[1:][2*i:2*i+2], 16)
        slider.left = int(div.width*rgb/256)
        div <= slider
        
def select(tool):
    panel.tool = tool
    if tool=='pen':
        zone.style.cursor = 'default'
    elif tool=='select':
        zone.style.cursor = 'crosshair'
    elif tool=='rubber':
        zone.style.cursor = 'pointer'
    elif tool in ['color', 'bgcolor']:
        pick_color(tool)

if tools_pos=='right':
    tools.top = container.top
    tools.left = container.left+container.offsetWidth+10
    tools.style.width = "5em"
    tools.style.height = container.offsetHeight

else:

    tools.top = container.top + container.offsetHeight+20
    tools.left = container.left
    tools.style.width = container.offsetWidth
    tools.style.height = "2.5em"

btn = html.BUTTON('&#9997;')
btn.bind('click', lambda ev, tool='pen':select(tool))
tools <= btn

btn = html.BUTTON('&#9744;')
btn.bind('click', lambda ev, tool='select':select(tool))
#if tools_pos == 'right':
#    tools <= html.P()
#tools <= btn

btn = html.BUTTON('&curren;')
btn.bind('click', lambda ev, tool='rubber':select(tool))
if tools_pos == 'right':
    tools <= html.P()
tools <= btn

color = '#000000'
bgcolor = '#ffffff'

btn_color = html.BUTTON('&nbsp;', style=dict(backgroundColor=color))
btn_color.bind('click', lambda ev, tool='color':select(tool))
if tools_pos == 'right':
    tools <= html.P()
tools <= btn_color

btn_bgcolor = html.BUTTON('&nbsp;', style=dict(backgroundColor=bgcolor))
btn_bgcolor.bind('click', lambda ev, tool='bgcolor':select(tool))
if tools_pos == 'right':
    tools <= html.P()
tools <= btn_bgcolor

color_buttons = {'color': btn_color, 'bgcolor': btn_bgcolor}

panel = Panel(zone)
