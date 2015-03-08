Development environment
-----------------------

Developers should use the environment available for [download](https://github.com/brython-dev/brython/releases) : choose the zip file starting with "Brython\_site\_mirror" and unzip it in a directory (we call it the Brython directory in the next paragraphs)

A web server is necessary to test the scripts locally while developing. Any web server that can serve files with the Brython directory as document root is ok ; you can use the built-in web server provided in the distribution : open a console window, go to the directory, and run `python server.py`. This will start the server on port 8000 (edit _server.py_ to change the port number)

Once the server is started, point your web browser to _http://localhost:8000/site_ : you should see the same page as the [Brython site homepage](http://www.brython.info)

Create a new directory (eg "test") in the Brython directory. With a text editor, create a file called _index.html_ with the content below and save it in the directory _test_

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


Point the browser to _http://localhost:8000/test/index.html_ : bingo ! you have written your first Brython script

Use this environment for testing and developing. Just remember to point the script _brython.js_ to the right location relatively to the directory where the HTML page stands

