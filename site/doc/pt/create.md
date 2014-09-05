Criando um documento
--------------------

Brython é feito para progrmar aplicações web, ou seja, páginas HTML
com as quais o usuário pode interagir.

Uma página é feita de elementos (textos, imagens, sons...) que podem
ser incluídos na página de dois modos diferentes :

- escrevendo HTML com etiquetas, por exemplo:

>    <html>
>    <body>
>    <b>Brython</b> é uma implementação de <a href="http://www.python.org">Python</a> 
>    para navegadores web
>    </body>
>    </html>

- ou escrevendo código Python usando o módulo integrado
  **browser.html**:

>    <html>
>    <body>
>    <script type="text/python">
>    from browser.html import A,B
>    doc <= B("Brython")+"é uma implementação de "
>    doc <= A("Python", href="http://www.python.org")+" para navegadores web"
>    </script>
>    </body>
>    </html>

