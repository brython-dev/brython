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

            document['mybutton'].bind('click', echo)
            </script>

            <input id="zone"><button id="mybutton">click !</button>

        </body>

    </html>
```

To use Brython, all there is to do is:

1. Load the script [brython.js](http://brython.info/src/brython.js "Brython from the site brython.info").
   If you want to use modules from the standard library, also load _brython_stdlib.js_
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
You can read the docs in [English](http://brython.info/doc/en/index.html),
[French](http://brython.info/doc/fr/index.html) and
[Spanish](http://brython.info/doc/es/index.html).

Curious about [how Brython works](https://github.com/brython-dev/brython/wiki/How%20Brython%20works) ?

Community (questions, feedback, issues, new features, ...)
==========================================================
There is a main [mailing list in English](https://groups.google.com/forum/?fromgroups=#!forum/brython "Brython Main Mailing List").

If you find a bug/issue or do you want to see a new feature in Brython, please,
[open a new issue](https://github.com/brython-dev/brython/issues "Brython GitHub Issues").

