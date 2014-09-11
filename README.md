brython
=======

Brython (Browser Python) is an implementation of Python 3 running in the browser

Here is a simple example of an HTML page running Python :

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

To use Brython, all there is to do is 

1. load the script brython.js
2. run the function brython() on page load
3. write Python code inside tags `<script type="text/python">`

Getting started
===============
In the Releases section, load the latest version of the Brython site mirror, unzip it and start the built-in web server `server.py`. Point your browser to _http://localhost:8000_ and click on "site" : you access to a clone of the [Brython site](http://brython.info) with an online editor, a console similar to the CPython interpreter, a gallery with many examples and a comprehensive documentation

Once you are familiar with the examples, create a new folder "app" at the same level as "site" and create a file "index.html" with the code above. Point the browser to _http://localhost:8000/app_ to see the result

