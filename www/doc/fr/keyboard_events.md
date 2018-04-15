Evénements clavier
==================

Les événements relatifs au clavier sont

<table cellpadding=3 border=1>
<tr>
<td>*input*</td>
<td>déclenché quand la valeur d'un élément &lt;input&gt; ou &lt;textarea&gt;
est modifié, ou quand le contenu d'un élément `contenteditable` est modifié
</td>
</tr>

<tr>
<td>*keydown*</td><td>appui sur une touche quelconque du clavier</td>
</tr>

<tr><td>*keypress*</td><td>appui sur une touche du clavier qui produit un
caractère. Par exemple, quand on entre Ctrl+C au clavier, l'événement
*keypress* n'est déclenché qu'au moment où on appuie sur C, alors que
*keydown* est déclenché dès l'appui sur Ctrl
</td>
</tr>

<tr><td>*keyup*</td><td>relâchement d'une touche enfoncée</td></tr>

</table>

Attributs de l'objet `DOMEvent`
-------------------------------

L'instance de `DOMEvent` possède les attributs suivants

<table border=1 cellpadding=5>

<tr>
<td>
`altKey`
> booléen, indique si la touche Alt (ou Option sur Mac) était enfoncée quand
> l'événement clavier a été déclenché

> Cet attribut n'est pas disponible pour l'événement *input*

> Il est normalement utilisé avec *keypress*, pour pouvoir tester si on a
> entré Alt+&lt;key&gt; ou seulement &lt;key&gt;
</td>
<td>
#### Exemple

Saisir du texte dans le champ ci-dessous, en appuyant ou pas sur la touche Alt

<p><input id="altKey" autocomplete="off">&nbsp;<span id="traceAltKey">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def altKey(ev):
    document["traceAltKey"].text = f"altKey : {ev.altKey}"

document["altKey"].bind("keypress", altKey)
```
</td>
</tr>

<td>
`charCode`
> Le numéro de référence Unicode pour la touche

> Cet attribut n'est utilisable que pour l'événement *keypress*

</td>
<td>
#### Example

Entrer du texte dans le champ ci-dessous. Notez qu'on lit le caractère par
`chr(ev.charCode)`

<input id="charCode" autocomplete="off"></input>
&nbsp;<span id="traceCharCode">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def keypress(ev):
    trace = document["traceCharCode"]
    char = chr(ev.charCode)
    trace.text = f"charCode : {ev.charCode}, character: {char}"

document["charCode"].bind("keypress", keypress)
```
</td>

<tr>
<td>
`ctrlKey`
> booléen, indique si la touche Ctrl était enfoncée quand l'événement
> clavier a été déclenché

> Cet attribut n'est pas disponible pour l'événement *input*

> Il est normalement utilisé avec *keypress*, pour pouvoir tester si on a
> entré Ctrl+&lt;key&gt; ou seulement &lt;key&gt;
</td>
<td>
#### Example

Saisir du texte dans le champ ci-dessous, en appuyant ou pas sur la touche Ctrl

<input id="ctrlKey" autocomplete="off"></input>
&nbsp;<span id="traceCtrlKey">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def keypress(ev):
    document["traceCtrlKey"].text = f"ctrlKey : {ev.ctrlKey}"
    ev.preventDefault()

document["ctrlKey"].bind("keypress", keypress)
```
Notez que `ev.preventDefault()` est appelé pour éviter le comportement par
défaut associé à certains raccourcis clavier qui utilisent la touche Ctrl.

</td>
</tr>

<tr>
<td>
`keyCode`
> un code numérique dépendant du système et de l'implémentation, caractérise
> la clé enfoncée

> cette valeur est la même que les touches Alt, Ctrl ou majuscules soient
> enfoncées ou non

> noter que le résultat n'est pas le même selon qu'on gère les événements
> *keydown*, *keyup* et *keypress*
</td>
<td>

#### Example

Saisissez du texte dans les champs de saisie ci-dessous. Notez que le
caractère peut être lu par `ch(ev.charCode)` avec l'événement *keypress*

avec *keydown* <input id="keyCodeKeydown" autocomplete="off">

<p>avec *keypress* <input id="keyCodeKeypress" autocomplete="off">
&nbsp<span id="traceKeyCode">&nbsp;</span>

<p>avec *keyup* <input id="keyCodeKeyup" autocomplete="off">

#### Code

```exec_on_load
from browser import document

def keyCode(ev):
    trace = document["traceKeyCode"]
    trace.text = f"event: {ev.type}, keyCode: {ev.keyCode}"
    ev.stopPropagation()

document["keyCodeKeydown"].bind("keydown", keyCode)
document["keyCodeKeypress"].bind("keypress", keyCode)
document["keyCodeKeyup"].bind("keyup", keyCode)
```
</td>
</tr>

<tr>
<td>
`shiftKey`
> booléen, indique si la touche Majuscule était enfoncée quand l'événement
> clavier a été déclenché

> Cet attribut n'est pas disponible pour l'événement *input*

> Il est normalement utilisé avec *keypress*, pour pouvoir tester si on a
> entré Shift+&lt;key&gt; ou seulement &lt;key&gt;
</td>
<td>
#### Example

Saisir du texte dans le champ ci-dessous, en appuyant ou pas sur la touche
Majuscule

<input id="shiftKey" value="saisie" autocomplete="off">
&nbsp;<span id="traceShiftKey">&nbsp;</span>

#### Code

```exec_on_load
from browser import document

def keypress(ev):
    document["traceShiftKey"].text = f'shiftKey : {ev.shiftKey}'

document["shiftKey"].bind("keypress", keypress)
```
</td>
</tr>

<tr>
<td>
`which`
> un code numérique dépendant du système et de l'implémentation, caractérise
> la clé enfoncée

> noter que le résultat n'est pas le même selon qu'on gère les événements
> *keydown*, *keyup* et *keypress*
</td>
<td>
#### Example

Saisir du texte dans les champs ci-dessous. Notez qu'on peut lire le caractère
par `chr(ev.which)` avec l'événement *keypress*.

<table>
<tr>
<td>

avec *keydown* <input id="whichKeydown" autocomplete="off">

<p>avec *keypress* <input id="whichKeypress" autocomplete="off">

<p>avec *keyup* <input id="whichKeyup" autocomplete="off">

</td>
<td>
<div id="traceWhich">&nbsp;</div>
</td>
</tr>
<tr>
<td colspan=2>

#### Code

```exec_on_load
from browser import document

trace = document["traceWhich"]

def which(ev):
    trace.html = f"event : {ev.type}<br> which : {ev.which}"
    if ev.type == "keypress":
        trace.html += f"<br>character : {chr(ev.which)}"

document["whichKeydown"].bind("keydown", which)
document["whichKeypress"].bind("keypress", which)
document["whichKeyup"].bind("keyup", which)
```
 </td>
 </tr>
 </table>

</td>
</tr>


</table>



