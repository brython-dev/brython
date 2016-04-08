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

Since the browser has no direct access to the file system, looking for a file 
must be done by an Ajax call, which returns an error message if there is no 
file at the specified url.

This method is time consuming for scripts that must import many modules (for 
instance, for "import random", no less than 44 modules must be imported !). To 
improve performance, Brython proposes several options :

1. the standard library can be loaded in the HTML page with the file __py\_VFS.js__ :

   `<script src="/src/py_VFS.js"></script>`

   In this case, lookups in the standard library consist in checking if the 
   module name is referenced in this script ; if so, the source code is 
   retrieved and run, without having to perform an Ajax call.

   This method speeds up imports from the standard library ; the drawbacks are 
   that the file __py\_VFS.js__ is large (around 2 MB), and that if the user 
   modifies the content of the standard library (which is not good practise, 
   but it can be for debugging), he must generate a new version of __py\_VFS.js__ 
   using the Python script __scripts/make\_VFS.py__

2. if __py\_VFS.js__ is not included, lookups in the standard library use a 
table mapping module names to a url relative to that of __brython.js__ : if 
the name exists in this table, a single Ajax call is made to the specified 
location.

   The only drawback of this method is that if the user modifies the location 
   of scripts in the standard library, he must generate the table, using the 
   script __scripts/make\_dist.py__.

   To disable this option and force the lookup by Ajax calls on all the 
   possible locations, the function __brython()__ must be invoked with the 
   option `static_stdlib_import` set to `false`.

Note that modules must be encoded in utf-8 ; the encoding declaration at the 
top of the script is ignored.

### Configuring the import machinery

Since version 3.2.1 Brython's import machinery complies to a notable subset of [the Python 3.5 import system specification](http://docs.python.org/3/reference/import), including PEP 302, PEP 328, PEP 366, PEP 451. At this moment support for other import specifications is either partial or non-existing , which includes PEP 402 (by design?), 
and PEP 338. Access to Brython built-in finders and loaders is possible by importing ``_importlib` module.

The most straightforward way to import user modules deployed under an specific URL is to add the URL to `sys.path` as follows.

```
import sys
sys.path.append('http://samedomain.tld/new/path')
```

The URL may point to a folder deployed in the server side or to a user-provider VFS file. In the later case file name must end with `.vfs.js` extension. Modules code may be written as Python source code (i.e. `py` file type), compiled javascript modules (i.e. `pyc.js` file type) and pure Javascript modules (i.e. `.js` file type). Initially the import machinery will try to find a match for each file type at a given path. Once it is found, for performance reasons only the matching file type will be attempted for that path when processing subsequent import statements. In other words, all modules deployed under a given folder and its subfolders must be of the same type.

It is possible to optimize the initial file type discovery procedure by biasing the import machinery as follows.

```
import _importlib
# file_type may be one of 'py', 'pyc.js', 'js', 'none'
_importlib.optimize_import_for_path('http://samedomain.tld/new/path', file_type)
```

A much more declarative approach for adding an entry in `sys.path` consists in including, in the document's `<head />`, `<link />` tags with `rel="pythonpath"` attribute set, e.g.

   `<link rel="pythonpath" href="http://samedomain.tld/new/path" />`

File type optimization is possible by adding standard `hreflang` attribute, e.g.

   `<link rel="pythonpath" href="http://samedomain.tld/new/path" hreflang="py" />`

VFS files may be pre-loaded at Brython initialization time by adding `prefetch` in the element's `rel` attribute, like shown below.

   `<link rel="pythonpath prefetch" href="http://samedomain.tld/path/to/file.vfs.js" />`

The values supplied in `href` attribute may be relative and will be resolved by the browser according to its own rules.

