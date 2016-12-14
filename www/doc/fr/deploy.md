Déployer une application Brython
--------------------------------

Votre application peut être déployée en transférant l'ensemble du répertoire
sur un serveur.

Vous pouvez également générer un fichier __brython_modules.js__ en suivant les
indications la page [import](import.html), et ne déployer que :

- la page HTML de l'application
- les éventuels scripts Python insérés dans la page par

    <script type="text/python" src="..."><./script>
- les fichiers __brython.js__ et __brython_modules.js__
- les éventuels autres fichiers utilisés par l'application (images, fichiers
  son ou texte, feuilles de style, etc.)
