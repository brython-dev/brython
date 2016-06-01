Development environment
-----------------------

Developers should use the environment available for 
[download](https://github.com/brython-dev/brython/releases) : choose the zip 
file starting with "BrythonX.Y.Z\_site\_mirror" where X.Y.Z is the 
version number and unzip it in a directory (we refer to this directory as brython_directory in the next paragraphs).

A web server is necessary to test the scripts locally while developing. Any web 
server that can serve files with the brython_directory/www as document root will 
work ; you can use the built-in web server provided in the distribution : open 
a console window, go to the directory, and run `python server.py`. This will 
start the server on port 8000 and it will create the 
*static_doc* folder. Options for the *server.py* script:

* `--port <int>`: if you want to use a different port number you can use
`python server.py --port 8001` to use port 8001).
* `--no-docs`: when you are testing stuff sometimes it is no necessary to create
the *static_doc* folder. If you want to avoid this step you can do 
`python server.py --no-docs`. WARNING: If you use this option then the docs will
not be available in your localhost.

Once the server is started, point your web browser to _http://localhost:8000/_ 
(or http://localhost:<port> if you used the option 
`python server.py --port <port>`):
the same page as the [Brython site homepage](http://www.brython.info) should
appear.

Create a new directory (eg "whatever") in _brython\_directory/www_. With a text 
editor, create a file called _index.html_ with the content below and save it in 
the directory _brython\_directory/www/whatever/index.html_:

    <html>
    <head>
    <meta charset="iso-8859-1">
    <script src="../src/brython.js"></script>
    </head>
    <body onLoad="brython()">
    <script type="text/python">
    from browser import document as doc
    from browser import alert
    
    def echo(ev):
        alert("Hello %s !" %doc["zone"].value)
    
    doc["echo"].bind('click', echo)
    </script>
    <p>Your name is : <input id="zone"><button id="echo">click !</button>
    </body>
    </html>


Point the browser to _http://localhost:8000/whatever/index.html_ : bingo, you have 
written your first Brython script!!

Use this environment for testing and developing. Just remember to point the 
script _brython.js_ to the right location relatively to the directory where the 
HTML page stands.

