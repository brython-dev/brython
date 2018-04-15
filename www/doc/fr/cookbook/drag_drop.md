Problème
--------
Glisser et déposer un élément sur la page web


Solution
--------

Brython implémente une API basée sur la spécification du HTML5 pour le
glisser-déposer. Dans la forme basique présentée dans cet exemple, elle
consiste à définir des fonctions de rappel pour 3 événements :

- _dragstart_ sur l'élément déplaçable (quand l'utilisateur commence à le
  faire glisser)
- _dragover_ sur la zone de destination (quand l'objet déplacé se positionne
  dessus)
- _drop_ sur la zone de destination (quand l'utilisateur relâche le bouton de
  la souris)

Pour attacher une fonction _rappel_ à un _evenement_ sur un _element_, on
utilise la méthode _element_<code>.bind(_evenement,rappel_)</code>

Les fonctions de rappel prennent un seul argument, une instance de `DOMEvent`.
Pour communiquer des informations pendant l'opération de glisser-déposer,
cette instance possède un attribut _data_ qui reçoit une valeur dans la
fonction de rappel associée à _dragstart_ ; cette valeur est exploitée par la
fonction de rappel associée à _drop_ pour identifier l'élement qui est en
train d'être déposé.

Dans l'exemple, quand l'objet déplaçable a été déposé, on ne peut plus le
déplacer ; pour cela, nous supprimons les fonctions associées à un _evenement_
sur cet objet par la méthode _element_<code>.unbind(_evenement_)</code>

<div style="width:400px;height:150px;background-color:yellow" id="panel">
<div id="dest" style="position:absolute;width:180px;height:80px;background-color:green;color:white;">
zone de destination
</div>
<div id="source" style="position:absolute;width:80px;height:40px;background-color:red;">
objet déplaçable
</div>
</div>

<p>
```exec_on_load
from browser import document

panel = document["panel"] # zone jaune

source = document["source"] # zone rouge
# on la place à (10, 10) du bord supérieur gauche du panel
source.style.top = "{}px".format(10 + panel.abs_top)
source.style.left = "{}px".format(10 + panel.abs_left)
# rend la zone rouge déplaçable
source.draggable = True

dest = document["dest"] # zone verte
# on la place à (10, 150) du bord supérieur gauche du panel
dest.style.top = "{}px".format(10 + panel.abs_top)
dest.style.left = "{}px".format(150 + panel.abs_left)

# coordonnées de la souris relativement au bord supérieur gauche de l'objet
# déplacé quand le glissement commence
m0 = [None, None]

def mouseover(ev):
    """Quand la souris passe sur l'objet déplaçable, changer le curseur."""
    print("voilà la souris !")
    ev.target.style.cursor = "pointer"

source.bind("mouseover", mouseover)

def dragstart(ev):
    """Fonction appelée quand l'utilisateur commence à déplacer l'objet."""
    global m0
    # calcul des coordonnées de la souris
    # ev.x et ev.y sont les coordonnées de la souris quand l'événement est déclenché
    # ev.target est l'objet déplacé. Ses attributs "left" et "top" sont des entiers,
    # la distance par rapport aux bords gauche et supérieur du document
    m0 = [ev.x - ev.target.left, ev.y - ev.target.top]
    # associer une donnée au processus de glissement
    ev.dataTransfer.setData("text", ev.target.id)
    # permet à l'object d'être déplacé dans l'objet destination
    ev.dataTransfer.effectAllowed = "move"

source.bind("dragstart", dragstart)

def dragover(ev):
    """Fonction appelée quand l'objet déplaçable vient au-dessus de la zone de
    destination.
    """
    ev.dataTransfer.dropEffect = "move"
    # il faut désactiver le comportement par défaut pour ce genre d'événement
    ev.preventDefault()

dest.bind("dragover", dragover)

def drop(ev):
    """Fonction attachée à la zone de destination.
    Elle définit ce qui se passe quand l'objet est déposé, c'est-à-dire
    quand l'utilisateur relâche la souris alors que l'objet est au-dessus de
    la zone.
    """
    # récupère les données stockées dans drag_start (l'id de l'objet déplacé)
    src_id = ev.dataTransfer.getData("text")
    elt = document[src_id]
    # définit les nouvelles coordonnées de l'objet déplacé
    elt.style.left = "{}px".format(ev.x - m0[0])
    elt.style.top = "{}px".format(ev.y - m0[1])
    # ne plus déplacer l'objet
    elt.draggable = False
    # enlever la fonction associée à mouseover
    elt.unbind("mouseover")
    elt.style.cursor = "auto"
    ev.preventDefault()

dest.bind("drop", drop)
```
