Eventos do Mouse
----------------

<script type="text/python">
from browser import doc, alert
</script>

Os eventos relacionados ao mouse (movimento, pressionar um botão) são:

<table cellpadding=3 border=1>
<tr>
<td>*mouseenter*</td>
<td>Um dispositivo de apontamento é movido para o elemento que tem o auditor vinculado</td>
</tr>
<tr><td>*mouseleave*</td><td>um dispositivo de apontamento é movido para fora do elemento que tem o auditor vinculado</td></tr>

<tr><td>*mouseover*</td><td>um dispositivo de apontamento é movido para o elemento que tem o auditor vinculado, ofusca este evento nos elementos filhos</td></tr>
<tr><td>*mouseout*</td><td>um dispositivo de apontamento é movido para fora do elemento que tem o auditor vinculado, ofusca este evento nos elementos filhos</td></tr>

<tr><td>*mousemove*</td><td>um dispositivo de apontemento é movido sobre o elemento que tem o auditor vinculado</td></tr>

<tr><td>*mousedown*</td><td>o botão de um dispositivo de apontamento é pressionado em um elemento</td></tr>
<tr><td>*mouseup*</td><td>o botão de um dispositivo de apontamento é solto sobre um elemento</td></tr>

<tr><td>*click*</td><td>o botão de um dispositivo de apontamento é pressionado e solto em um elemento</td></tr>
<tr><td>*dblclick*</td><td>o botão de um dispositivo de apontamento é clicado duas vezes em um elemento</td></tr>

</table>

Exemplos
--------

*mouseenter* e *mouseleave*

> Estes eventos são disparados quando o mouse entra ou sai de um
> elemento. Se um elemento inclúi outros, o evento é disparado a cada
> vez que o mouse entra ou sai de um elemento filho.

<table>
<tr>
<td>
<div id="yellow1" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue1" style="background-color:blue;color:white;padding:20px;">inner</div>
</td>
<td><div id="trace1">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
<div id="enter_leave">
    def _mouseenter(ev):
        doc["trace1"].text = 'entering %s' %ev.currentTarget.id
    
    def _mouseleave(ev):
        doc["trace1"].text = 'leaving %s' %ev.currentTarget.id
    
    doc["yellow1"].bind('mouseenter',_mouseenter)
    doc["yellow1"].bind('mouseleave',_mouseleave)
    doc["blue1"].bind('mouseenter',_mouseenter)
    doc["blue1"].bind('mouseleave',_mouseleave)
</div>
</blockquote>
</td>
</tr>
</table>

<script type="text/python">
exec(doc["enter_leave"].text)
</script>

*mouseover* e *mouseout*

> A diferença para *mouseenter* e *mouseleave* é que, uma vez que o
> mouse entra em um elemento, estes eventos não são disparados nos
> elementos filhos.

<table>
<tr>
<td>
<div id="yellow2" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue2" style="background-color:blue;color:white;padding:20px;">inner</div>
</td>
<td>
<div id="trace2">&nbsp;</div>
</td>
</tr>
<tr>
<td colspan=2>
<blockquote>
<div id="over_out">
    def _mouseover(ev):
        doc["trace2"].text = 'entering %s' %ev.currentTarget.id
    
    def _mouseout(ev):
        doc["trace2"].text = 'leaving %s' %ev.currentTarget.id
    
    doc["yellow2"].bind('mouseover',_mouseover)
    doc["yellow2"].bind('mouseout',_mouseout)
    doc["blue2"].bind('mouseover',_mouseover)
    doc["blue2"].bind('mouseout',_mouseout)

</div>
</blockquote>
</td>
</tr>
</table>

<script type="text/python">
exec(doc["over_out"].text)
</script>

*mousemove*

<table>
<tr><td>
<div id="green" style="padding:5px;background-color:#8F8;width:150px;">move the mouse</div>
</td>
<td><div id="trace3">&nbsp;</div></td>
</tr>
<tr>
<td colspan=2>
<blockquote>
<div id="move">
    def _mousemove(ev):
        doc["trace3"].text = 'coordinates : %s, %s' %(ev.x,ev.y)
    
    doc["green"].bind('mousemove',_mousemove)
</div>
</blockquote>
</td>
</tr>
</table>

<script type="text/python">
exec(doc["move"].text)
</script>

Atributos de instâncias de `DOMEvent`
-------------------------------------

As instâncias de `DOMEvent` têm os seguintes atributos:

<table cellpadding=3 border=1>
<tr><td>*button*</td><td>indica qual botão foi pressionado no mouse para disparar o evento.</td></tr>
<tr><td>*buttons*</td><td>indica quais botões do mouse foram pressionados para disparar o evento.

Cada botão que pode ser pressionado é representado por um dado número
(1: botão esquerto, 2: botão direito, 4: botão da roda). Se mais de um
botão for pressionado, o valor dos botões é combinado para produzir um
novo número. Por exemplo, se o botão direito (2) e o botão da roda (4)
forem pressionados, o valor é igual a 2+4, portanto 6.</td></tr>

<tr><td>*x*</td><td>posição do mouse relativamente à borda esquerda da janela (em pixels)</td></tr>
<tr><td>*y*</td><td>posição do mouse relativamente à borda superior da janela (em pixels)</td></tr>

<tr><td>*clientX*</td><td>a coordenada X do ponteiro do mouse em coordenadas locais (conteúdo DOM) coordinates</td></tr>
<tr><td>*clientY*</td><td>a coordenada Y do ponteiro do mouse em coordenadas locais (conteúdo DOM) coordinates</td></tr>

<tr><td>*screenX*</td><td>a coordenada X do ponteiro do mouse em coordenadas globais (tela)</td></tr>
<tr><td>*screenY*</td><td>a coordenada Y do ponteiro do mouse em coordenadas globais (tela)</td></tr>

</table>

