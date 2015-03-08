from browser import document as doc
from browser import window as win
from browser import alert
from browser.html import *

# globals #########################
refr = False
geo = win.navigator.geolocation
watchid = 0


# functions ###########################
def navi(pos):
    xyz = pos.coords

    ul = UL(id="nav")
    ul <= LI('lat: %s' % xyz.latitude)
    ul <= LI('lon: %s' % xyz.longitude)

    mapurl = "http://maps.googleapis.com/maps/api/staticmap?markers=%f,%f&zoom=15&size=320x298&sensor=true" % (xyz.latitude, xyz.longitude)
    img = IMG(src = mapurl, id = "map")
    try:
        doc["nav"].html = ul.html
    except KeyError:
        doc["navarea"] <= ul
    try:
        doc["map"].src = mapurl
    except KeyError:
        doc["maparea"] <= img

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
