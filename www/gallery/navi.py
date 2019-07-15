from browser import document as doc
from browser import window
from browser import alert
from browser.html import *

# globals #########################
refr = False
geo = window.navigator.geolocation
watchid = 0

img = doc["world_map"]
container = doc["container"]

print(img.abs_left, img.abs_top)
projection = window.Robinson.new(img.offsetWidth, img.offsetHeight)

# functions ###########################
def navi(pos):
    xyz = pos.coords

    ul = UL(id="nav")
    ul <= LI('lat: %s' % xyz.latitude)
    ul <= LI('lon: %s' % xyz.longitude)

    point = projection.project(xyz.latitude, xyz.longitude)
    print("point", point.x, point.y)
    x = img.abs_left + int(img.offsetWidth / 2) + int(point.x)
    y = img.abs_top + int(img.offsetHeight / 2) - int(point.y)
    print(x, y)
    div = DIV("x", style={"position": "absolute",
                          "top": y,
                          "left": x,
                          "background-color": "red",
                          "zIndex": 99})
    container <= div


def nonavi(error):
    print(error)

def navirefresh(ev):
    global refr, watchid
    refr = False if refr else True
    if refr == True:
        doc["switch"].className = "switch on"
        watchid = geo.watchPosition(navi, nonavi)
    else:
        doc["switch"].className = "switch"
        geo.clearWatch(watchid)

# the setup
if geo:
    geo.getCurrentPosition(navi, nonavi)
    doc["switch"].className = "switch"
    doc["switch"].bind('click', navirefresh)
else:
    alert('geolocation not supported')
