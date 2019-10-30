Brython packages
================
_New in version 3.7.5_

A "Brython package" can be loaded in the HTML page to give access to
importable modules. It consists in a file with the extension
__`.brython.js`__ containing the modules and packages to distribute; it is
inserted by the usual syntax

```xml
<script src="http://anyhost/path/package_name.brython.js"></script>
```

Brython packages can be located on any server, making their deployment and
usage very straightforward.

To generate a Brython package, use the CPython `brython` package. In the
directory where the modules and packages to distribute stand, run:

```console
python -m brython --make_package <package_name>
```

If the directory contains a file __`__init.py__`__, the modules will be
relative to the package. For instance, if the directory structure is

    __init__.py
    dialog.py
    menu.py

and we want to generate package __`widgets`__ from this directory, then
modules will be imported by

```python
import widgets.dialog
from widgets import menu
```

If the directory does not contain __`__init__.py`__, the modules will be
imported by their name. So if it only contains

    dialog.py
    menu.py

the modules will be imported by

```python
import dialog
import menu
```