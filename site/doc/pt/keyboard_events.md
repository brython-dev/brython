Eventos do Teclado
------------------

<script type="text/python">
from browser import document, alert
</script>

Os eventos do teclado são:

<table cellpadding=3 border=1>
<tr>
<td>*input*</td>
<td>disparado quando o valor de um elemento &lt;input&gt; ou &lt;textarea&gt; é modificado, ou o conteúdo de um elemento `contenteditable` é modificado.
</td>
</tr>

<tr><td>*keydown*</td><td>disparado quando qualquer tecla no teclado é
pressionada</td></tr>

<tr><td>*keypress*</td><td>uma tecla é pressionada e isso normalmente
produz um caractére. Por exemplo, quando usando Ctrl+C, o evento
*keypress* só é disparado quando a tecla C é pressionada, enquanto que
o evento *keydown* é disparado assim que a tecla Ctrl é
pressionada</td></tr>

<tr><td>*keyup*</td><td>a tecla é solta</td></tr>

</table>

Atributos do objeto `DOMEvent`
------------------------------

Para eventos do teclado, a instância de `DOMEvent` tem os seguintes
atributos:

<table border=1 cellpadding=5>

<tr>
<td>
`altKey`

> `True` se a tecla Alt (ou Option, no Mac) estava ativa quando o
> evento foi gerado.

> Este atributo não é definido para o evento *input*.

> É normalmente usado com *keypress*, para poder testar se a
> combinação Alt+&lt;tecla&gt; foi usada, ou apenas &lt;key&gt;

</td>

<td>
#### Exemplo

Digite um texto no campo abaixo, com ou sem pressionar a tecla Alt:

<p><input id="altKey" value=""></input>&nbsp;<span id="traceAltKey">&nbsp;</span>

#### Código

<div id="codeAltKey">
    from browser import document
    
    def altKey(ev):
        document["traceAltKey"].text = 'altKey : %s ' %ev.altKey
        
    # o campo de entrada tem a id "altKey"
    document['altKey'].bind('keypress', altKey)
</div>
</td>
</tr>

<td>
`charCode`
> O número de referência Unicode de uma tecla.

> Este atributo é usado apenas pelo evento *keypress*.

> É atribuído um valor diferente a ele se a tecla Shift é pressionada
> ou não.

</td>
<td>
#### Exemplo

Digite um texto no campo de entrada abaixo. Note que o caractére pode
ser lido por `ch(ev.charCode)`.

<input id="charCode" value=""></input>&nbsp;<span id="traceCharCode">&nbsp;</span>

#### Código

<div id="codeCharCode">
    from browser import document
    
    trace = document["traceCharCode"]
    def charCode(ev):
        char = chr(ev.charCode)
        trace.text = 'charCode : %s, ' %ev.charCode
        trace.text += 'character : %s' %char
    
    document['charCode'].bind('keypress', charCode)
</div>
</td>

<tr>
<td>
`ctrlKey`
> `True` se a tecla Ctrl estava ativa quando o evento foi gerado.

> Este atributo não é definido para o evento *input*.

> É normalmente usado com *keypress*, para poder testar se a
> combinação Ctrl+&lt;tecla&gt; foi usada, ou apenas &lt;key&gt;

<td>
#### Exemplo

Digite um texto no campo abaixo, com ou sem pressionar a tecla Ctrl:

<input id="ctrlKey" value=""></input>
&nbsp;<span id="traceCtrlKey">&nbsp;</span>

#### Código

<div id="codeCtrlKey">
    from browser import document

    def ctrlKey(ev):
        document["traceCtrlKey"].text = 'ctrlKey : %s ' %ev.ctrlKey
        ev.preventDefault()
    
    document['ctrlKey'].bind('keypress', ctrlKey)
</div>

Note que `ev.preventDefault()` é usado para evitar o comportamento
padrão de alguns atalhos do navegador que usam a tecla Ctrl.

