The package **browser** groups the built-in Brython-specific names and modules

**browser**.`alert(`_message_`)`
> a function that prints the _message_ in a pop-up window. Returns `None`

**browser**.`bind(`_target, event_`)`
> a function used as a decorator for event binding. Cf. section [events](events.html).

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

**browser**.`load(`_script\_url_`)`
> Load the Javascript library at address _script\_url_.

> This function uses a blocking Ajax call. It must be used when one can't
> load the Javascript library in the html page by
> `<script src="prog.js"></script>`.

> The names inserted by the library inside the global Javascript namespace
> are available in the Brython script as attributes of the `window` object.

> For instance, the module **jqueryui** in Brython standard library
> provides an interface with the Javascript library jQueryUI. To use it in a
> Brython script, you simply write `import jqueryui` without inserting the
> Javascript libraries in the page. It's the module **jqueryui** that
> loads them, using this function `load()`

**browser**.`prompt(`_message[,default]_`)`
> a function that prints the _message_ in a window, and an entry field.
> Returns the entered value ; if no value was entered, return _default_ if
> defined, else the empty string

**browser**.`run_script(`_src[, nom]_`)`
> this function executes the Python source code in _src_ with an optional
> _name_. It can be used as an alternative to `exec()`, with the benefit
> that the indexedDB cache is used for importing modules from the standard
> library.


**browser**.`window`
> an object that represents the browser window

