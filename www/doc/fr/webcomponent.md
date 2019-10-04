Le module **browser.webcomponent** permet de créer des balises HTML
personnalisées, en utilisant la technologie DOM standard [WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

Un élément personnalisé est utilisé dans une page HTML sous la forme

```xml
<popup-window>Coucou !</popup-window>
```

Le module expose les fonctions suivantes

`define(`_nom_balise, classe_composant_`)`

> _nom_balise_ est le nom de la balise personnalisée. La spécification
> Web Component impose que ce nom inclue un tiret (le caractère "`-`").
>
> _classe_composant_ est la classe qui définit le comportement du composant.
> Sa méthode `__init__` est appelée pour créer le composant; le paramètre
> `self` référence l'élément DOM pour le composant personnalisé.

`get(`_nom_balise_`)`

> renvoie la classe associée à _nom_balise_, ou `None`.

### Exemple

Supposons que nous voulions définir une balise personnalisée `<bold-italic>`
qui possède un attribut "`data-val`":

```
<bold-italic data-val="salut"></bold_italic>
```

Ce qui se produit quand la balise apparait dans le document HTML est défini
par la méthode `__init__` de la classe `BoldItalic` qui gère cette balise.

```python
from browser import webcomponent

class BoldItalic:

    def __init__(self):
        # Create a shadow root
        shadow = self.attachShadow({'mode': 'open'})

        # Insert the value of attribute "data-val" in bold italic
        # in the shadow root
        shadow <= html.B(html.I(self.attrs['data-val']))

# Indique au navigateur de gérer la balise <bold-italic> avec la classe
# BoldItalic
webcomponent.define("bold-italic", BoldItalic)
```

Notez l'utilisation d'une autre technologie DOM, [ShadowRoot](https://developer.mozilla.org/fr/docs/Web/API/ShadowRoot),
pour définir un sous-arbre du DOM, différent de l'arbre principal.

### Gestion du cycle de vie

La technologie Web Component definit un ensemble de [fonctions de rappel](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)
qui gèrent le cycle de vie d'un composant personnalisé.

Pour les implémenter en Brython, il suffit d'ajouter ces fonctions dans la
définition de la classe:

```python

import browser.webcomponent

class BoldItalic:

    def __init__(self):
        # Create a shadow root
        shadow = self.attachShadow({'mode': 'open'})

        # Insert the value of attribute "data-val" in bold italic
        # in the shadow root
        shadow <= html.B(html.I(self.attrs['data-val']))

    def connectedCallback(self):
        print("connected callback", self)

webcomponent.define("bold-italic", BoldItalic)
```
