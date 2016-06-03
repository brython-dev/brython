Environnement de développement
------------------------------

Les développeurs peuvent utiliser l'environnement disponible en  
[téléchargement](https://github.com/brython-dev/brython/releases) : choisir 
le fichier zip qui commence par "Brython\_site\_mirror" et le décompacter 
dans un répertoire (appelé le répertoire Brython dans les paragraphes qui 
suivent)
.
Il faut un serveur web pour tester les scripts localement dans la phase de 
développement. Tout serveur qui peut accéder aux fichiers avec le répertoire 
Brython comme racine convient ; vous pouvez utiliser le serveur web intégré à
la distribution : ouvrez une fenêtre de console, allez dans le répertoire et 
exécutez `python server.py`. Ceci lancera le serveur sur le port 8000 et
créera la version statique de la documentation si elle n'est pas déjà
présente. Les options pour le script *server.py* sont:

* `--port <int>`: pour choisir un autre numéro de port que 8000.
* `--no-docs`: en phase de test il est parfois inutile de générer la
documentation statique (ce qui prend un certain temps). Pour ne pas la générer
vous pouvez faire `python server.py --no-docs`. ATTENTION: dans ce cas
la documentation ne sera pas disponible sur le serveur local.

Une fois que le serveur est lancé, pointez votre navigateur web sur 
_http://localhost:8000_ : vous devriez voir la même page que la page 
d'accueil du [site Brython](http://www.brython.info).

Créez un nouveau répertoire (par exemple "test") dans le répertoire Brython. 
Avez un éditeur de texte, créez un fichier appelé _index.html_ contenant le 
texte ci-dessous, et sauvegardez-le dans le répertoire _test_.

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
        alert("Salut %s !" %doc["zone"].value)
    
    doc["echo"].bind('click', echo)
    </script>
    <p>Vous vous appelez : <input id="zone"><button id="echo">click !</button>
    </body>
    </html>


Pointez le navigateur sur _http://localhost:8000/test/index.html_ : bingo ! 
vous avez écrit votre premier script Brython.

Utilisez cet environnement pour le test et le développement. Faites simplement 
attention à donner le bon chemin pour le script _brython.js_ relativement au 
répertoire dans lequel se trouve la page HTML qui l'appelle.


