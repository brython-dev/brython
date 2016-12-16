Pour installer Brython :

- si votre PC peut utiliser CPython et pip, installez le package `brython` par

```
    pip install brython
```

> puis dans un répertoire vide, exécutez

```
    python -m brython --install
```

- si vous ne pouvez pas utiliser cette méthode, aller sur la [page des publications]
(https://github.com/brython-dev/brython/releases) sur Github, sélectionnez la
 dernière version, téléchargez et dézippez le fichier __Brython-x.y.z.zip__.

Dans les deux cas vous disposez des fichiers suivants :

- __brython.js__ : le moteur Brython, à inclure dans la page HTML
- __brython_stdlib.js__ : regroupe tous les fichiers de la distribution Python
  standard supportés par Brython
- __demo.html__ : une page qui donne quelques exemples d'utilisation de Brython

__brython.js__ contient quelques modules très utilisés : `browser, browser.html, `
`javascript`.

Si votre application utilise des modules de la distribution standard, il faut
inclure __brython_stdlib.js__ en plus de __brython.js__:

```
<script type="text/javascript" src="brython.js"></script>
<script type="text/javascript" src="brython_stdlib.js"></script>
```
