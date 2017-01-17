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

**browser**.`load(`_script\_url[,names]_`)`
> Load the Javascript script at address _script\_url_ and loads the list of
> _names_ in the program namespace.

> This function uses a blocking Ajax call. It must be used when one can't
> load the Javascript library in the html page by 
> `<script src="prog.js"></script>`. 

> For instance, the module **jqueryui** in Brython standard library
> provides an interface with the Javascript library jQueryUI. To use it in a 
> Brython script, you simply write `import jqueryui` without inserting the
> Javascript libraries in the page. It's the module **jqueryui** that
> loads them, using this function `load()`

**browser**.`prompt(`_message[,default]_`)`
> a function that prints the _message_ in a window, and an entry field. Returns the entered value ; if no value was entered, return _default_ if defined, else the empty string

**browser**.`window`
> an object that represents the browser window