</td>
</tr>

<tr>
<td>
`keyCode`

> Um código numérico que depende do sistema e da implementaçao e
> identifica o valor não modificado da tecla prassionada.

> O valor não muda se as teclas Alt, Ctrl or Shift estiverem
> pressionadas.

> Note que o resultado não é o mesmo dependendo do evento resolvido:
> *keydown*, *keyup* ou *keypress*

</td>
<td>
#### Exemplo

Digite um texto nos campos abaixo. Note que o caractére pode ser lido
por `ch(ev.charCode)` com o evento *keypress*.

com *keydown* <input id="keyCodeKeydown" value=""></input>

<p>com *keypress* <input id="keyCodeKeypress" value=""></input>
&nbsp;<span id="traceKeyCode">&nbsp;</span>

<p>com *keyup* <input id="keyCodeKeyup" value=""></input>

#### Código

<div id="codeKeyCode">
    from browser import document
    
    def keyCode(ev):
        trace = document["traceKeyCode"]
        trace.text = 'event %s '%ev.type
        trace.text += ', keyCode : %s ' %ev.keyCode
        ev.stopPropagation()
    
    document['keyCodeKeydown'].bind('keydown', keyCode)
    document['keyCodeKeypress'].bind('keypress', keyCode)
    document['keyCodeKeyup'].bind('keyup', keyCode)
</div>

</td>
</tr>

<tr>
<td>
`shiftKey`
> `True` se a tecla Shift estava ativa quando o evento foi gerado.

> Este atributo não é definido para o evento *input*.

> É normalmente usado com *keypress*, para poder testar se a
> combinação Shift+&lt;tecla&gt; foi usada, ou apenas &lt;key&gt;

</td>
<td>
#### Exemplo

Digite um texto no campo abaixo, com ou sem pressionar a tecla Shift:

<input id="shiftKey" value=""></input>
&nbsp;<span id="traceShiftKey">&nbsp;</span>

#### Código

<div id="codeShiftKey">
    from browser import document
    
    def shiftKey(ev):
        document["traceShiftKey"].text = 'shiftKey : %s ' %ev.shiftKey

    document['shiftKey'].bind('keypress', shiftKey)
</div>
</td>
</tr>

<tr>
<td>
`which`
> Um código numérico que depende do sistema e da implementaçao e
> identifica o valor não modificado da tecla prassionada.

> Note que o resultado não é o mesmo dependendo do evento resolvido:
> *keydown*, *keyup* ou *keypress*

</td>
<td>
#### Exemplo

Digite um texto no campo abaixo. Note que o caractére pode ser lido
por `ch(ev.charCode)` com o evento *keypress*.


<table>
<tr>
<td>
with *keydown* <input id="whichKeydown"></input>

<p>with *keypress* <input id="whichKeypress"></input>

<p>with *keyup* <input id="whichKeyup"></input>

 </td>
 <td>
 <span id="traceWhich">&nbsp;</span>
 </td>
 </tr>
 <tr>
 <td colspan=2>
#### Código

 <div id="codeWhich">
    from browser import document

    def which(ev):
        trace = document["traceWhich"]
        trace.html = 'event : %s<br>' %ev.type
        trace.html += 'which : %s<br>' %ev.which
        if ev.type == 'keypress':
            trace.html += 'character : %s' %chr(ev.which)

    document['whichKeydown'].bind('keydown', which)
    document['whichKeypress'].bind('keypress', which)
    document['whichKeyup'].bind('keyup', which)
 </div>
 </td>
 </tr>
 </table>
</td>
</tr>
</table>

<script type="text/python">
exec(document["codeAltKey"].text)
exec(document["codeCharCode"].text)
exec(document["codeCtrlKey"].text)
exec(document["codeKeyCode"].text)
exec(document["codeShiftKey"].text)
exec(document["codeWhich"].text)
</script>

