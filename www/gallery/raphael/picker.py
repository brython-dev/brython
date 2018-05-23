import math

from browser import document, window

bRaphael = window.Raphael

out = document["output"]
vr = document["vr"]
vg = document["vg"]
vb = document["vb"]
vh = document["vh"]
vh2 = document["vh2"]
vs = document["vs"]
vs2 = document["vs2"]
vv = document["vv"]
vl = document["vl"]

def update_color(ev, cp, cp2):
    cp.color(ev.target.value)
    cp2.color(ev.target.value)

def on_change(item):

    def callback(clr):
        out.value = clr
        item.color(clr)
        out.style.background = clr
        out.style.color = "#fff" if bRaphael.rgb2hsb(clr).b < .5 else "#000"
        clr = bRaphael.color(clr)
        vr.html = clr.r
        vg.html = clr.g
        vb.html = clr.b
        vh.html = vh2.html = "%s°" %round(clr.h * 360)
        vs.html = vs2.html = "%s%%" %round(clr.s * 100)
        vv.html = "%s%%" %round(clr.v * 100)
        vl.html = "%s%%" %round(clr.l * 100)

    return callback

def picker():
        
    # this is where colorpicker created
    cp = bRaphael.colorpicker(40, 20, 300, "#eee")
    cp2 = bRaphael.colorwheel(360, 20, 300, "#eee")
        
    clr = bRaphael.color("#eee")
    vr.html = clr.r
    vg.html = clr.g
    vb.html = clr.b
    vh.html = vh2.html = "%s°" %round(clr.h * 360)
    vs.html = vs2.html = "%s%%" %round(clr.s * 100)
    vv.html = "%s%%" %round(clr.v * 100)
    vl.html = "%s%%" %round(clr.l * 100)
    
    out.bind('keyup', lambda ev: update_color(ev, cp, cp2))

    # assigning onchange event handler
    cp.onchange = on_change(cp2)
    cp2.onchange = on_change(cp)

bRaphael(picker)

