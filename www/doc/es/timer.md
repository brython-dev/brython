módulo **browser.timer**
------------------------

Implementa métodos que permiten la ejecución de funciones de forma repetida o diferida.

<code>set\_timeout(*funcion,ms*)</code>

> ejecuta la *funcion* después de *ms* milisegundos. *function* no toma ningún argumento

> Es un wrapper de la función javascript `setTimeout`. La documentación oficial se puede encontrar [aquí](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-settimeout).

> En este ejemplo el color del texto en la caja negra cambiará después de 3 segundos.

<div style="padding-left:50px;">
```exec_on_load
from browser import document as doc
from browser import timer

def change_color():
    doc['first-text'].style.color = "blue"

def press_button(ev):
    timer.set_timeout(change_color, 3000)

doc['first-button'].bind('click', press_button)
```

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="first-button">Press</button>
</td>
<td>
<div id="first-text" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">This color will change after 3s</div>
</td>
</tr>
</table>
</div>

<code>clear\_timeout(*id*)</code>

> cancela la ejecución de la función definida en *set_timeout()* y como parámetro se usa el valor devuelto por *set_timeout()*

> Es un wrapper de la función javascript `cancelTimeout`. La documentación oficial se puede encontrar [aquí](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-cleartimeout).

> Veamos el ejemplo previo. Ahora tienes la posibilidad de para la ejecución antes de que se cumplan los tres segundos.

<div style="padding-left:50px;">
```exec_on_load
from browser import document, timer

idtimer = 1

def change_color_two():
    document['ct-text2'].style.color = "blue"

def press_button_two(ev):
    global idtimer
    idtimer = timer.set_timeout(change_color_two, 3000)
    
def stop_button(ev):
    timer.clear_timeout(idtimer)

document['ct-start'].bind('click', press_button_two)
document['ct-stop'].bind('click', stop_button)
```

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="ct-start">Press</button>
<br>
<button id="ct-stop">Stop</button>
</td>
<td>
<div id="ct-text2" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">This color will change after 3s</div>
</td>
</tr>
</table>
</div>

<code>set\_interval(*funcion,ms*)</code>

> ejecuta la *funcion* de forma repetida cada *ms* milisegundos. Esta función devuelve un objeto usable en la siguiente función

> Es un wrapper de la función javascript `setInterval`. La documentación oficial se puede encontrar [aquí](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-setinterval).

> Siempre que sea posible, deberías evitar el uso de esta función y usar request_animation_frame (ver más abajo) como alternativa. 


`clear_interval(`*id*`)`

> detiene la ejecución repetitiva de la función definida por <code>set\_interval()</code> y como parámetro se usa el valor devuelto por *set_interval()*

> Es un wrapper de la función javascript `clearInterval`. La documentación oficial se puede encontrar [aquí](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-clearinterval).

> Aquí abajo puedes ver un ejemplo donde se usa conjuntamente `set_interval` y `cancel_interval`:

<div style="padding-left:50px;">
```exec_on_load
import time
from browser import document as doc
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
```

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

<code>request\_animation\_frame(*funcion*)</code>

> ejecuta la *funcion* de forma repetitiva dejando que el navegador se encargue de actualizar la ejecución. *function* usa un argumento falso

> Es un wrapper de la función javascript `requestAnimationFrame`. La documentación oficial se pueden encontrar [aquí](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-requestanimationframe). 

<code>cancel\_animation\_frame(*id*)</code>

> cancela la ejecución de la función definida en *request_animation_frame()* y como parámetro se usa el valor devuelto por *request_animation_frame()*

> Es un wrapper de la función javascript `cancelAnimationFrame`. La documentación oficial se puede encontrar [aquí](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-cancelanimationframe).

> Debajo puedes ver un ejemplo donde se usa `request_animation_frame` y `cancel_animation_frame`:

<div style="padding-left:50px;">
```exec_on_load
from browser.timer import request_animation_frame as raf
from browser.timer import cancel_animation_frame as caf
from browser import document as doc
from browser import window as win
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
    global id
    print(id)
    caf(id)

doc['btn-animate'].bind('click', animate)
doc['btn-stop'].bind('click', stop)
```

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="btn-animate" type="button">Animate</button>
<br>
<button id="btn-stop" type="button">Stop</button>
</td>
<td>
<canvas id="raf-canvas" width=256 height=256></canvas>
</td>
</tr>
</table>
</div>
