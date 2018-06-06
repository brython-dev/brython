Implementation of _import_
--------------------------

Like in standard Python, you can install modules or packages Python in your
application by putting them in the root directory, or in directories with a
file __\_\_init.py\_\___.

Note that modules must be encoded in utf-8 ; the encoding declaration at the
top of the script is ignored.

For instance, the application can be made of the following files and
directories :

    .bundle-include
    app.html
    brython.js
    brython_modules.js
    brython_stdlib.js
    index.html
    users.py
    utils.py
    + app
        __init__.py
        records.py
        tables.py

A Python script in __app.html__ can run the imports

```python
import users
import app.records
```

If the standard distribution has been included in the page by

    <script type="text/javascript" src="brython_stdlib.js"></script>

the script can also run

```python
import datetime
import re
```

To import modules or packages, Brython uses the same mechanism as CPython : to
resolve "import X", the program looks for a file in several places :

- a module __X__ in the standard distribution
- a file __X.py__ in the root directory
- a file __\_\_init\_\_.py__ in directory __X__

Since the browser has no direct access to the file system, looking for a file
must be done by an Ajax call, which returns an error message if there is no
file at the specified url.

Optimisation
============
The process described above has two main drawbacks :

- the relatively big size of __brython_stdlib.js__ (more than 3 Mb)
- the time taken by Ajax calls

To optimise imports, if Brython was installed by `pip`, you can generate
a file __brython_modules.js__ which only holds the modules used by the
application.

For that, open a console window, navigate to the application directory and
execute

`python -m brython --modules`

Note that this program parses the Brython code in all the scripts, modules
and HTML pages of the directory and its sub-directories. The CPython version
used must be compliant with this Brython code : for instance if there are
f-strings in the Brython code, CPython 3.6+ is required, otherwise you would
get syntax errors.

You can then replace all the occurrences of

    <script type="text/javascript" src="brython_stdlib.js"></script>

by

    <script type="text/javascript" src="brython_modules.js"></script>


