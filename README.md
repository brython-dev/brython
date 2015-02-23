[![Stories in Ready](https://badge.waffle.io/brython-dev/brython.svg?label=ready&title=Ready)](http://waffle.io/brython-dev/brython)    [![Join the chat at https://gitter.im/brython-dev/brython](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/brython-dev/brython?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge "Chat with Brython Users and Developers")


brython
=======

Brython (Browser Python) is an implementation of Python 3 running in the 
browser, with an interface to the DOM elements and events.

Here is a simple example of an HTML page running Python:

```xml
    <html>

        <head>
            <script src="/src/brython.js"></script>
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

1. Load the script [brython.js](http://brython.info/src/brython_dist.js "Brython from the site brython.info").
2. Run the function brython() on page load, like `<body onload=brython()>`.
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
In the Releases section, load the latest version of the Brython site mirror,
unzip it and start the built-in web server `server.py`. This will point your
browser to [http://localhost:8000/site](http://localhost:8000/site):
you access a clone of the [Brython site](http://brython.info "Brython Homepage")
with an online editor, a console similar to the CPython interpreter,
a gallery with many examples and a comprehensive documentation.

```bash
git clone https://github.com/brython-dev/brython.git
cd brython
python server.py
```

Once you are familiar with the examples...,
create a new folder "app" at the same level as "site" and create a file "index.html"
with the HTML example above.
Point the browser to [http://localhost:8000/app](http://localhost:8000/app) to see the result.

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
[French](http://brython.info/doc/fr/index.html),
[Spanish](http://brython.info/doc/es/index.html) and
[Portuguese](http://brython.info/doc/pt/index.html).
The most updated docs usually are the English and French versions so if you 
want to be up-to-date, please, use these versions.


Questions, feedback, issues, new features...
=============================================
There is a main [mail list in English](https://groups.google.com/forum/?fromgroups=#!forum/brython "Brython Main Mailing List").
Also, you can find [mail list in other languages](http://brython.info/groups.html "Brython Mailing Lists")
but the activity is very low and it is recommended to use the main one in English.

If you find a bug/issue or do you want to see a new feature in Brython, please,
[open a new issue](https://github.com/brython-dev/brython/issues "Brython GitHub Issues").

Theres a [Brython Community on Google Plus](https://plus.google.com/communities/114694456237115550531).


Agile Development
=================

- [**Brython KanBan of Tickets**](https://waffle.io/brython-dev/brython "Agile Development Kanban") *Whats Brython Team working on ?*

- **Throughput Graph:** *Statistics about our work...*

[![Throughput Graph](https://graphs.waffle.io/brython-dev/brython/throughput.svg)](https://waffle.io/brython-dev/brython/metrics)
