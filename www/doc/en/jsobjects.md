Interactions with Javascript
----------------------------

We have to handle the transition period when Brython is going to coexist with
Javascript ;-)

An HTML document HTML can include Javascript scripts and Python scripts.

This page deals with the interactions between Python programs and Javascript
programs, under two categories:

- <a href="#js_from_brython">using Javascript data from Brython programs</a>
- <a href="#brython_from_js">using Brython data from Javascript programs</a>

An important point is that Brython scripts are executed when the HTML has
finished loading, while Javascript scripts are executed on the fly when they
are loaded in the page. Consequently, Brython data cannot be used by
Javascript programs until the page is completely loaded.

<a name="js_from_brython"></a>
## Using Javascript data from Brython programs

The names added by Javascript programs to the global Javascript namespace are
available to Brython scripts as attributes of the object `window` defined in
module **browser**.

For instance :

```xml
<script type="text/javascript">
circle = {surface: function(r){return 3.14 * r * r}}
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
<tr><td>`true, false`</td><td>`True, False`</td></tr>
<tr><td>`null`</td><td>unchanged (1)</td></tr>
<tr><td>`undefined`</td><td>unchanged (1)</td></tr>
<tr><td>number (Number)</td><td>instance of `int` or `float`</td></tr>
<tr><td>big integer (BigInt)</td><td>instance of `int`</td></tr>
<tr><td>string (String)</td><td>instance of `str`</td></tr>
<tr><td>Javascript array (Array)</td><td>unchanged (2)</td></tr>
<tr><td>function (Function)</td><td>unchanged (3)</td></tr>
</table>

_(1) The value can be tested by comparing it with `is` to constants `NULL`_
_and `UNDEFINED` in module [javascript](javascript.html)_

_(2) The items in the Javascript array are converted to Python objects_
_with this conversion table_

_(3) If the object is a function, the Python arguments passed to the Python_
_function are converted when calling the Javascript function with the reverse_
_conversion table as above. If the argument is a Python dictionary, it is_
_converted to a Javascript objects; the keys are converted to strings in the_
_Javascript object._

The other Javascript objects are converted into an instance of the class
`JSObject` defined in module **javascript**. They can be converted into
a Python dictionary by :

```python
py_obj = window.js_obj.to_dict()
```

Take care, a Javascript function can't be called with keyword arguments, this
raises a `TypeError` exception : if the function is defined by

```python
function foo(x, y)
```

and if it is called from a Brython script by

```python
window.foo(y=0, x=1)
```

passing the arguments in the expected order is not possible, because the
Brython script doesn't know the signature of the Javascript function.


### Using Javascript constructors

If a Javascript function is an object constructor, that can be called in
Javascript code with the keyword `new`, it can be used in Brython using
the `new` special method added by Brython to the Javascript object.

For instance :

```xml
<script type="text/javascript">
function Rectangle(x0, y0, x1, y1){
    this.x0 = x0
    this.y0 = y0
    this.x1 = x1
    this.y1 = y1
    this.surface = function(){return (x1 - x0) * (y1 - y0)}
}
</script>

<script type="text/python">
from browser import alert, window

rectangle = window.Rectangle
alert(rectangle.new(10, 10, 30, 30).surface())
</script>
```

### Exceptions

If an error happens in a Javascript script called by a Brython script, an
exception instance of class `JavascriptError` is triggered and can be
caught by the Brython code. The Javascript error trace is printed on
`sys.stderr`.

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
jq('#sel').append('<' + 'option>three')

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

<body>

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

You will find in the [gallery](/gallery/gallery_en.html) other examples
of how to use Javascript libraries (Three, Highcharts, Raphael) in Brython
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

<body>
<script type="text/python">
import jquery

jquery("#test").text("I can use jQuery here !")
</script>

<div id="test"></div>
</body>
</html>
```


<a name="brython_from_js"></a>

