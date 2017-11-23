Création d'un document
----------------------

Brython est fait pour programmer des applications web, donc des pages HTML
avec lesquelles l'utilisateur peut interagir.

Une page est constituée d'élements (textes, images, sons...) qu'on peut
intégrer de deux façons différentes :

- écrire du code HTML avec des balises, par exemple

<blockquote>
```xml
<html>
<body>
<b>Brython</b> est une implémentation de <a href="http://www.python.org">Python</a>
pour les navigateurs web
</body>
</html>
```
</blockquote>

- ou écrire du code Python, en utilisant le module intégré **browser.html**
  (décrit dans la section Librairies)

<blockquote>
```xml
<html>
<body>
<script type="text/python">
from browser import document
from browser.html import A, B

document <= (B("Brython") + "est une implémentation de " +
    A("Python", href="http://www.python.org") +
    " pour les navigateurs web")
</script>
</body>
</html>
```
</blockquote>