Problem
-------

Make the browser display "Hello world !"


Solution
--------

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    from browser import document as doc
    doc <= "Hello world !"
    </script>
    
    </body>
    </html>

`doc` is a word defined in module **browser** that represents the document (the content of the web page). It supports the operation `<=` meaning "add content". Here the content is a simple Python string
