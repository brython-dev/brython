Citation de la [spécification du Document Object Model](http://www.w3.org/DOM/)
du W3C :

> _Qu'est-ce que le Document Object Model?_

> _Le Document Object Model est une interface indépendante d'une plateforme_
> _ __ou d'un langage__ qui permet aux programmes et aux scripts d'accéder_
> _dynamiquement au contenu, à la structure et au style des documents, et de_
> _les mettre à jour_

L'objectif de Brython est d'utiliser Python comme langage de script pour les
navigateurs web, à la place de Javascript

Un exemple simple :
<table>
<tr>
<td>

```xml
<html>
<head>
<script src="/brython.js"></script>
</head>
<body onload="brython()">
<script type="text/python">
from browser import document, alert

# associe une fonction à l'événement "click" sur le bouton

def click(ev):
    alert(document["zone"].value)

document["echo"].bind("click")
</script>
<input id="zone">
<button id="echo">click !</button>
</body>
</html>
```

</td>
<td style="padding-left:20px">

essayez :<p>
<script type="text/python">
from browser import document, alert

# bind event 'click' on button to function click
def click(ev):
    alert(document["zone"].value)

document["echo"].bind("click", click)
</script>

<input id="zone" autocomplete="off">
<button id="echo">clic !</button>
</td>
</tr>
</table>

Pour faire fonctionner les scripts Python, il suffit d'importer le script
_brython.js_, et d'exécuter la fonction `brython()` quand la page est chargée
(attribut _onload_ de la balise `<BODY>`). En phase de développement, on peut
passer un argument à cette fonction : 1 pour avoir les messages d'erreur dans
la console du navigateur, 2 pour avoir en plus le code Javascript généré.

Si le programme Python est volumineux, une autre possibilité est de l'écrire
dans un fichier séparé, et de le charger dans la page en utilisant l'attribut
_src_ de la balise `<script>` :

<table><tr><td>

```xml
<html>
<head>
<script src="/brython.js"></script>
</head>
<body onload="brython()">
<script type="text/python" src="test.py"></script>
<input id="zone"><button onclick="echo()">clic !</button>
</body>
</html>
```

</td></tr></table>

Attention, dans ce deuxième cas le script Python est récupéré par un appel
Ajax : il doit donc se trouver dans le même domaine que la page HTML.

Quand on clique sur le bouton, la fonction `echo()` définie dans le script
Python est exécutée. Cette fonction récupère la valeur de l'élément INPUT
par son id _zone_, en utilisant la syntaxe `document["zone"]` : `document`
est un attribut du module intégré **browser**, il se comporte comme un
dictionnaire indexé par les id des éléments DOM. `document["zone"]` est un
objet correspondant à l'élément INPUT ; on accède à la  valeur par
l'attribut _value_.

L'affichage est réalisé par la fonction `alert()` définie dans le même module
**browser**, qui affiche une fenêtre avec le texte passé en paramètre.
