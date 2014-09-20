brython
=======

Brython (Browser Python) is an implementation of Python 3 running in the browser.

Here is a simple example of an HTML page running Python:

    <html>
    
    <head>
    <script src="/brython.js"></script>
    </head>
    
    <body onload="brython()">
    
    <script type="text/python">
    from browser import document, alert
    
    def echo(ev):
        alert(document["zone"].value)
    
    document['mybutton'].bind('click',echo)
    </script>
    
    <input id="zone"><button id="mybutton">click !</button>
    
    </body>
    
    </html>

To use Brython, all there is to do is .

1. load the script brython.js.
2. run the function brython() on page load.
3. write Python code inside tags `<script type="text/python">`.

Main features
=============
Brython supports most of the syntax of Python 3, including comprehensions, generators, metaclasses, imports, etc. and many modules of the CPython distribution.

It includes libraries to interact with DOM elements and events, and with existing Javascript libraries such as jQuery, 3D, Highcharts, Raphael etc.

Getting started
===============
In the Releases section, load the latest version of the Brython site mirror, unzip it and start the built-in web server `server.py`. Point your browser to _http://localhost:8000_ and click on "site" : you access a clone of the [Brython site](http://brython.info) with an online editor, a console similar to the CPython interpreter, a gallery with many examples and a comprehensive documentation.

Once you are familiar with the examples, create a new folder "app" at the same level as "site" and create a file "index.html" with the HTML example above. Point the browser to _http://localhost:8000/app_ to see the result.

Test Brython online
===================
If you want to test Brython online you can visit the [editor](http://brython.info/tests/editor.html) or the [console](http://brython.info/tests/console.html).

Gallery of examples
===================
There is a [gallery of examples](http://brython.info/gallery/gallery_en.html) where you can see simple and advanced examples using vanilla Brython or interacting with other javascript libraries.

Documentation
=============
Documentation is available on the [official site](http://www.brython.info). You can read the docs in [English](http://brython.info/doc/en/index.html), [French](http://brython.info/doc/fr/index.html), [Spanish](http://brython.info/doc/es/index.html) and [Portuguese](http://brython.info/doc/pt/index.html). The most updated docs usually are the English version so if you want to be up-to-date, please, use that version.

Questions, feedback, issues, new features,...
=============================================
There is a main [mail list in english](https://groups.google.com/forum/?fromgroups=#!forum/brython). Also, you can find [mail list in other languages](http://brython.info/groups.html) but the activity is very low and it is recommended to use the main one in English. 

If you find a bug/issue or do you want to see a new feature in Brython, please, [open a new issue](https://github.com/brython-dev/brython/issues).
