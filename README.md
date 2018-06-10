[![Stories in Ready](https://badge.waffle.io/brython-dev/brython.svg?label=ready&title=Ready)](http://waffle.io/brython-dev/brython)
[![Travis](https://api.travis-ci.org/brython-dev/brython.svg)](https://travis-ci.org/brython-dev/brython)
[![CDNJS version](https://img.shields.io/cdnjs/v/brython.svg)](https://cdnjs.com/libraries/brython)

brython
=======

Brython (Browser Python) is an implementation of Python 3 running in the
browser, with an interface to the DOM elements and events.

Here is a simple example of an HTML page running Python:

```xml
    <html>

        <head>
            <script type="text/javascript" src="/path/to/brython.js"></script>
        </head>

        <body onload="brython()">

            <script type="text/python">
            from browser import document, alert

            def echo(event):
                alert(document["zone"].value)
            
            document["mybutton"].bind("click", echo)
            </script>

            <input id="zone"><button id="mybutton">click !</button>

        </body>

    </html>
```

To use Brython, all there is to do is:

1. Load the script [brython.js](http://brython.info/src/brython.js "Brython from the site brython.info").
2. Run the function `brython()` on page load, like `<body onload=brython()>`.
3. Write Python code inside tags `<script type="text/python">` or linking it.


Main features
=============
Brython supports most of the syntax of [Python 3](https://www.python.org "Python Homepage"),
including comprehensions, generators, metaclasses, imports, etc.
and many modules of the CPython distribution.

It includes libraries to interact with DOM elements and events,
and with existing Javascript libraries such as jQuery, 3D, Highcharts, Raphael etc.
It supports lastest specs of HTML5/CSS3, and can use CSS Frameworks like Bootstrap3, LESS, SASS etc.


Getting started
===============
Zero install !
--------------
The most simple way to get started, without anything to install, is to use the
distribution available online through [rawgit](https://rawgit.com/). You can
either choose the latest stable release :

```xml
<script type="text/javascript"
    src="https://cdn.rawgit.com/brython-dev/brython/3.6.2/www/src/brython.js">
</script>
```

or the current development version :

```xml
<script type="text/javascript"
    src="https://cdn.rawgit.com/brython-dev/brython/master/www/src/brython.js">
</script>
```

The previous code will allow you to use raw python code, but if you import
modules from the standard library this will be slow as they are implemented
using ajax calls. Besides __brython.js__ you can load a single javascript file
with the [available stdlib](https://github.com/brython-dev/brython/tree/master/www/src/Lib):

```xml
<script type="text/javascript"
    src="https://cdn.rawgit.com/brython-dev/brython/3.6.2/www/src/brython_stdlib.js">
</script>
```

or the current development version :

```xml
<script type="text/javascript"
    src="https://cdn.rawgit.com/brython-dev/brython/master/www/src/brython_stdlib.js">
</script>
```

Local install
-------------
To install Brython locally, if you have a CPython distribution with `pip` :

```bash
pip install brython
```

then create a new directory and run

```bash
python -m brython --install
```

or by loading the latest version of the Brython zip file from the
[releases page](https://github.com/brython-dev/brython/releases).

In both cases, the distribution includes __brython.js__ (the core Brython engine)
and __brython_stdlib.js__ (a bundle of all the files in the standard distribution).

It also includes the page __demo.html__ that shows a few examples of how you
can interact with a web page using Python as the scripting language : create
new elements, access and modify existing elements, create graphics, animations,
send Ajax requests, etc.

Test Brython online
===================
If you want to test Brython online you can visit the following:

- [Editor](http://brython.info/tests/editor.html "Online Brython Editor")
- [Console](http://brython.info/tests/console.html "Online Brython Console")


Gallery of examples
===================
There is a [gallery of examples](http://brython.info/gallery/gallery_en.html "gallery of examples")
where you can see simple and advanced examples using vanilla Brython or
interacting with other javascript libraries.


Documentation
=============
Documentation is available on the [official site](http://www.brython.info "Brython Homepage").
You can read the docs in [English](http://brython.info/static_doc/en/intro.html),
[French](http://brython.info/static_doc/fr/intro.html) and
[Spanish](http://brython.info/static_doc/es/intro.html).

The most updated docs usually are the English and French versions so if you
want to be up-to-date, please, use these versions.

Curious about [how Brython works](https://github.com/brython-dev/brython/wiki/How%20Brython%20works) ?

A [tutorial](https://github.com/brython-dev/brython/wiki/Writing-an-Android-application)
explains how to build Android applications with Brython.

Community (questions, feedback, issues, new features, ...)
==========================================================
You can subscribe and post to the
[mailing list](https://groups.google.com/forum/?fromgroups=#!forum/brython "Brython Main Mailing List").

If you find a bug/issue or do you want to see a new feature in Brython, please,
[open a new issue](https://github.com/brython-dev/brython/issues "Brython GitHub Issues").

There's a [Brython Community on Google Plus](https://plus.google.com/communities/114694456237115550531).

Agile Development
=================

- [**Brython KanBan of Tickets**](https://waffle.io/brython-dev/brython "Agile Development Kanban") *Whats Brython Team working on ?*

- **Throughput Graph:** *Statistics about our work...*

[![Throughput Graph](https://graphs.waffle.io/brython-dev/brython/throughput.svg)](https://waffle.io/brython-dev/brython/metrics)


Thank you
=========

- [BrowserStack](http://www.browserstack.com) for providing an access
to their online testing environment.
