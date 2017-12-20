Accéder aux éléments de la page
-------------------------------

Pour accéder à un élément, on peut utiliser plusieurs méthodes. La plus
courante est de se servir de son identifiant, c'est-à-dire de son attribut
_id_ : si on a une zone de saisie définie par

```xml
<input id="data">
```

on peut obtenir une référence à ce champ par

```python
from browser import document
data = document["data"]
```

L'objet `document` du module **browser** référence le document HTML. Il se
comporte comme un dictionnaire dont les clés sont les identifiants des
éléments de la page. Si aucun élément ne possède l'identifiant spécifié, le
programme déclenche une exception `KeyError`.

Tous les éléments de la page possèdent une méthode `get()` qui permet
de rechercher des éléments de plusieurs façons :

- `elt.get(name=N)` retourne une liste avec tous les éléments descendant de
  `elt` dont l'attribut `name` est égal à `N`
- `elt.get(selector=S)` retourne une liste avec tous les élements descendant
  de `elt` dont le sélecteur CSS correspond à `S`

`elt.select(S)` est équivalent à `elt.get(selector=S)`.

Quelques exemples :

```python
document.select('.foo')       # éléments avec la classe "foo"
document.select('form')       # liste des balises "<form>"
document.select('H1.bar')     # balises H1 avec la classe "bar"
document.select('#container') # liste avec l'élément dont l'id vaut "container", 
                              # similaire à [document["container"]]
document.select('a[title]')   # balises A avec un attribut "title"
```
