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