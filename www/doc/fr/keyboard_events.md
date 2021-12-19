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

<tr>
<td>
`key`
> Une chaine de caractères pour la touche enfoncée:

>> - le caractère si la touche correspond à un caractère

>> - une chaine qui décrit la touche pour les touches spéciales (par exemple
>>   "Control" pour la touche Ctrl)

</td>
<td>
#### Example

Entrer du texte dans le champ ci-dessous

<table>
<tr>
<td>keydown</td>
<td><input id="key_keydown" autocomplete="off"></td>
<td rowspan="3"><span id="traceKey">&nbsp;</span></td>
</tr>
<tr>
<td>keypress</td>
<td><input id="key_keypress" autocomplete="off"></td>
</tr>
<tr>
<td>keyup</td>
<td><input id="key_keyup" autocomplete="off"></td>
</tr>
</table>

#### Code

```exec_on_load
from browser import bind, document

def keyevent(ev):
    trace = document["traceKey"]
    trace.text = f"type: {ev.type}, key: {ev.key}"
    ev.stopPropagation()

document["key_keydown"].bind("keydown", keyevent)
document["key_keypress"].bind("keypress", keyevent)
document["key_keyup"].bind("keyup", keyevent)
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
`code`
> une chaine de caractères qui caractérise la touche physique du clavier
> enfoncée

> cette valeur est la même quel que soit le caractère produit par l'appui sur
> la touche: par exemple sur un clavier AZERTY, l'appui sur la touche A donne
> comme code "KeyQ"

</td>
<td>

#### Example

Positionnez le curseur dans les champs de saisie ci-dessous et appuyez sur
les touches du clavier.

avec *keydown* <input id="codeKeydown" autocomplete="off">

<p>avec *keypress* <input id="codeKeypress" autocomplete="off">
&nbsp<span id="traceKeyCode">&nbsp;</span>

<p>avec *keyup* <input id="codeKeyup" autocomplete="off">

#### Code

```exec_on_load
from browser import document

def keyCode(ev):
    trace = document["traceKeyCode"]
    trace.text = f"event: {ev.type}, code: {ev.code}"
    ev.stopPropagation()

document["codeKeydown"].bind("keydown", keyCode)
document["codeKeypress"].bind("keypress", keyCode)
document["codeKeyup"].bind("keyup", keyCode)
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


</table>



