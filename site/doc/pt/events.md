Eventos
-------

<script type="text/python">
from browser import doc, alert
</script>

Introdução
----------

Suponha que tenhamos em uma página um elemento do tipo botão, como
este: <button>um botão</button>

Se vocẽ clicar nele, nada irá acontecer pois nenhuma instrução foi
dada sobre como reagir a um clique. Para isso, a ação a ser tomada
deve ser definida por esta sintaxe:

>    btn.bind('click', show)

O primeiro argumento de `bind` é um tipo de evento que o botão deve
resolver; o segundo é uma função que toma um único argumento, uma
instância da classe `DOMEvent`. Por exemplo:

>    def show(ev):
>        print('ok !')

(lembre-se que para ver o resultado de `print` o console do navegador
deve estar aberto)

Instâncias de `DOMEvent` têm um número de atributos que depende do
tipo de evento. No caso do clique, e de maneira mais geral para
eventos relacionados ao mouse, os atributos incluem:

- `target` : o elemento no qual o evento foi disparado
- `x, y` : a posição do mouse relativamente ao canto superior esquerdo da janela

Por exemplo, para imprimir o texto do botão e a posição do mouse:

>    def show(ev):
>        print(ev.target.text, ev.x, ev.y)

Interface
---------

Para o gerenciamento de eventos, os elementos de uma página têm os
seguintes métodos:

<code>elt.bind(_evt\_name, handler_)</code>

> associa a função _handler_ ao evento de nome _evt\_name_

<code>elt.unbind(_evt\_name[, handler_])</code>

> remove a associação da função _handler_ ao evento de nome
> _evt\_name_. Se _handler_ for omitido, remove todas as associações
> do elemento ao evento

Objetos `DOMEvent`
------------------

(Informação por Mozilla Contributors, encontrada em
[https://developer.mozilla.org/en-US/docs/Web/API/event](https://developer.mozilla.org/en-US/docs/Web/API/event))

Qualquer que seja o tipo de evento, instâncias da classe `DOMEvent`
têm os seguintes atributos:

<table border=1 cellpadding=5>

<tr>
<td>
`bubbles`
> booleano, indica se o evento ascende (bubbles up) através do DOM ou não
</td>
<td>
<button id="_bubbles">test</button>
<script type="text/python">
doc['_bubbles'].bind('click',lambda ev:alert('bubbles : %s ' %ev.bubbles))
</script>
</td>
</tr>

<tr>
<td>
`cancelable`
> booleano, indica se o evento é cancelável ou não
</td>
<td>
<button id="_cancelable">test</button>
<script type="text/python">
doc['_cancelable'].bind('click',lambda ev:alert('cancelable : %s ' %ev.cancelable))
</script>
</td>
</tr>

<tr>
<td>
`currentTarget`
> instância de `DOMNode`; identfica o alvo atual para o evento
> conforme o evento atravessa o DOM. Sempre se refere ao elemento ao
> qual o resolvedor do evento foi vinculado, diferente de event.target
> que identifica o elemento no qual o evento ocorreu.
</td>
<td>
<button id="_currentTarget">test</button>
<script type="text/python">
doc['_currentTarget'].bind('click',lambda ev:alert('currentTarget : %s ' %ev.currentTarget))
</script>
</td>
</tr>

<tr>
<td>
`defaultPrevented`
> booleano, indica se event.preventDefault() foi chamado no evento ou não
</td>
<td>
<button id="_defaultPrevented">test</button>
<script type="text/python">
doc['_defaultPrevented'].bind('click',lambda ev:alert('defaultPrevented : %s ' %ev.defaultPrevented))
</script>
</td>
</tr>

<tr>
<td>
`eventPhase`
> inteiro, indica qual fase do
> [fluxo do evento](http://www.w3.org/TR/DOM-Level-3-Events/#event-flow)
> está sendo validada atualmente
</td>
<td>
<button id="_eventPhase">test</button>
<script type="text/python">
doc['_eventPhase'].bind('click',lambda ev:alert('eventPhase : %s ' %ev.eventPhase))
</script>
</td>
</tr>

<tr>
<td>
`target`
> instância de `DOMNode`; o objeto em que o evento foi disparado. É
> diferente de `event.currentTarget` quando o resolvedor do evento é
> chamado em fases de ascenção (bubbling) ou captura do evento
</td>
<td>
<button id="_target">test</button>
<script type="text/python">
doc['_target'].bind('click',lambda ev:alert('target : %s ' %ev.target))
</script>
</td>
</tr>

<tr><td>`timeStamp`
> inteiro, o tempo (em milisegundos desde 01/Jan/1970 às 0h) em que o
> evento foi criado
</td>
<td>
<button id="_timeStamp">test</button>
<script type="text/python">
doc['_timeStamp'].bind('click',lambda ev:alert('timeStamp : %s ' %ev.timeStamp))
</script>
</td>
</tr>

<tr><td>`type`
> cadeia de caractéres, contém o tipo de evento
</td>
<td>
<button id="_type">test</button>
<script type="text/python">
doc['_type'].bind('click',lambda ev:alert('type : %s ' %ev.type))
</script>
</td>
</tr>

</table>

e os seguintes métodos

`preventDefault()`
> previne a execução de uma ação associada ao evento por padrão (default)

> **Exemplo**

> Quando uma caixa de seleção é clicada, a ação padrão é mostrar ou
> esconder um tique sobre ela:

>> caixa de seleção (comportamento padrão) <input type="checkbox">

> Para desabilitar este comportamento na caixa de seleção:

<blockquote>
<div id="disable_cbox">
    def _cancel(ev):
        ev.preventDefault()
    
    doc["disabled_cbox"].bind('click',_cancel)
</div>
</blockquote>

>> resultado:

>> caixa de seleção desabilitada <input type="checkbox" id="disabled_cbox">

<script type="text/python">
exec(doc["disable_cbox"].text)
</script>

`stopPropagation()`
> previne demais propagações do evento atual

> **Exemplo**

> Na zona colorida abaixo

<div id="yellow" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue" style="background-color:blue;color:white;padding:20px;">inner, normal propagation</div>
<div id="green" style="background-color:green;color:white;padding:20px;">inner, propagation stopped</div>
</div>

> os 3 elementos (a moldura externa amarela e os retângulos internos
> azul e verde resolvem o evento "click".

<blockquote>
<div id="zzz_source">
    from browser import doc, alert
    
    def show(ev):
        alert('click on %s' %ev.currentTarget.id)
    
    def show_stop(ev):
        alert('clic on %s' %ev.currentTarget.id)
        ev.stopPropagation()
    
    doc["yellow"].bind('click',show)
    doc["blue"].bind('click',show)
    doc["green"].bind('click',show_stop)
</div>
</blockquote>

<div id="zzz"></div>

> Clicando na zona amarela dispara a chamada da função `show()`, a
> qual imprime a mensagem "click on yellow"

> Um clique na zona azul dispara a mensagem de alerta "click on
> blue". Então, o evento propaga ao elemento pai, o retângulo
> amarelo. Como este retângulo também resolve o evento "click", o
> navegador chama a ação assiciada, a mesma função `show()`, e mostra
> a mensagem "click on yellow" (note que o atributo `currentTarget` é
> atualizado a medida que o evento se propaga).

> Clicar na zona verde faz a mensagem "click on green" aparecer. Este
> evento é resolvido pela função `show_stop()`, a qual termina em:

>>    ev.stopPropagation()

> Então o evento não se propaga para o nível superior e a execução
> termina sem a caixa de alerta "click on yellow"


<script type="text/python">
eval(doc["zzz_source"].text)
</script>
