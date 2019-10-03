First installation
------------------

To install Brython :

- if your PC has CPython and pip, install the package `brython` by
```console
pip install brython
```

> then in an empty directory run
>```console
>python -m brython --install
>```

- if you can't use this method, go to the [releases page](https://github.com/brython-dev/brython/releases)
on Github, select the latest version, download and unzip __Brython-x.y.z.zip__.

In both cases the directory has the following files :

- __brython.js__ : the Brython engine, to include in the HTML page
- __brython_stdlib.js__ : groups all the modules and packages of the part of
  the Python standard library supported by Brython
- __demo.html__ : a page with a few examples of how to use Brython for
  client-side development

__brython.js__ includes very often used modules : `browser, browser.html, javascript`.

If your application uses modules of the standard distribution, you need to
include __brython_stdlib.js__ besides __brython.js__:

```xml
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```

Updates
-------
When a new version of Brython is published, the update is done by the usual
command:

```console
pip install brython --upgrade
```

In the application directory, you can then update the Brython files
(__brython.js__ and __brython_stdlib.js__) by:

```console
python -m brython --update
```

Installing a CPython package
----------------------------
A CPython package installed by `pip` can be installed in a Brython application
by the command `--add_package <package name>`.

For example:
```console
pip install attrs
python -m brython --add_package attrs
```

All the files in the package must of course be usable by Brython; this
excludes files written in C for instance.

Other commands
--------------

`-- modules`

> creates an application-specific distribution, to replace
> __`brython_stdlib.js`__ by a smaller file. See section
> [import](import.html).

`-- make_dist`

> generate a CPython package, suitable for distribution by PyPI, to install a
> Brython application. See section [Deploying a Brython application](deploy.html)

`-- make_package`

> generates a "Brython package", allowing to distribute a module or a package
> in a very straightforward way. See section [Packages Brython](brython-packages.html)

Web server
----------
The HTML files can be opened in the browser, but it is recommended to
start a web server in the application directory.

The most straightforward is to use the module **http.server** in CPython
standard distribution:

```console
python -m http.server
```

The default port is 8000. To choose another port:

```console
python -m http.server 8001
```

You can then access the pages by entering _http://localhost:8001/demo.html_
in the browser address bar.