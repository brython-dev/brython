módulo **browser.timer**
------------------------

Implementa métodos que permitem a execução repetitiva ou diferida de
funções:

**`set_timeout(`_function,ms_`)`**

- executa a função *function* após *ms* milisegundos. *function* não
deve tomar argumentos. Retorna um objeto utilizável na função
serguinte.

> Encapsula a função `setTimeout` de javascript. Documentação oficial
> pode ser encontrada
> [aqui](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-settimeout).

> Neste exemplo simples, a cor do texto na caixa preta irá mudar após
> 3 segundos.

<div style="padding-left:50px;">
<div id="st-example" style="background-color:#dddddd;">
    from browser import doc, timer
    
    def change_color():
        doc['st-text'].style.color = "blue"
    
    def press_button(ev):
        timer.set_timeout(change_color, 3000)

    doc['st-button'].bind('click', press_button)
</div>

<script type="text/python">
exec(doc["st-example"].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="st-button">Press</button>
</td>
<td>
<div id="st-text" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">This color will change after 3s</div>
</td>
</tr>
</table>
</div>

**`clear_timeout(`_timer_`)`**

> Cancela a execução da função definida por `set_timeout()`. Ela toma
> um argumento, o objeto `_timer_` retornado pela chamada de
> `set_timeout()`.

> Encapsula a função `cancelTimeout` de javascript. Documentação
> oficial pode ser encontrada
> [aqui](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-cleartimeout).

> Vejamos o exemplo anterior. Agora você tem a possibilidade de parar
> a execução da ação antes dos 3 segundos que postergam a execução.

<div style="padding-left:50px;">
<div id="ct-example" style="background-color:#dddddd;">
    from browser import doc, timer
    
    idtimer = 1
    
    def change_color():
        doc['ct-text'].style.color = "blue"
    
    def press_button(ev):
        global idtimer
        idtimer = timer.set_timeout(change_color, 3000)
        
    def stop_button(ev):
        global idtimer
        timer.clear_timeout(idtimer)

    doc['ct-start'].bind('click', press_button)
    doc['ct-stop'].bind('click', stop_button)
    
</div>

<script type="text/python">
exec(doc["ct-example"].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="ct-start">Press</button>
<br>
<button id="ct-stop">Stop</button>
</td>
<td>
<div id="ct-text" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">This color will change after 3s</div>
</td>
</tr>
</table>
</div>

**`set_interval(`_function,ms_`)`**

> Inicia a execução repetida da função *function* a cada *ms*
> milisegundos. Esta função retorna um objeto utilizável na função
> seguinte.

> Encapsula a função `setInterval` de javascript. Documentação oficial
> pode ser encontrada
> [aqui](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-setinterval).

> Quando possível, você deveria evitar usar esta função e usar request_animation_frame (veja abaixo) como uma alternativa.

**`clear_interval(`_timer_`)`**
> Para a execução repetida da fução definida por `set_interval()`.

> Encapsula a função `clearInterval` de javascript. Documantação
> oficial pode ser encontrada
> [aqui](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-clearinterval).

> Aqui você pode ver um exemplo em que são usadas `set_interval` e
> `cancel_interval`:

<div style="padding-left:50px;">
<div id="py-source" style="background-color:#dddddd;">
    import time
    from browser import timer
    
    _timer = None
    counter = 0
    
    def show():
        doc['_timer'].text = '%.2f' %(time.time()-counter)
    
    def start_timer(ev):
        global _timer,counter
        if _timer is None:
            counter = time.time()
            _timer = timer.set_interval(show,10)
            doc['start'].text = 'Hold'
        elif _timer == 'hold': # restart
            # restart timer
            counter = time.time()-float(doc['_timer'].text)
            _timer = timer.set_interval(show,10)
            doc['start'].text = 'Hold'
        else: # hold
            timer.clear_interval(_timer)
            _timer = 'hold'
            doc['start'].text = 'Restart'
    
    def stop_timer(ev):
        global _timer
        timer.clear_interval(_timer)
        _timer = None
        t = 0
        doc['_timer'].text = '%.2f' %0
        doc['start'].text = 'Start'
    
    doc['start'].bind('click', start_timer)
    doc['stop'].bind('click', stop_timer)
</div>

<script type='text/python'>
exec(doc['py-source'].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="start">Start</button>
<br><button id="stop">Stop</button>
</td>
<td>
<div id="_timer" style="background-color:black;color:#0F0;padding:15px;font-family:courier;font-weight:bold;font-size:23px;">0.00</div>
</td>
</tr>
</table>
</div>

**`request_animation_frame(`*function*`)`**
> Executa a função *function* repetidamente deixando o navegador responsável por atualizar as chamadas. A função *function* usa um argumento falso.

> Encapsula a função `requestAnimationFrame` de
> javascript. Documentação oficial pode ser encontrada
> [aqui](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-requestanimationframe).

**`cancel_animation_frame(`*id*`)`**

> Cancela a execução repetida da função definida por
> *request_animation_frame()* e usa o valor retornado por
> *request_animation_frame()* como um *id*.

> Encapsula a função `cancelAnimationFrame` de
> javascript. Documentação oficial podde ser encontrada
> [aqui](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-cancelanimationframe).

> Aqui você pode ver um exemplo em que são usadas
> `request_animation_frame` e `cancel_animation_frame`:

<div style="padding-left:50px;">
<div id="raf-example" style="background-color:#dddddd;">
    from browser.timer import request_animation_frame as raf
    from browser.timer import cancel_animation_frame as caf
    from browser import doc, win
    from time import time
    from browser.html import CANVAS, BUTTON
    import math

    ctx = doc['raf-canvas'].getContext( '2d' ) 

    toggle = True

    def draw():
        t = time() * 3
        x = math.sin(t) * 96 + 128
        y = math.cos(t * 0.9) * 96 + 128
        global toggle
        if toggle:
            toggle = False
        else:
            toggle = True
        ctx.fillStyle = 'rgb(200,200,20)' if toggle else 'rgb(20,20,200)'
        ctx.beginPath()
        ctx.arc( x, y, 6, 0, math.pi * 2, True)
        ctx.closePath()
        ctx.fill()

    def animate(i):
        global id
        id = raf(animate)
        draw()

    def stop(i):
        print(id)
        caf(id)

    win.animate = animate
    win.stop = stop
</div>

<script type='text/python'>
exec(doc['raf-example'].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button type="button" onclick="animate(0)">Animate</button>
<br>
<button type="button" onclick="stop(0)">Stop</button>
</td>
<td>
<canvas id="raf-canvas" width=256 height=256></canvas>
</td>
</tr>
</table>
</div>
