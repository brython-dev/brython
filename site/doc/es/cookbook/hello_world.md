Problema
-------

Hacer que el navegador muestre "Hola mundo !"


Solución
--------

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    from browser import document as doc
    doc <= "Hola mundo !"
    </script>
    
    </body>
    </html>

`document` es una palabra clave definida en el módulo **browser** que representa el documento (el documento de una página web). Hace uso de la operación `<=` que significa "añadir contenido". En este caso, el contenido es una simple cadena Python
