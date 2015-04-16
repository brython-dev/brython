module **javascript**
---------------------

The module **javascript** allows interaction with the objects defined in Javascript programs and libraries present in the same page as the Brython program

It defines two classes and a function :

**javascript**.`JSObject`
>  is a class whose instances wrap Javascript objects

> _**Warning : **_ This class is normally not used directly. Getting a reference to a Javascript object with `window.js_obj` returns an instance of `JSObject`

> <code>JSObject(_jsobj_)</code> returns an object *brobj* that wraps the Javascript object *jsobj*. Operations performed on the instance of `JSObject` impact the Javascript object by converting as accurately as possible Python types into Javascript types

> If *jsobj* is a function, the arguments passed to *brobj* are converted before being passed to *jsobj* in this way

<blockquote>
<table border='1' cellpadding=3>
<tr><th>Argument in Brython function call</th><th>Argument passed to Javascript function</th></tr>
<tr><td>`DOMNode` instance</td><td>DOM element</td></tr>
<tr><td>`DOMEvent` instance</td><td>DOM event</td></tr>
<tr><td>list of `DOMNode` instances</td><td>DOM nodes list</td></tr>
<tr><td>`None, True, False`</td><td>`null, true, false`</td></tr>
<tr><td>`int` instance</td><td>integer</td></tr>
<tr><td>`float` instance</td><td>float</td></tr>
<tr><td>`str` instance</td><td>string</td></tr>
<tr><td>`list` instance</td><td>Javascript array</td></tr>
<tr><td>`JSObject` instance</td><td>Javascript object</td></tr>
</table>
</blockquote>

> The result is converted to a Brython object using the reverse operations.

**javascript**.`JSConstructor`
> is a class whose instances represent Javascript constructors, (ie functions used with the Javascript keyword `new`)

> <code>JSConstructor(_jsconstr_)</code> returns a Brython object. This object is callable ; it returns an instance of `JSObject` representing the Javascript obtained by passing to the constructor *jsconstr* the arguments converted as indicated in the table above


**javascript**.`load(`_script\_url[,names]_`)`
> Load the Javascript script at address _script\_url_ and loads the list of
> _names_ in the program namespace.

> This function uses a blocking Ajax call. It must be used when one can't
> load the Javascript library in the html page by 
> `<script src="prog.js"></script>`. 

> For instance, the module **jqueryui** in Brython standard library
> provides an interface with the Javascript librairy jQueryUI. To use it in a 
> Brython script, you simply write `import jqueryui` without inserting the
> Javascript librairies in the page. It's the module **jqueryui** that
> loads them, using this function `load()`

Example
-------

Using `JSConstructor` with the Javascript library three.js :

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor( THREE.PerspectiveCamera )
>    camera = cameraC( 75, 1, 1, 10000 )

> See [three](../../gallery/three.html) for a full functional example
