#!/usr/bin/env python

'''Constants defined by SDL, and needed in pygame.

Note that many of the flags for SDL are not needed in pygame, and are not
included here.  These constants are generally accessed from the
`pygame.locals` module.  This module is automatically placed in the pygame
namespace, but you will usually want to place them directly into your module's
namespace with the following command::

    from pygame.locals import *

'''

__docformat__ = 'restructuredtext'
__version__ = '$Id$'

#import SDL.constants
# SDL constants taken from https://wiki.libsdl.org/SDLKeycodeLookup

'''
YV12_OVERLAY            = SDL.constants.SDL_YV12_OVERLAY
IYUV_OVERLAY            = SDL.constants.SDL_IYUV_OVERLAY
YUY2_OVERLAY            = SDL.constants.SDL_YUY2_OVERLAY
UYVY_OVERLAY            = SDL.constants.SDL_UYVY_OVERLAY
YVYU_OVERLAY            = SDL.constants.SDL_YVYU_OVERLAY

SWSURFACE               = SDL.constants.SDL_SWSURFACE
HWSURFACE               = SDL.constants.SDL_HWSURFACE
RESIZABLE               = SDL.constants.SDL_RESIZABLE
ASYNCBLIT               = SDL.constants.SDL_ASYNCBLIT
OPENGL                  = SDL.constants.SDL_OPENGL
OPENGLBLIT              = SDL.constants.SDL_OPENGLBLIT
ANYFORMAT               = SDL.constants.SDL_ANYFORMAT
HWPALETTE               = SDL.constants.SDL_HWPALETTE
DOUBLEBUF               = SDL.constants.SDL_DOUBLEBUF
#FULLSCREEN              = SDL.constants.SDL_FULLSCREEN
'''
FULLSCREEN              = 0
'''
HWACCEL                 = SDL.constants.SDL_HWACCEL
SRCCOLORKEY             = SDL.constants.SDL_SRCCOLORKEY
'''
RLEACCELOK              = 254
RLEACCEL                = 255

'''
SRCALPHA                = SDL.constants.SDL_SRCALPHA
PREALLOC                = SDL.constants.SDL_PREALLOC
NOFRAME                 = SDL.constants.SDL_NOFRAME

GL_RED_SIZE             = SDL.constants.SDL_GL_RED_SIZE
GL_GREEN_SIZE           = SDL.constants.SDL_GL_GREEN_SIZE
GL_BLUE_SIZE            = SDL.constants.SDL_GL_BLUE_SIZE
GL_ALPHA_SIZE           = SDL.constants.SDL_GL_ALPHA_SIZE
GL_BUFFER_SIZE          = SDL.constants.SDL_GL_BUFFER_SIZE
GL_DOUBLEBUFFER         = SDL.constants.SDL_GL_DOUBLEBUFFER
GL_DEPTH_SIZE           = SDL.constants.SDL_GL_DEPTH_SIZE
GL_STENCIL_SIZE         = SDL.constants.SDL_GL_STENCIL_SIZE
GL_ACCUM_RED_SIZE       = SDL.constants.SDL_GL_ACCUM_RED_SIZE
GL_ACCUM_GREEN_SIZE     = SDL.constants.SDL_GL_ACCUM_GREEN_SIZE
GL_ACCUM_BLUE_SIZE      = SDL.constants.SDL_GL_ACCUM_BLUE_SIZE
GL_ACCUM_ALPHA_SIZE     = SDL.constants.SDL_GL_ACCUM_ALPHA_SIZE
GL_STEREO               = SDL.constants.SDL_GL_STEREO
GL_MULTISAMPLEBUFFERS   = SDL.constants.SDL_GL_MULTISAMPLEBUFFERS
GL_MULTISAMPLESAMPLES   = SDL.constants.SDL_GL_MULTISAMPLESAMPLES

TIMER_RESOLUTION        = SDL.constants.TIMER_RESOLUTION

AUDIO_U8                = SDL.constants.AUDIO_U8
AUDIO_S8                = SDL.constants.AUDIO_S8
AUDIO_U16LSB            = SDL.constants.AUDIO_U16LSB
AUDIO_S16LSB            = SDL.constants.AUDIO_S16LSB
AUDIO_U16MSB            = SDL.constants.AUDIO_U16MSB
AUDIO_S16MSB            = SDL.constants.AUDIO_S16MSB
AUDIO_U16               = SDL.constants.AUDIO_U16
AUDIO_S16               = SDL.constants.AUDIO_S16
AUDIO_U16SYS            = SDL.constants.AUDIO_U16SYS
AUDIO_S16SYS            = SDL.constants.AUDIO_S16SYS
'''

