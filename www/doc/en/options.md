Options of function `brython()`
-------------------------------

To run the Python scripts in the page, you must call the function `brython()` on page load

`<body onload="brython(`*[options]*`)">`

*options* can be an integer, in this case it is the debug level :

- 0 (default) : no debugging. Use this when the application is debugged, it slightly speeds up execution
- 1 : error messages are printed in the browser console (or to the output stream specified by `sys.stderr`)
- 2 : the translation of Python code into Javascript code is printed in the console
- 10 : the translation of Python code and of the imported modules is printed in the console

*options* can be a Javascript object, its keys can be

- *debug* : debug level (see above)
- *static\_stdlib\_import* : boolean, indicates if, in order to import modules or packages from the standard library, the static mapping table in the script __stdlib\_paths.js__ should be used. Defaults to `true`
- *pythonpath* : a list of paths where imported modules should be searched
- *ipy_id* : by default, the function `brython()` runs all the scripts in the page. This option specifies a list of element identifiers (tag attribute `id`) whose text content must be run as Python code. See [brythonmagic](https://github.com/kikocorreoso/brythonmagic) for more information
- *profile* : When the `profile` option is > 0 the compiler adds additional code to the generated javascript which collects profiling information. To `profile` module provides access to this information. It strives to provide an interface largely similar to the `profile` module from the standard python distribution. See (Testing, debugging and profiling)[http://brython.info/static_doc/en/test.html] for more information


Example of `brython` options usage:
-----------------------------------

>    brython({debug:1, ipy_id:['hello']})

will run the content of the element with id "hello" with debug level 1
