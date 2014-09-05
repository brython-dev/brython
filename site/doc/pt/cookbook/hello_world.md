Problema
--------

Fazer o navegador mostrar "Olá mundo !"


Solução
-------

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    from browser import doc
    doc <= "Olá mundo !"
    </script>
    
    </body>
    </html>

`doc` é um objeto definido no módulo **browser** que representa o
documento (o conteúdo da página web). Ela suporta a operação `<=`
significando "adicionar conteúdo". Aqui o conteúdo é uma simples
cadeia de caractéres de Python.