def _t(a, b, c, d):
    return (ord(a) << 24) | (ord(b) << 16) | (ord(c) << 8) | ord(d)

SCRAP_TEXT              = _t('T', 'E', 'X', 'T')
SCRAP_BMP               = _t('B', 'M', 'P', ' ')

BLEND_ADD               = 0x01
BLEND_SUB               = 0x02
BLEND_MULT              = 0x03
BLEND_MIN               = 0x04
BLEND_MAX               = 0x05

"""
NOEVENT                 = SDL.constants.SDL_NOEVENT
ACTIVEEVENT             = SDL.constants.SDL_ACTIVEEVENT
KEYDOWN                 = SDL.constants.SDL_KEYDOWN
KEYUP                   = SDL.constants.SDL_KEYUP
MOUSEMOTION             = SDL.constants.SDL_MOUSEMOTION
MOUSEBUTTONDOWN         = SDL.constants.SDL_MOUSEBUTTONDOWN
MOUSEBUTTONUP           = SDL.constants.SDL_MOUSEBUTTONUP
JOYAXISMOTION           = SDL.constants.SDL_JOYAXISMOTION
JOYBALLMOTION           = SDL.constants.SDL_JOYBALLMOTION
JOYHATMOTION            = SDL.constants.SDL_JOYHATMOTION
JOYBUTTONDOWN           = SDL.constants.SDL_JOYBUTTONDOWN
JOYBUTTONUP             = SDL.constants.SDL_JOYBUTTONUP
VIDEORESIZE             = SDL.constants.SDL_VIDEORESIZE
VIDEOEXPOSE             = SDL.constants.SDL_VIDEOEXPOSE
QUIT                    = SDL.constants.SDL_QUIT
SYSWMEVENT              = SDL.constants.SDL_SYSWMEVENT
USEREVENT               = SDL.constants.SDL_USEREVENT
NUMEVENTS               = SDL.constants.SDL_NUMEVENTS

HAT_CENTERED            = SDL.constants.SDL_HAT_CENTERED
HAT_UP                  = SDL.constants.SDL_HAT_UP
HAT_RIGHTUP             = SDL.constants.SDL_HAT_RIGHTUP
HAT_RIGHT               = SDL.constants.SDL_HAT_RIGHT
HAT_RIGHTDOWN           = SDL.constants.SDL_HAT_RIGHTDOWN
HAT_DOWN                = SDL.constants.SDL_HAT_DOWN
HAT_LEFTDOWN            = SDL.constants.SDL_HAT_LEFTDOWN
HAT_LEFT                = SDL.constants.SDL_HAT_LEFT
HAT_LEFTUP              = SDL.constants.SDL_HAT_LEFTUP
"""

