Problème
--------

Afficher "Salut !" dans le navigateur


Solution
--------

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    from browser import document as doc
    doc <= "Salut !"
    </script>
    
    </body>
    </html>

**browser**.`document` représente le document (le contenu de la page web). Il prend en charge l'opération `<=` qui signifie "ajouter contenu". Ici le contenu est une simple chaine de caractères Python
