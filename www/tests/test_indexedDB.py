from browser import window

_kids=['Marsha', 'Jan', 'Cindy']

def continue1(event):
    _objectStore.get('Jan', onsuccess=exists, onerror=continue2)

def continue2(event):
    for _kid in _kids:
        _rec={'name': _kid}
        _objectStore.put(_rec, _kid, onsuccess=printmsg, onerror=printerr)

    _objectStore.get('Jan', onsuccess=continue3, onerror=printerr)

def continue3(event):
    print ("Async operations complete..")

def exists(event):
    if event.target.pyresult() is None:
       #handle cause of when get returns undefined if the key doesn't exist
       #in the db..
       continue2(event)
    else:
       print(event.result)
       #this shouldn't get called, output message if called
       print("this shouldn't get called")


def printrec(event):
    _obj=event.target.pyresult()

    assert isinstance(_obj, dict)
    assert _obj['name']=='Jan'
          
def printmsg(event):
    _obj=event.target.pyresult()
    assert _obj in _kids

def printerr(event):
    print("Error: %s" % (event.result))    

def onsuccess(event):
    global db
    db = request.result

def onupgradeneeded(e):
    print("event: ", e, "target", e.target)
    print("event type: ",  e.type)
   
    print("e.oldVersion: ", e.oldVersion)
    print("e.newVersion: ", e.newVersion)
   
    # todo.. override createObjectStore to take options (ie, like OS.put)
    #e.target.result.createObjectStore("BradyKids")
    db = request.result

    for _kid in _kids:
        print(_kid, db)
        _rec={'name': _kid}
        req = db.put(_rec, _kid)
        req.onsuccess=printmsg
        req.onerror=printerr

db = None
request = window.indexedDB.open("BradyKids", 3)
request.onsuccess = onsuccess
request.onupgradeneeded=onupgradeneeded
print(db)
print("allowing async operations to complete")
