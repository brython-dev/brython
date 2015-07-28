module **javascript**
---------------------

The module **javascript** allows interaction with the objects defined in 
Javascript programs and libraries present in the same page as the Brython 
program.

It defines two classes and a function :

**javascript**.`JSConstructor`
> is a class whose instances represent Javascript constructors, (ie functions 
> used with the Javascript keyword `new`)

> <code>JSConstructor(_jsconstr_)</code> returns a Brython object. This object 
> is callable ; it returns the object built by the constructor *jsconstr*, 
> tranformed into a Python object according to the conversion table in
> <a href="jsojects.html">Javascript objects and libraries</a>.

**javascript**.`JSObject`
> Class for Javascript objects that can't be converted "naturally" into Python
> objects when they are referenced as attributes of `browser.window`. This
> class is used internally by Brython and should not be used in scripts.

> See <a href="jsojects.html">Javascript objects and libraries</a>.

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
