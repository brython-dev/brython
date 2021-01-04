Options of function `brython()`
-------------------------------

To run the Python scripts in the page, you must call the function `brython()`
on page load.

`<body onload="brython(`*[options]*`)">`

*options* can be an integer, in this case it is the debug level :

- 0 (default) : no debugging. Use this when the application is debugged, it
  slightly speeds up execution
- 1 : error messages are printed in the browser console (or to the output
  stream specified by `sys.stderr`)
- 2 : the translation of Python code into Javascript code is printed in the
  console
- 10 : the translation of Python code and of the imported modules is printed
  in the console

*options* can be a Javascript object, its keys can be

- *debug* : debug level (see above)
- *cache* : if set to `true`, the Ajax calls to import modules, load external
  scripts by `<script src="foo.py">` or read files with `open()` use the
  browser cache. Defaults to `false`.
- *static\_stdlib\_import* : boolean, indicates if, in order to import modules
  or packages from the standard library, the static mapping table in the
  script __stdlib\_paths.js__ should be used. Defaults to `true`
- *pythonpath* : a list of paths where imported modules should be searched
- *ids* : by default, the function `brython()` runs all the scripts in the
  page. This option specifies a list of element identifiers (tag attribute
  `id`) whose text content must be run as Python code
- *ipy_id": same as *ids*. See
  [brythonmagic](https://github.com/kikocorreoso/brythonmagic) for more
  information
- *indexedDB* : specifies if the program can use the indexedDB database to
  store a compiled version of the modules located in __brython_stdlib.js__
  or __brython_modules.js__. Defaults to `true`.

Example of `brython` options usage:
-----------------------------------

>    brython({debug:1, ids:['hello']})

will run the content of the element with id "hello" with debug level 1
