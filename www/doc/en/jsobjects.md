Using Javascript objects
------------------------

We have to handle the transition period when Brython is going to coexist with 
Javascript ;-)

### Accessing Brython objects from Javascript

By default, Brython only exposes two names in the global Javascript namespace:

> `brython()` : the function run on page load

> `__BRYTHON__` : an object used internally by Brython to store the objects 
> needed for scripts execution

Consequently, by default, a Javascript program cannot access Brython objects.
 For instance, for a function `echo()` defined in a Brython script 
to react to an event on an element in the page, instead of using the regular 
javascript syntax:

    <button onclick="echo()">

(because the brython function _echo_ is not accessible from Javascript), the 
solution is to set an id to the element:

    <button id="mybutton">

and to define the link between this element and the event _click_ by :

    from browser import document
    document['mybutton'].bind('click',echo)

Another option is to force the introduction of the name _echo_ in the 
Javascript namespace, by defining it as an attribute of the object 
`window` in module **browser** :

    from browser import window
    window.echo = echo

<strong>NOTE: This method is not recommended, because it introduces a risk of 
conflict with names defined in a Javascript program or library used in the page.
</strong>

### Objects in Javascript programs

An HTML document can use Javascript scripts or libraries, and Python scripts 
or libraries

The names added by Javascript programs to the global Javascript namespace are
available in Brython scripts as attributes of the object `window` defined in 
the module **browser**

For instance :

>    <script type="text/javascript">
>    circle = {surface:function(r){return 3.14*r*r}}
>    </script>
>    
>    <script type="text/python">
>    from browser import document, window
>
>    document['result'].value = window.circle.surface(10)
>    </script>

Javascript objects are converted into their Python equivalent in this way :

<table border='1' cellpadding=3>

<tr><th>Javascript object (js\_obj)</th><th>Python object (window.js\_obj)</th>
</tr>
<tr><td>DOM element</td><td>instance of `DOMNode`</td></tr>
<tr><td>DOM event</td><td>instance of `DOMEvent`</td></tr>
<tr><td>Collection of DOM elements</td><td>list of `DOMNode` instances</td>
</tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>Integer</td><td>instance of `int`</td></tr>
<tr><td>Float</td><td>instance of `float`</td></tr>
<tr><td>String</td><td>instance of `str`</td></tr>
<tr><td>Array</td><td>instance of `list`</td></tr>
</table>

The other Javascript objects are converted into an instance of the class
`JSObject` defined in module **javascript**. They can be converted into
a Python dictionary by :

>    py_obj = window.js_obj.to_dict()

If the Javascript object is a function, the arguments passed to the Python
function are converted into Javascript objects, using the reverse of the
above table.

Take care, a Javascript function can't be called with keyword arguments, this
raises a `TypeError` exception : if the function is defined by

>    function foo(x, y)

and if it is called from a Brython script by

>    window.foo(y=0, x=1)

passing the arguments in the excepted order is not possible, because the
Brython script doesn't know the signature of the Javascript function.


### Using Javascript constructors

If a Javascript function is an object constructor, that can be called in 
Javascript code with the keyword `new`, it can be used in Brython by 
transforming it with the function `JSConstructor()` defined in module 
**javascript**.

`JSConstructor(`_constr_`)`

> returns a function that, when called with arguments, returns a Python object 
matching the Javascript object built by the constructor _constr_.

For instance :

    <script type="text/javascript">
    function Rectangle(x0,y0,x1,y1){
        this.x0 = x0
        this.y0 = y0
        this.x1 = x1
        this.y1 = y1
        this.surface = function(){return (x1-x0)*(y1-y0)}
    }
    </script>
    
    <script type="text/python">
    from browser import alert, window
    from javascript import JSConstructor

    rectangle = JSConstructor(window.Rectangle)
    alert(rectangle(10,10,30,30).surface())
    </script>

### jQuery example

Here is a more complete example of how you can use the popular library jQuery:

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
    from browser import document, window
    
    def change_color(ev):
      _divs = document.get(selector='div')
      for _div in _divs:
          if _div.style.color != "blue":
             _div.style.color = "blue"
          else:
             _div.style.color = "red"
    
    # creating an alias for "$" in jQuery would cause a SyntaxError in Python
    # so we assign jQuery to a variable named jq

    jq = window.jQuery.noConflict(True)
    _jQuery = jq("body")
    _jQuery.click(change_color)    
    </script>
    
    <body onload="brython()">

      <div>Click here</div>
      <div>to iterate through</div>
      <div>these divs.</div>
     
    </body>
    </html>

    
### Other examples

You will find in the [gallery](../../gallery/gallery_en.html) other examples
of how to use Javascript librairies (Three, Highcharts, Raphael) in Brython 
scripts.
