Creando un documento
--------------------

Brython existe para poder programar aplicaciones web,es decir, páginas HTML en las que el usuario puede interactuar

Una página web está hecha de elementos (textos, imágenes, sonidos,...) que pueden ser incluidos en la página de dos formas :

- escribiendo código HTML con etiquetas, por ejemplo

>    <html>
>    <body>
>    <b>Brython</b> es una implementación de <a href="http://www.python.org">Python</a> 
>    para los navegadores
>    </body>
>    </html>

- o escribiendo código Python, usando el módulo integrado `browser.html` (descrito en la sección de Librerías)

>    <html>
>    <body>
>    <script type="text/python">
>    from browser import document
>    from browser.html import A,B

>    document <= B("Brython")+"es una implementación de "
>    document <= A("Python",href="http://www.python.org")+" para los navegadores"
>    </script>
>    </body>
>    </html>

