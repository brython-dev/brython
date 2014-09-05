module **javascript**
---------------------

The module **javascript** allows interaction with the objects defined in Javascript programs and libraries present in the same page as the Brython program

It defines two classes :

**javascript**.`JSObject`
>  is a class whose instances wrap Javascript objects

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

Examples
--------
Using `JSObject` with the Javascript library jQuery

>    from javascript import JSObject
>
>    def callback(*args):
>        ...
>
>    _jQuery=JSObject($("body"))
>    _jQuery.click(callback)

> See [jQuery](../../gallery/jsobject_example.html) for a live demo.


Using `JSConstructor` with the Javascript library three.js :

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor( THREE.PerspectiveCamera )
>    camera = cameraC( 75, 1, 1, 10000 )

> See [three](../../gallery/three.html) for a full functional example
