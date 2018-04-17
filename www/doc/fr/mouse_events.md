Evénements souris
=================

Les événements relatifs à la souris (mouvement, appui sur un bouton) sont

<table cellpadding=3 border=1>
<tr>
<td>*mouseenter*</td>
<td>la souris entre dans la zone couverte par l'élément, ou un de ses descendants</td>
</tr>
<tr><td>*mouseleave*</td><td>la souris sort de la zone couverte par l'élément et par ses descendants</td></tr>

<tr><td>*mouseover*</td><td>la souris entre dans la zone couverte par l'élément</td></tr>
<tr><td>*mouseout*</td><td>la souris quitte la zone couverte par l'élément</td></tr>

<tr><td>*mousemove*</td><td>la souris se déplace sur l'élément</td></tr>

<tr><td>*mousedown*</td><td>appui sur le bouton gauche de la souris</td></tr>
<tr><td>*mouseup*</td><td>relâchement du bouton gauche de la souris</td></tr>

<tr><td>*click*</td><td>clic : appui puis relâchement du bouton gauche de la souris</td></tr>
<tr><td>*dblclick*</td><td>double clic</td></tr>

</table>

Exemples
--------

*mouseenter* et *mouseleave*

> ces événements sont déclenchés quand la souris entre ou sort d'un élément. Si
> un élément en englobe d'autres, l'événement est déclenché à chaque fois que
> la souris entre ou sort d'un élément fils.

<table>
<tr>
<td>
<div id="jaune1" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">extérieur<p>
<div id="bleu1" style="background-color:blue;color:white;padding:20px;">intérieur</div>
</td>
<td><div id="trace1">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
```exec_on_load
from browser import document

def mouseenter(ev):
    document["trace1"].text = f'entrée dans {ev.currentTarget.id}'

def mouseleave(ev):
    document["trace1"].text = f'sortie de {ev.currentTarget.id}'

for elt_id in ("jaune1", "bleu1"):
    document[elt_id].bind('mouseenter', mouseenter)
    document[elt_id].bind('mouseleave', mouseleave)
```
</blockquote>
</td>
</tr>
</table>

*mouseover* et *mouseout*

> la différence avec *mouseenter* et *mouseleave* est qu'une fois que la
> souris est entrée dans un élément, l'événement n'est pas déclenché sur
> les éléments fils

<table>
<tr>
<td>
<div id="jaune2" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">extérieur<p>
<div id="bleu2" style="background-color:blue;color:white;padding:20px;">intérieur</div>
</td>
<td>
<div id="trace2">&nbsp;</div>
</td>
</tr>
<tr>
<td colspan=2>
<blockquote>

```exec_on_load
from browser import document

def mouseover(ev):
    document["trace2"].text = f'entrée dans {ev.currentTarget.id}'

def mouseout(ev):
    document["trace2"].text = f'sortie de {ev.currentTarget.id}'

for elt_id in ["jaune2", "bleu2"]:
    document[elt_id].bind('mouseover', mouseover)
    document[elt_id].bind('mouseout', mouseout)
```

</blockquote>
</td>
</tr>
</table>


*mousemove*

<table>
<tr><td>
<div id="vert" style="padding:5px;background-color:#8F8;width:150px;">déplacer la souris</div>
</td>
<td><div id="trace3">&nbsp;</div></td>
</tr>
</table>

```exec_on_load
from browser import document

def mousemove(ev):
    document["trace3"].text = f"coordonnées : {ev.x}, {ev.y}"

document["vert"].bind("mousemove", mousemove)
```

Attributs de l'objet `DOMEvent`
-------------------------------

Pour les événements souris, l'instance de `DOMEvent` possède les attributs suivants

<table cellpadding=3 border=1>
<tr><td>*button*</td><td>le numéro du bouton sur lequel on a appuyé</td></tr>
<tr><td>*buttons*</td><td>indique sur quels boutons de la souris on a appuyé pour déclencher l'événement.

Chaque bouton sur lequel on peut appuyer est représenté par un entier donné (1  : bouton gauche, 2  : bouton droit, 4  : roue). Si on appuie sur plus d'un bouton, la valeur de `buttons` est combinée pour produire un nouveau nombre. Par exemple, si on appuie sur le bouton droit (2) et sur la roue (4), la valeur est égale à 2|4, soit 6</td></tr>

<tr><td>*x*</td><td>la position de la souris par rapport au bord gauche de la fenêtre (en pixels)</td></tr>
<tr><td>*y*</td><td>la position de la souris par rapport au bord haut de la fenêtre (en pixels)</td></tr>

<tr><td>*clientX*</td><td>la position de la souris par rapport au bord gauche de l'élément dans lequel la souris se trouve au moment du clic (en pixels)</td></tr>
<tr><td>*clientY*</td><td>la position de la souris par rapport au bord haut de l'élément dans lequel la souris se trouve au moment du clic (en pixels)</td></tr>

<tr><td>*screenX*</td><td>comme *x*</td></tr>
<tr><td>*screenY*</td><td>comme *y*</td></tr>

</table>

