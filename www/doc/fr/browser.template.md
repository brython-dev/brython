module **browser.template**
---------------------------

Le module **template** permet de générer dynamiquement certains éléments
d'une page HTML, en y intégrant des blocs de code ou des expressions en
Python.

## Variables

Dans sa forme la plus simple, un élément inclut un nom de variable entouré
d'accolades:

```xml
<span id="team">{name}</span>
```

Pour remplacer le contenu de cette balise `span`, on ajoute à la page le
script

```python
from browser import document
from browser.template import Template

Template(document["team"]).render(name="Liverpool FC")
```

L'argument de `Template` peut être soit un élément, soit une chaine de
caractères ; dans le deuxième cas, il s'agit de l'attribut `id` de
l'élément, on peut donc écrire plus simplement

```python
Template("team").render(name="Liverpool FC")
```

Le moteur de rendu utilise les f-strings de Python ; si le texte contient des
accolades, il faut les doubler:

```xml
<span id="team">{name} - {{ceci est une accolade}}</span>
```

Les attributs d'une balise HTML peuvent également être des variables:

```xml
<a id="link" href="{url}">{name}</a>
```
```python
from browser import document
from browser.template import Template

Template("link").render(url="brython.info", name="Brython site")
```

Au lieu d'une variable simple, on peut mettre une expression:

```xml
<span id="tag-uppercase">{tag.upper()}</span>
```

Pour les attributs qui doivent être rendus sans valeur associée (par exemple
l'attribut `selected` d'une balise `OPTION`), la variable ou le résultat de
l'expression doit être un booléen:
```xml
<option selected="{name==expected}">
```

## Blocs de code

L'attribut spécial `b-code` permet de définir un bloc de code : une boucle
`for` ou une condition (`if`, `elif`, `else`).

```xml
<ul id="team-list">
    <li b-code="for team in teams:">{team}
</ul>
```
```python
teams = ["FC Barcelona", "Real Madrid CF", "Liverpool FC"]
Template("team-list").render(teams=teams)
```

Les blocs de code peuvent être imbriqués. Par exemple le code suivant génère
une ligne dans un tableau, dans laquelle seules les cellules de rang pair
prennent un contenu:

```xml
<tr>
  <td b-code="for i in range(16):">
    <span b-code="if i % 2 == 0:">
      {1 + (i / 2)}
    </span>
  </td>
</tr>
```

## Inclusion d'autres templates

Si un site contient plusieurs pages et qu'on veut mettre en commun certains
éléments comme le menu, on peut mettre une partie de la page dans un
template secondaire, et on l'inclut dans la page principale par l'attribut
`b-include`.

Par example on peut définir le template __menu.html__:

```xml
<img src="logo.png"><h2>{title}</h2>
```

et l'inclure dans la page principale:

```xml
<div id="menu" b-include="menu.html"></div>
```

Le template inclus dans la page sera rendu avec les arguments passés
au template dans la page principale:

```python
Template("menu").render(title="Page d'accueil")
```

## Gestion d'événements

On peut définir des fonctions de gestion d'événements qui vont agir sur un
élément. Pour cela:

- la liste des fonctions utilisées dans un élément doit être passée en
deuxième paramètre à la création de l'instance de `Template`
- l'attribut spécial `b-on` décrit les événements gérés sur l'élément HTML

Par exemple, pour gérer l'événement "click" sur un bouton:

```xml
<button id="hello" b-on="click:say_hello">Hello !</button>
```

Code Python:

```python
def say_hello(event, element):
    alert("Hello world")

Template("hello", [say_hello]).render()
```

S'il y a plusieurs gestionnaires d'événements, ils sont séparés par `;`:

```xml
<button id="hello" b-on="click:say_hello;mouseover:show">Hello !</button>
```

Le gestionnaire d'événement est une fonction qui prend deux arguments,
`event` (l'object événement, intance de [DOMEvent](events.html)) et
`element`, l'instance de la classe `Template`.

La référence à `element` permet d'accéder dans la fonction de gestion aux
données associées à l'élément (celles passées à la méthode `render()`). Ces
données sont représentées par l'attribut `element.data` ; cet objet a comme
attributs les clés des arguments mots-clés passés à `render()`.

Ainsi, l'exemple ci-dessus peut être réécrit en passant le texte à afficher
comme argument de `render()`:

```python
def say_hello(event, element):
    alert(element.data.text)

Template("hello", [say_hello]).render(text="Hello, world !")
```

Quand une fonction de gestion est exécutée, si les données associées à
l'élément ont été modifiées par cette fonction, _l'élément est rendu à nouveau_
avec les nouvelles données.

Par exemple, pour incrémenter une valeur en appuyant sur un bouton:

```xml
<div id="incrementer">
  <button b-on="click:incr">+1</button>{counter}
</div>
```

Code Python:

```python
def incr(event, element):
    element.data.counter += 1

Template("incrementer", [incr]).render(counter=0)
```