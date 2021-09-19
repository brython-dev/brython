Ce tutoriel vous explique comment développer une application qui s'exécute dans un navigateur en utilisant le langage Python. Nous prendrons comme exemple la construction d'une calculatrice.

Vous aurez besoin d'un éditeur de texte, et naturellement d'un navigateur avec un accès à Internet.

Le contenu de ce tutoriel suppose que vous avez une connaissance basique de HTML (structure générale d'une page, principales balises), des feuilles de style (CSS), et du langage Python.

Dans l'éditeur de texte, créez une page html avec le contenu suivant :

```xml
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython.min.js">
    </script>
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/brython@{implementation}/brython_stdlib.js">
    </script>
</head>

<body onload="brython()">

<script type="text/python">
from browser import document

document <= "Bonjour !"
</script>


</body>

</html>
```

Dans un répertoire vide, sauvegardez cette page sous le nom __`index.html`__. Pour lire cette page dans le navigateur, vous avez deux options:

- utiliser le menu Fichier/Ouvrir du navigateur : c'est la solution la plus rapide. Elle apporte [quelques limitations](/static_doc/fr/file_or_http.html) pour un usage avancé, mais pour ce tutoriel elle est parfaitement adaptée
- lancer un serveur web local : par exemple, si votre poste est équipé de la version de Python disponible sur python.org, exécuter `python -m http.server` dans le répertoire du fichier, puis entrer _localhost:8000/index.html_ dans la barre d'adresse du navigateur

En ouvrant la page, vous devriez voir le message "Bonjour !" s'afficher sur la page.

Structure d'une page
====================
Analysons le contenu de cette page. Dans la zone `<head>` nous chargeons le script __`brython.js`__ : c'est le moteur Brython, c'est-à-dire le programme qui va permettre d'exécuter les scripts Python qui se trouvent sur la page. Dans cet exemple nous allons le chercher sur un CDN, pour ne rien avoir à installer sur le PC. Notez le numéro de version (`brython@{implementation}`) : à chaque nouvelle version de Brython vous pourrez mettre à jour cette partie de l'adresse.

La balise `<body>` possède un attribut `onload="brython()"`. Ceci indique au navigateur qu'une fois la page complètement chargée, il faut appeler la fonction `brython()`; celle-ci est définie par le moteur Brython chargé dans la page. Elle recherche dans la page tous les scripts qui ont le type `type="text/python"` et les exécute.

Notre page __`index.html`__ comporte ce script:

```python
from browser import document

document <= "Bonjour !"
```

Il s'agit d'une syntaxe Python classique, avec l'import d'un module, __`browser`__ (en l'occurrence, un module livré par le moteur Brython en intégré dans le script __`brython.js`__). Ce module possède un attribut `document` qui représente le contenu qui s'affiche dans le navigateur.

Pour ajouter un texte au document - concrètement, pour afficher un texte dans le navigateur - la syntaxe utilisée par Brython est

```python
document <= "Bonjour !"
```

Il faut interpréter le signe `<=` comme une flèche vers la gauche : le document "reçoit" un nouvel élément, ici le texte "Bonjour !". Nous verrons plus loin qu'il est toujours possible d'utiliser la syntaxe normalisée pour interagir avec la page, mais Brython introduit quelques raccourcis pour rendre le code plus simple.

Dans ce cas particulier, ceux qui ne sont pas à l'aise avec l'opérateur `<=` peuvent utiliser la méthode `attach()` des éléments DOM à la place:

```python
document.attach("Bonjour !")
```

Mise en forme avec les balises HTML
===================================
Les balises HTML permettent d'enrichir le texte, par exemple de le mettre en gras (balise `<B>`), en italique (`<I>`), etc.

Avec Brython, ces balises sont disponibles sous forme de fonctions définies dans le module __`html`__ du package __`browser`__. Voici comment l'utiliser:

```python
from browser import document, html

document <= html.B("Bonjour !")
```

Les balises peuvent être imbriquées:

```python
document <= html.B(html.I("Bonjour !"))
```

On peut aussi ajouter des balises les unes aux autres, ainsi que des chaines de caractères:

```python
document <= html.B("Bonjour, ") + "tout le monde"
```

Le premier argument d'une fonction balise peut être une chaine de caractères, un nombre, une autre balise. Il peut aussi s'agir d'un "itérable" Python (une liste, une compréhension, un générateur) : dans ce cas, tous les éléments qui sont produits dans l'itération sont ajoutés à la balise:

```python
document <= html.UL(html.LI(i) for i in range(5))
```

Les attributs d'une balise sont passés sous forme d'arguments mots-clés de la fonction correspondante:

```python
html.A("Brython", href="http://brython.info")
```

Dessin de la calculatrice
=========================
Nous pouvons dessiner notre calculatrice sous forme d'une table HTML.

La première ligne est constituée de la zone de résultats, suivi d'un bouton de remise à zéro. Les trois lignes suivantes sont les touches de la calculatrice, chiffres et opérations.

```python
from browser import document, html

calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C", id="clear"))
lines = ["789/",
         "456*",
         "123-",
         "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc
```

Notez l'utilisation de générateurs Python pour réduire la taille du code, tout en le maintenant lisible.

Pour que le rendu soit plus lisible, il vaut mieux donner un style aux balises `<TD>`, en ajoutant par exemple ceci dans la zone `<HEAD>` de notre page HTML:

```xml
<style>
*{
    font-family: sans-serif;
    font-weight: normal;
    font-size: 1.1em;
}
td{
    background-color: #ccc;
    padding: 10px 30px 10px 30px;
    border-radius: 0.2em;
    text-align: center;
    cursor: default;
}
#result{
    border-color: #000;
    border-width: 1px;
    border-style: solid;
    padding: 10px 30px 10px 30px;
    text-align: right;
}
</style>
```

Gestion des événements
======================
La prochaine étape est de déclencher une action quand l'utilisateur appuie sur les touches de la calculatrice:

- pour les chiffres et les opérations : afficher le chiffre ou l'opération dans la zone de résultat
- pour le signe = : exécuter l'opération et afficher le résultat
- pour la lettre C : remise à zéro

Pour gérer les différents éléments qu'il a affichés, le programme doit d'abord les référencer. Les différents boutons ont été créés sous la forme de balises `<TD>`; pour obtenir une référence à l'ensemble de ces balises, la syntaxe est

```python
document.select("td")
```

L'argument passé à la méthode `select()` est un _sélecteur CSS_. Les plus courants sont : un nom de balise ("td"), l'attribut `id` de l'élément ("#result"), l'attribut "class" de la balise (".classname"). Le résultat de `select()` est toujours une liste d'éléments.

Les événements qui se produisent sur les éléments d'une page ont un nom normalisé : quand on clique sur un bouton, l'événement appelé "click" est déclenché. Dans le programme, cet événement va provoquer l'exécution d'une fonction. L'association entre élément, événement et fonction est réalisée par la syntaxe

```python
element.bind("click", action)
```

Pour la calculatrice, nous pouvons associer la même fonction à l'événement "click" sur tous les boutons par:

```python
for button in document.select("td"):
    button.bind("click", action)
```

Pour respecter la syntaxe Python, la fonction `action()` doit avoir été définie plus haut dans le programme. Elle prend un seul paramètre, un objet qui représente l'événement.

Le programme complet
====================
Voici le code permettant de gérer une version minimum de la calculatrice. L'essentiel est dans la fonction `action(event)`.

```python
from browser import document, html

# Construction de la calculatrice
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3) +
                html.TD("C"))
lines = ["789/", "456*", "123-", "0.=+"]

calc <= (html.TR(html.TD(x) for x in line) for line in lines)

document <= calc

result = document["result"] # accès direct à un élément par son id

def action(event):
    """Gère l'événement "click" sur un bouton de la calculatrice."""
    # L'élément sur lequel l'utilisateur a cliqué est l'attribut "target" de
    # l'objet event
    element = event.target
    # Le texte affiché sur le bouton est l'attribut "text" de l'élément
    value = element.text
    if value not in "=C":
        # mise à jour du contenu de la zone "result"
        if result.text in ["0", "erreur"]:
            result.text = value
        else:
            result.text = result.text + value
    elif value == "C":
        # remise à zéro
        result.text = "0"
    elif value == "=":
        # exécution de la formule saisie
        try:
            x = eval(result.text)
            result.text = x
        except:
            result.text = "erreur"

# Associe la fonction action() à l'événement "click" sur tous les boutons
# de la page.
for button in document.select("td"):
    button.bind("click", action)
```

Résultat
========
<iframe width="800", height="400" src="/gallery/calculator.html"></iframe>