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

```xml
<button onclick="echo()">
```
(because the brython function _echo_ is not accessible from Javascript), the
solution is to set an id to the element:

```xml
<button id="mybutton">
```

and to define the link between this element and the event _click_ by :

```python
from browser import document
document['mybutton'].bind('click',echo)
```

Another option is to force the introduction of the name _echo_ in the
Javascript namespace, by defining it as an attribute of the object
`window` in module **browser** :

```python
from browser import window
window.echo = echo
```
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

```xml
<script type="text/javascript">
circle = {surface:function(r){return 3.14*r*r}}
</script>

<script type="text/python">
from browser import document, window

document['result'].value = window.circle.surface(10)
</script>
```
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

```python
py_obj = window.js_obj.to_dict()
```

If the Javascript object is a function, the arguments passed to the Python
function are converted into Javascript objects, using the reverse of the
above table.

Take care, a Javascript function can't be called with keyword arguments, this
raises a `TypeError` exception : if the function is defined by

```python
function foo(x, y)
```

and if it is called from a Brython script by

```python
window.foo(y=0, x=1)
```

passing the arguments in the excepted order is not possible, because the
Brython script doesn't know the signature of the Javascript function.


### Using Javascript constructors

If a Javascript function is an object constructor, that can be called in
Javascript code with the keyword `new`, it can be used in Brython using
the `new` special method added by Brython to the Javascript object.

For instance :

```xml
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

rectangle = window.Rectangle
alert(rectangle.new(10,10,30,30).surface())
</script>
```

### jQuery example

Here is a more complete example of how you can use the popular library jQuery:

```xml
<html>
<head>
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js">
</script>
<script src="/src/brython.js"></script>
</head>

<script type="text/python">
from browser import window

jq = window.jQuery

# Ajax call
def onSuccess(data, status, req):
    print(data)
    print(status)

jq.ajax('/cgi-bin/post_test.py',
    {'data':
        {'foo': 56},
     'success': onSuccess
    }
)

# add an option to a SELECT box
jq('#sel').append('<option>three')

# access element attributes
assert jq('#c').attr('id') == 'c'

# define a callback for a click on a button
def callback(ev):
    print(jq(ev.target).text())

jq('#btn').on('click', callback)

# we can even use "each" to iterate on SPAN elements
def show(i, obj):
    print(i, obj)

jq.each(jq('span'), show)
</script>

<body onload="brython(1)">

<select id="sel">
  <option value="one">one
  <option value="two">two
</select>

<span id="c"></span>

<button id="btn">click</button>

</body>
</html>
```

### Other examples

You will find in the [gallery](../../gallery/gallery_en.html) other examples
of how to use Javascript librairies (Three, Highcharts, Raphael) in Brython
scripts.


### Integration of a Javascript library in a Python module

Another way to integrate a library is to create a Python module than can
be imported in scripts, without having to load this library in the script
page.

For that, the library must be accessible through an Ajax call? It is loaded
by the function `load(url)` of the [browser](browser.html) module, and the
names that it adds to the global Javascript namespace are exposed in the
Python module.

For instance, we can create a module **jquery**:

```python
from browser import window, load

load("/path/to/jquery.min.js")

# jQuery adds the name jQuery to the global Javascript namespace
# (also called $, but this is not a valid Python identifier)
jq = window.jQuery
```

We can then use this module in a Brython page (notice that we don't load
jquery.js):

```xml
<html>
<head>
<script src="brython.js"></script>
</head>
<body onload="brython(1)">
<script type="text/python">
import jquery

jquery("#test").text("I can use jQuery here !")
</script>

<div id="test"></div>
</body>
</html>
```