## Using Brython data from Javascript programs

By default, Brython only exposes two names in the global Javascript namespace:

> `brython()` : function that triggers execution of the Python scripts in the page
> (see [Execution options](options.html))

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
document['mybutton'].bind('click', echo)
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

### Properties of object `__BRYTHON__`

The object `__BRYTHON__` exposes attributes that can be used by Javascript
programs to interact with objects defined in Python scripts in the same page.


*`__BRYTHON__`.whenReady*

> A Javascript `Promise` resolved when Brython is loaded and can be used by
> Javascript programs

<blockquote>
```xml
function use_brython(){
    // code here
}

__BRYTHON__.whenReady.then(use_brython)
```
</blockquote>

*`__BRYTHON__`.getPythonModule(module_name)*

> if the Python module named _module_name_ is imported in the page, returns
> the Javascript object whose properties are the names defined in the module
>
> For the Python scripts in the page, `module_name` is the script identifier
> (attribute `id` of the `<script>` tag).

<blockquote>
```xml
<script type="text/python" id="s1">
from browser import alert

def show_square(x):
    alert(x ** 2)
</script>

Square of <input id="num" value="2"><button id="btn">show</show>

<script>
document.getElementById('btn').addEventListener('click',
    function(ev){
        var v = document.getElementById('num').value
        __BRYTHON__.getPythonModule('s1').show_square(parseInt(v))
    }
)
</script>
```
</blockquote>

Before using a Python module it is required to make sure that it is actually
loaded and executed. For that, use the "load" event on the HTML element
`<script type="text/python">`:

<blockquote>
```xml
<script type="text/python" debug=1 id="s1">
x = 0
</script>


<script>
var s1 = document.getElementById('s1')
s1.addEventListener('load', function(script){
  var module = __BRYTHON__.getPythonModule('s1')
  console.log(module.x)
})
</script>
```
</blockquote>

*`__BRYTHON__`.pythonToJS(_src_[, _script_id_])*

> converts the Python source code `src` into a string that holds its
> translation to Javascript. The result can be executed by `eval()`
> to trigger the script execution.

*`__BRYTHON__`.pythonToAST(_src_[, _filename_, _mode_])*

> gererates the AST (Abstract Syntax Tree) for the Python source code _src_
> under the forme of a Javascript object with the same structure as described
> in the [Python documentation](https://docs.python.org/3/library/ast.html)

*`__BRYTHON__`.runPythonSource(_src_[, _attributes_])*

> executes Python source code `src` as if it was a script with the specified
> _attributes_. If _attributes_ is a string, it is the script `id`, otherwise
> it must be a Javascript object.

> [Execution options](options.html) such as debug level, path for imports,
> etc. can be passed as attributes, for instance

<blockquote>
```xml
var src = "import some_module"
__BRYTHON__.runPythonSource(src, {pythonpath: 'my_modules', debug: 2})
```
</blockquote>

> Returns the Javascript object that represents the
> module (also available as `__BRYTHON__.getPythonModule(script_id)`)

<blockquote>
```xml
<script type="text/py-disabled" id="s1">
from browser import alert

string = "script s2"
integer = 8
real = 3.14

dictionary = {'a': string, 'b': integer, 'c': real}

alert('run py-disabled')
</script>

<button id="btn">Run disabled</show>

<script>
document.getElementById('btn').addEventListener('click',
    function(ev){
        var script = document.getElementById('s1'),
            modobj = __BRYTHON__.runPythonSource(script.innerText, {id: 's1'})
        console.log(modobj)
    }
)
</script>
```
</blockquote>


*`__BRYTHON__`.importPythonModule(_module_name_[, _attributes_])*

> imports the Python Python using the _attributes_ as defined above. Returns
> the Javascript object that represents the module.

*`__BRYTHON__`.pyobj2jsobj(pyobj)*

> converts a Python object into the matching Javascript object, following the
> above conversion table
