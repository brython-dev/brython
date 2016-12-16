To install Brython :

- if your PC has CPython and pip, install the package `brython` by

```
    pip install brython
```

> then in an empty directory run

```
    python -m brython --install
```

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

```
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```
