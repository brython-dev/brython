Implementation of `import`
--------------------------

To import modules or packages, Brython uses the same mechanism as CPython : to 
resolve "import X", the program looks for a file in several places, first in 
the standard library (urls relative to that of the script __brython.js__) :

- __libs/X.js__ (Javascript modules, for the modules in the standard library 
  that can't be written in Python)
- __Lib/X.py__
- __Lib/X/\_\_init\_\_.py__
- __&lt;current\_dir&gt;/X.py__ (current\_dir is the directory of the script that
  performs the import)
- __&lt;current\_dir&gt;/X/\_\_init\_\_.py__
- __Lib/site-packages/X.py__
- __Lib/site-packages/X/\_\_init\_\_.py__

Since the browser has no direct access to the file system, looking for a file must be done by an Ajax call, which returns an error message if there is no file at the specified url

This method is time consuming for scripts that must import many modules (for instance, for "import random", no less than 44 modules must be imported !). To improve performance, Brython proposes several options :

1. the standard library can be loaded in the HTML page with the file __py\_VFS.js__ :

   `<script src="/src/py_VFS.js"></script>`

   In this case, lookups in the standard library consist in checking if the module name is referenced in this script ; if so, the source code is retrieved and run, without having to perform an Ajax call

   This method speeds up imports from the standard library ; the drawbacks are that the file __py\_VFS.js__ is large (around 2 MB), and that if the user modifies the content of the standard library (which is not good practise, but it can be for debugging), he must generate a new version of __py\_VFS.js__ using the Python script __scripts/make\_VFS.py__

2. if __py\_VFS.js__ is not included, lookups in the standard library use a table mapping module names to a url relative to that of __brython.js__ : if the name exists in this table, a single Ajax call is made to the specified location

   The only drawback of this method is that if the user modifies the location of scripts in the standard library, he must generate the table, using the script __scripts/make\_dist.py__

   To disable this option and force the lookup by Ajax calls on all the possible locations, the function __brython()__ must be invoked with the option `static_stdlib_import` set to `false`

Note that modules must be encoded in utf-8 ; the encoding declaration at the top of the script is ignored