#BEGIN GENERATED CONSTANTS; see support/make_pygame_keyconstants.py
K_0                     = 48
K_1                     = 49
K_2                     = 50
K_3                     = 51
K_4                     = 52
K_5                     = 53
K_6                     = 54
K_7                     = 55
K_8                     = 56
K_9                     = 57
K_AMPERSAND             = 38
K_ASTERISK              = 42
K_AT                    = 64
K_BACKQUOTE             = 96
K_BACKSLASH             = 92
K_BACKSPACE             = 8
#K_BREAK                 = SDL.constants.SDLK_BREAK
K_CAPSLOCK              = 1073741881
K_CARET                 = 94
K_CLEAR                 = 1073742040
K_COLON                 = 58
K_COMMA                 = 44
#K_COMPOSE               = SDL.constants.SDLK_COMPOSE
K_DELETE                = 127
K_DOLLAR                = 36
K_DOWN                  = 1073741905
K_END                   = 1073741901
K_EQUALS                = 1073741927
K_ESCAPE                = 27
#K_EURO                  = SDL.constants.SDLK_EURO
K_EXCLAIM               = 33
K_F1                    = 1073741882
K_F10                   = 1073741891
K_F11                   = 1073741892
K_F12                   = 1073741893
K_F13                   = 1073741928
K_F14                   = 1073741929
K_F15                   = 1073741930
K_F2                    = 1073741883
K_F3                    = 1073741884
K_F4                    = 1073741885
K_F5                    = 1073741886
K_F6                    = 1073741887
K_F7                    = 1073741888
K_F8                    = 1073741889
K_F9                    = 1073741890
#K_FIRST                 = SDL.constants.SDLK_FIRST
K_GREATER               = 1073742022
K_HASH                  = 1073742028
K_HELP                  = 1073741941
K_HOME                  = 1073741898
K_INSERT                = 1073741897
K_KP0                   = 1073741922
K_KP1                   = 1073741913
K_KP2                   = 1073741914
K_KP3                   = 1073741915
K_KP4                   = 1073741916
K_KP5                   = 1073741917
K_KP6                   = 1073741918
K_KP7                   = 1073741919
K_KP8                   = 1073741920
K_KP9                   = 1073741921
K_KP_DIVIDE             = 1073741908
K_KP_ENTER              = 1073741912
K_KP_EQUALS             = 1073741927
K_KP_MINUS              = 1073741910
K_KP_MULTIPLY           = 1073741909
K_KP_PERIOD             = 1073741923
K_KP_PLUS               = 1073741911
K_LALT                  = 1073742050
#K_LAST                  = SDL.constants.SDLK_LAST
K_LCTRL                 = 1073742048
K_LEFT                  = 1073741904
#K_LEFTBRACKET           = SDL.constants.SDLK_LEFTBRACKET
K_LEFTPAREN             = 1073742006
#K_LESS                  = SDL.constants.SDLK_LESS
#K_LMETA                 = SDL.constants.SDLK_LMETA
K_LSHIFT                = 1073742049
#K_LSUPER                = SDL.constants.SDLK_LSUPER
K_MENU                  = 1073741942
K_MINUS                 = 45
K_MODE                  = 1073742081
#K_NUMLOCK               = SDL.constants.SDLK_NUMLOCK
K_PAGEDOWN              = 1073741902
K_PAGEUP                = 1073741899
K_PAUSE                 = 1073741896
#K_PERIOD                = SDL.constants.SDLK_PERIOD
K_PLUS                  = 43
#K_POWER                 = SDL.constants.SDLK_POWER
#K_PRINT                 = SDL.constants.SDLK_PRINT
K_QUESTION              = 63
K_QUOTE                 = 39
K_QUOTEDBL              = 34
K_RALT                  = 1073742054
K_RCTRL                 = 1073742052
K_RETURN                = 13
K_RIGHT                 = 1073741903
#K_RIGHTBRACKET          = SDL.constants.SDLK_RIGHTBRACKET
K_RIGHTPAREN            = 41
#K_RMETA                 = SDL.constants.SDLK_RMETA
K_RSHIFT                = 1073742053
#K_RSUPER                = SDL.constants.SDLK_RSUPER
K_SCROLLOCK             = 1073741895
K_SEMICOLON             = 59
K_SLASH                 = 47
K_SPACE                 = 1073742029
K_SYSREQ                = 1073741978
K_TAB                   = 9
K_UNDERSCORE            = 95
K_UNDO                  = 1073741946
K_UNKNOWN               = 0
K_UP                    = 1073741906

