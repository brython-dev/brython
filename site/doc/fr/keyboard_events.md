Evénements clavier
==================

<script type="text/python">
from browser import doc, alert
</script>

Les événements relatifs au clavier sont

<table cellpadding=3 border=1>
<tr>
<td>*input*</td>
<td>déclenché quand la valeur d'un élément &lt;input&gt; ou &lt;textarea&gt; est modifié, ou quand le contenu d'un élément `contenteditable` est modifié
</td>
</tr>

<tr>
<td>*keydown*</td><td>appui sur une touche quelconque du clavier</td>
</tr>

<tr><td>*keypress*</td><td>appui sur une touche du clavier qui produit un caractère. Par exemple, quand on entre Ctrl+C au clavier, l'événement *keypress* n'est déclenché qu'au moment où on appuie sur C, alors que *keydown* est déclenché dès l'appui sur Ctrl</td></tr>

<tr><td>*keyup*</td><td>relâchement d'une touche enfoncée</td></tr>

</table>

Attributs de l'objet `DOMEvent`
-------------------------------

L'instance de `DOMEvent` possède les attributs suivants

<table border=1 cellpadding=5>

<tr>
<td>
`altKey`
> booléen, indique si la touche Alt (ou Option sur Mac) était enfoncée quand l'événement clavier a été déclenché

> Cet attribut n'est pas disponible pour l'événement *input*

> Il est normalement utilisé avec *keypress*, pour pouvoir tester si on a entré Alt+&lt;key&gt; ou seulement &lt;key&gt;
</td>
<td>
#### Exemple

Saisir du texte dans le champ ci-dessous, en appuyant ou pas sur la touche Alt

<p><input id="altKey"></input>&nbsp;<span id="traceAltKey">&nbsp;</span>

#### Code

<div id="codeAltKey">
    from browser import document as doc
    
    def altKey(ev):
        doc["traceAltKey"].text = 'altKey : %s ' %ev.altKey
        
    # le champ de saisie a comme id "altKey"
    doc['altKey'].bind('keypress', altKey)
</div>
</td>
</tr>

<td>
`charCode`
> Le numéro de référence Unicode pour la touche

> Cet attribut n'est utilisable que pour l'événement *keypress*

</td>
<td>
#### Example

Enter text in the entry below. Note that the character can be read by `ch(ev.charCode)`

<input id="charCode"></input>
&nbsp;<span id="traceCharCode">&nbsp;</span>

#### Code

<div id="codeCharCode">
    from browser import document as doc
    
    def charCode(ev):
        trace = doc["traceCharCode"]
        char = chr(ev.charCode)
        trace.text = 'charCode : %s, ' %ev.charCode
        trace.text += 'character : %s' %char
    
    doc['charCode'].bind('keypress', charCode)
</div>
</td>

<tr>
<td>
`ctrlKey`
> booléen, indique si la touche Ctrl était enfoncée quand l'événement clavier a été déclenché

> Cet attribut n'est pas disponible pour l'événement *input*

> Il est normalement utilisé avec *keypress*, pour pouvoir tester si on a entré Ctrl+&lt;key&gt; ou seulement &lt;key&gt;
</td>
<td>
#### Example

Saisir du texte dans le champ ci-dessous, en appuyant ou pas sur la touche Ctrl

<input id="ctrlKey"></input>
&nbsp;<span id="traceCtrlKey">&nbsp;</span>

#### Code

<div id="codeCtrlKey">
    from browser import document as doc
    
    
    def ctrlKey(ev):
        doc["traceCtrlKey"].text = 'ctrlKey : %s ' %ev.ctrlKey
        ev.preventDefault()
    
    doc['ctrlKey'].bind('keypress', ctrlKey)
</div>

Notez que `ev.preventDefault()` est appelé pour éviter le comportement par défaut associé à certains raccourcis clavier qui utilisent la touche Ctrl

</td>
</tr>

<tr>
<td>
`keyCode`
> un code numérique dépendant du système et de l'implémentation, caractérise la clé enfoncée

> cette valeur est la même que les touches Alt, Ctrl ou majuscules soient enfoncées ou non

> noter que le résultat n'est pas le même selon qu'on gère les événements *keydown*, *keyup* et *keypress*
</td>
<td>

#### Example

Saisissez du texte dans les champs de saisie ci-dessous. Notez que le caractère peut être lu par `ch(ev.charCode)` avec l'événement *keypress*

avec *keydown* <input id="keyCodeKeydown"></input>

<p>avec *keypress* <input id="keyCodeKeypress"></input>
&nbsp<span id="traceKeyCode">&nbsp;</span>

<p>avec *keyup* <input id="keyCodeKeyup"></input>

#### Code

<div id="codeKeyCode">
    from browser import document as doc
    
    def keyCode(ev):
        trace = doc["traceKeyCode"]
        trace.text = 'event %s '%ev.type
        trace.text += ', keyCode : %s ' %ev.keyCode
        ev.stopPropagation()
    
    doc['keyCodeKeydown'].bind('keydown', keyCode)
    doc['keyCodeKeypress'].bind('keypress', keyCode)
    doc['keyCodeKeyup'].bind('keyup', keyCode)
</div>

</td>
</tr>

<tr>
<td>
`shiftKey`
> booléen, indique si la touche Majuscule était enfoncée quand l'événement clavier a été déclenché

> Cet attribut n'est pas disponible pour l'événement *input*

> Il est normalement utilisé avec *keypress*, pour pouvoir tester si on a entré Shift+&lt;key&gt; ou seulement &lt;key&gt;
</td>
<td>
#### Example

Saisir du texte dans le champ ci-dessous, en appuyant ou pas sur la touche Majuscule

<input id="shiftKey" value="saisie"></input>
&nbsp;<span id="traceShiftKey">&nbsp;</span>

#### Code

<div id="codeShiftKey">
    from browser import document as doc
    
    def shiftKey(ev):
        doc["traceShiftKey"].text = 'shiftKey : %s ' %ev.shiftKey

    doc['shiftKey'].bind('keypress', shiftKey)
</div>

</td>
</tr>

<tr>
<td>
`which`
> un code numérique dépendant du système et de l'implémentation, caractérise la clé enfoncée

> noter que le résultat n'est pas le même selon qu'on gère les événements *keydown*, *keyup* et *keypress*
</td>
<td>
#### Example

Saisir du texte dans les champs ci-dessous. Notez qu'on peut lire le caractère par `chr(ev.which)` avec l'événement *keypress*

<table>
<tr>
<td>

avec *keydown* <input id="whichKeydown"></input>

<p>avec *keypress* <input id="whichKeypress"></input>

<p>avec *keyup* <input id="whichKeyup"></input>

</td>
<td>
<div id="traceWhich">&nbsp;</div>
</td>
</tr>
<tr>
<td colspan=2>

#### Code

<div id="codeWhich">
    from browser import document as doc
     
    trace = doc["traceWhich"]

    def which(ev):
        trace.html = 'event : %s<br>' %ev.type
        trace.html += 'which : %s<br>' %ev.which
        if ev.type == 'keypress':
            trace.html += 'character : %s' %chr(ev.which)

    doc['whichKeydown'].bind('keydown', which)
    doc['whichKeypress'].bind('keypress', which)
    doc['whichKeyup'].bind('keyup', which)
 </div>
 </td>
 </tr>
 </table>

</td>
</tr>


</table>

<script type="text/python">
from browser import document as doc
for _id in ["AltKey", "CharCode", "CtrlKey", "KeyCode", "ShiftKey", "Which"]:
    elt_id = "code%s" %_id
    exec(doc[elt_id].text)
</script>

