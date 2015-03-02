Building your own webapp : application logic
============================================

Create a Python program called *calculator.py* ; in *index.html*, just after the `body` tag, add this line

    <script src="calculator.py" type="text/python3"></script>

This will make the Brython engine load and run the script

The first lines of *calculator.py* will import the built-in Brython names used to interact with the application

    from browser import document

All the keys in the keyboard are inside html anchors (tags `<a href="#">...</a>`). The object `document` can find all the anchors by :

    anchors = document.get(selector='a')

Since you are debugging the application, it is useful to control that you really get the anchors, so you can add the line

    print(anchors)

which will print the anchors list in the browser console

Ok, so *calculator.py* is 

    from browser import document
    
    anchors = document.get(selector="a")
    print(anchors)

Reload the page in the browser and open the console (Tools > Web developer > Web console). In the console, you should see a list of elements

    <DOMNode object type 'ELEMENT' name 'A'>

Each of the anchor object has an attribute _text_ ; you can see what this attribute is by changing the last line by

    print(list(anchor.text for anchor in anchors))

This prints `['7', '8', '9', '÷', '4', '5', '6', '*', '1', '2', '3', '-', '.', '0', '=', '+']` in the console

To define what happens when the user clicks on an anchor, Brython uses the syntax

    anchor.bind('click', callback)

where _callback_ is a function taking a `DOMEvent` instance as argument. In this application, we will use the same callback function for all the keys

    from browser import document
    
    anchors = document.get(selector="a")
    
    def callback(ev):
        print(ev.target.text)
    
    for anchor in anchors:
        anchor.bind('click', callback)

With these bindings, when the user hits a key, the text on this key in printed in the console (the attribute _target_ of the `DOMEvent` object is the anchor itself)

This is not exactly what we want : the text should be entered in the entry field. This entry field has the id "entry", and Brython gets a reference to the field by `document["entry"]`. The callback function can be changed to

    def callback(ev):
        document["entry"].value += ev.target.text

This is ok for most keys, but we must handle those that are supposed to compute a result. The complete code of *calculator.py* below should be self-explanatory

    from browser import document
    import math
    
    anchors = document.get(selector="a")
    entry = document["entry"]
    
    def callback(ev):
        txt = ev.target.text
        if txt=='C':
            entry.value = ''
        elif txt=='<' and entry.value:
            entry.value = entry.value[:-1]
        elif txt=='=':
            try:
                entry.value = eval(entry.value)
            except:
                entry.value = 'error'
        elif txt=='√¯':
            try:
                entry.value = math.sqrt(float(entry.value))
            except:
                entry.value = 'error'
        elif txt=="1/x":
            try:
                entry.value = 1/float(entry.value)
            except:
                entry.value = 'error'    
        else:
            entry.value += ev.target.text
    
    for anchor in anchors:
        anchor.bind('click', callback)
    
