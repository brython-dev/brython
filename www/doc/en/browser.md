The package **browser** groups the built-in Brython-specific names and modules

**browser**.`alert(`_message_`)`
> a function that prints the _message_ in a pop-up window. Returns `None`

**browser**.`confirm(`_message_`)`
> a function that print the _message_ in a window, and two buttons (ok/cancel). Returns `True` if ok, `False` if cancel

**browser**.`console`
> an object with methods to interact with the browser console. Its interface is browser-specific. It exposes at least the method `log(msg)`, which prints the message _msg_ in the console

**browser**.`document`
> an object that represents the HTML document currently displayed in the browser window. The interface of this object is described in section "Browser interface"

**browser**.`DOMEvent`
> the class of DOM events

**browser**.`DOMNode`
> the class of DOM nodes

**browser**.`prompt(`_message[,default]_`)`
> a function that prints the _message_ in a window, and an entry field. Returns the entered value ; if no value was entered, return _default_ if defined, else the empty string

**browser**.`window`
> an object that represents the browser window

