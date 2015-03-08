from browser import document

SDL_INIT_VIDEO=0
SDL_GL_DOUBLEBUFFER=1
SDL_GL_DEPTH_SIZE=2
SDL_DOUBLEBUF=3
SDL_ANYFORMAT=4

SDL_ACTIVEEVENT=5
SDL_ALLEVENTS=5

SDL_KEYDOWN=6
SDL_KEYUP=7
SDL_MOUSEMOTION=8
SDL_MOUSEBUTTONDOWN=9

SDL_MOUSEBUTTONUP=10
SDL_JOYAXISMOTION=11
SDL_JOYBALLMOTION=12
SDL_JOYHATMOTION=13
SDL_JOYBUTTONUP=14
SDL_JOYBUTTONDOWN=15
SDL_QUIT=16
SDL_SYSWMEVENT=17
SDL_VIDEORESIZE=18
SDL_VIDEOEXPOSE=19
SDL_NOEVENT=20

SDL_GETEVENT=21
SDL_OPENGL=False

def SDL_WasInit(var):
    return True

_attrs={}
_wm={}

def SDL_PeepEvents(num, event, mask):
    pass

def SDL_GL_SetAttribute(variable, value):
    _attrs[variable]=value

def SDL_GL_GetAttribute(variable):
    return _attrs.getvalue(variable, None)

def SDL_GL_SetVideoMode(width, height, depth, flags):
    pass

def SDL_WM_SetCaption(title, icontitle):
    _wm['title']=title
    _wm['icontitle']=icontitle

def SDL_PumpEvents():
    pass

def SDL_SetVideoMode(width, height, depth, flags):
    pass

def SDL_SetColorKey(surface, key, value):
    pass

def SDL_WM_GetCaption():
    return _wm.get('title', ''), _wm.get('icontitle', '')

def SDL_UpdateRect(screen, x1, y1, x2, y2):
    screen.canvas.style.width=screen.canvas.style.width

def SDL_UpdateRects(screen, rects):
    for _rect in rects:
        SDL_UpdateRect(screen, _rect)

def SDL_GetVideoSurface():
    return _Screen

def SDL_GetVideoInfo():
    return 

def SDL_VideoModeOK(width, height, depth, flags):
    pass

def SDL_SetPalette(surface, sdl_var, colors, flag):
    pass

class Screen:
  def __init__(self):
      self.flags=0

  @property
  def canvas(self):
      return document.get(selector='canvas')[0]

_Screen=Screen()



class SDL_Rect:
  def __init__(self, x, y, w, h):
      self.x=x
      self.y=y
      self.w=w
      self.h=h

def SDL_Flip(screen):
    pass