"""
K_WORLD_0               = SDL.constants.SDLK_WORLD_0
K_WORLD_1               = SDL.constants.SDLK_WORLD_1
K_WORLD_10              = SDL.constants.SDLK_WORLD_10
K_WORLD_11              = SDL.constants.SDLK_WORLD_11
K_WORLD_12              = SDL.constants.SDLK_WORLD_12
K_WORLD_13              = SDL.constants.SDLK_WORLD_13
K_WORLD_14              = SDL.constants.SDLK_WORLD_14
K_WORLD_15              = SDL.constants.SDLK_WORLD_15
K_WORLD_16              = SDL.constants.SDLK_WORLD_16
K_WORLD_17              = SDL.constants.SDLK_WORLD_17
K_WORLD_18              = SDL.constants.SDLK_WORLD_18
K_WORLD_19              = SDL.constants.SDLK_WORLD_19
K_WORLD_2               = SDL.constants.SDLK_WORLD_2
K_WORLD_20              = SDL.constants.SDLK_WORLD_20
K_WORLD_21              = SDL.constants.SDLK_WORLD_21
K_WORLD_22              = SDL.constants.SDLK_WORLD_22
K_WORLD_23              = SDL.constants.SDLK_WORLD_23
K_WORLD_24              = SDL.constants.SDLK_WORLD_24
K_WORLD_25              = SDL.constants.SDLK_WORLD_25
K_WORLD_26              = SDL.constants.SDLK_WORLD_26
K_WORLD_27              = SDL.constants.SDLK_WORLD_27
K_WORLD_28              = SDL.constants.SDLK_WORLD_28
K_WORLD_29              = SDL.constants.SDLK_WORLD_29
K_WORLD_3               = SDL.constants.SDLK_WORLD_3
K_WORLD_30              = SDL.constants.SDLK_WORLD_30
K_WORLD_31              = SDL.constants.SDLK_WORLD_31
K_WORLD_32              = SDL.constants.SDLK_WORLD_32
K_WORLD_33              = SDL.constants.SDLK_WORLD_33
K_WORLD_34              = SDL.constants.SDLK_WORLD_34
K_WORLD_35              = SDL.constants.SDLK_WORLD_35
K_WORLD_36              = SDL.constants.SDLK_WORLD_36
K_WORLD_37              = SDL.constants.SDLK_WORLD_37
K_WORLD_38              = SDL.constants.SDLK_WORLD_38
K_WORLD_39              = SDL.constants.SDLK_WORLD_39
K_WORLD_4               = SDL.constants.SDLK_WORLD_4
K_WORLD_40              = SDL.constants.SDLK_WORLD_40
K_WORLD_41              = SDL.constants.SDLK_WORLD_41
K_WORLD_42              = SDL.constants.SDLK_WORLD_42
K_WORLD_43              = SDL.constants.SDLK_WORLD_43
K_WORLD_44              = SDL.constants.SDLK_WORLD_44
K_WORLD_45              = SDL.constants.SDLK_WORLD_45
K_WORLD_46              = SDL.constants.SDLK_WORLD_46
K_WORLD_47              = SDL.constants.SDLK_WORLD_47
K_WORLD_48              = SDL.constants.SDLK_WORLD_48
K_WORLD_49              = SDL.constants.SDLK_WORLD_49
K_WORLD_5               = SDL.constants.SDLK_WORLD_5
K_WORLD_50              = SDL.constants.SDLK_WORLD_50
K_WORLD_51              = SDL.constants.SDLK_WORLD_51
K_WORLD_52              = SDL.constants.SDLK_WORLD_52
K_WORLD_53              = SDL.constants.SDLK_WORLD_53
K_WORLD_54              = SDL.constants.SDLK_WORLD_54
K_WORLD_55              = SDL.constants.SDLK_WORLD_55
K_WORLD_56              = SDL.constants.SDLK_WORLD_56
K_WORLD_57              = SDL.constants.SDLK_WORLD_57
K_WORLD_58              = SDL.constants.SDLK_WORLD_58
K_WORLD_59              = SDL.constants.SDLK_WORLD_59
K_WORLD_6               = SDL.constants.SDLK_WORLD_6
K_WORLD_60              = SDL.constants.SDLK_WORLD_60
K_WORLD_61              = SDL.constants.SDLK_WORLD_61
K_WORLD_62              = SDL.constants.SDLK_WORLD_62
K_WORLD_63              = SDL.constants.SDLK_WORLD_63
K_WORLD_64              = SDL.constants.SDLK_WORLD_64
K_WORLD_65              = SDL.constants.SDLK_WORLD_65
K_WORLD_66              = SDL.constants.SDLK_WORLD_66
K_WORLD_67              = SDL.constants.SDLK_WORLD_67
K_WORLD_68              = SDL.constants.SDLK_WORLD_68
K_WORLD_69              = SDL.constants.SDLK_WORLD_69
K_WORLD_7               = SDL.constants.SDLK_WORLD_7
K_WORLD_70              = SDL.constants.SDLK_WORLD_70
K_WORLD_71              = SDL.constants.SDLK_WORLD_71
K_WORLD_72              = SDL.constants.SDLK_WORLD_72
K_WORLD_73              = SDL.constants.SDLK_WORLD_73
K_WORLD_74              = SDL.constants.SDLK_WORLD_74
K_WORLD_75              = SDL.constants.SDLK_WORLD_75
K_WORLD_76              = SDL.constants.SDLK_WORLD_76
K_WORLD_77              = SDL.constants.SDLK_WORLD_77
K_WORLD_78              = SDL.constants.SDLK_WORLD_78
K_WORLD_79              = SDL.constants.SDLK_WORLD_79
K_WORLD_8               = SDL.constants.SDLK_WORLD_8
K_WORLD_80              = SDL.constants.SDLK_WORLD_80
K_WORLD_81              = SDL.constants.SDLK_WORLD_81
K_WORLD_82              = SDL.constants.SDLK_WORLD_82
K_WORLD_83              = SDL.constants.SDLK_WORLD_83
K_WORLD_84              = SDL.constants.SDLK_WORLD_84
K_WORLD_85              = SDL.constants.SDLK_WORLD_85
K_WORLD_86              = SDL.constants.SDLK_WORLD_86
K_WORLD_87              = SDL.constants.SDLK_WORLD_87
K_WORLD_88              = SDL.constants.SDLK_WORLD_88
K_WORLD_89              = SDL.constants.SDLK_WORLD_89
K_WORLD_9               = SDL.constants.SDLK_WORLD_9
K_WORLD_90              = SDL.constants.SDLK_WORLD_90
K_WORLD_91              = SDL.constants.SDLK_WORLD_91
K_WORLD_92              = SDL.constants.SDLK_WORLD_92
K_WORLD_93              = SDL.constants.SDLK_WORLD_93
K_WORLD_94              = SDL.constants.SDLK_WORLD_94
K_WORLD_95              = SDL.constants.SDLK_WORLD_95
"""

K_a                     = 97
K_b                     = 98
K_c                     = 99
K_d                     = 100
K_e                     = 101
K_f                     = 102
K_g                     = 103
K_h                     = 104
K_i                     = 105
K_j                     = 106
K_k                     = 107
K_l                     = 108
K_m                     = 109
K_n                     = 110
K_o                     = 111
K_p                     = 112
K_q                     = 113
K_r                     = 114
K_s                     = 115
K_t                     = 116
K_u                     = 117
K_v                     = 118
K_w                     = 119
K_x                     = 120
K_y                     = 121
K_z                     = 122
#END GENERATED CONSTANTS

