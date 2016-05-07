module **browser.timer**
------------------------

Implémente des fonctions pour permettre l'exécution différée ou répétitive de 
fonctions :

`set_timeout(`_fonction,ms_`)`
> exécute la *fonction* après *ms* millisecondes. *fonction* ne prend aucun 
> argument. Renvoie un objet utilisable dans la fonction suivante

> Elle repose sur la fonction `setTimeout` en Javascript : voir la 
> [documentation officielle](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-settimeout).

> Sur cet exemple, la couleur du texte dans la boite noire change après 3 secondes.

<div style="padding-left:50px;">
```exec_on_load
from browser import document, timer

def change_color():
    document['st-text'].style.color = "blue"

def press_button(ev):
    timer.set_timeout(change_color, 3000)

document['first-button'].bind('click', press_button)
```

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="first-button">Press</button>
</td>
<td>
<div id="st-text" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">Cette couleur change au bout de 3s</div>
</td>
</tr>
</table>
</div>

`clear_timeout(`_timer_`)`
> annule l'exécution définie par `set_timeout()`. Reçoit un argument, la 
> valeur de l'objet retournée par `set_timeout()`. 

> Elle repose sur la fonction `cancelTimeout` en Javascript. Voir la 
> [documentation officielle](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-cleartimeout).

> Reprenons l'exemple précédent. Vous avez maintenant la possibilité 
> d'interrompre l'exécution de l'action avant que les 3 secondes soient 
> écoulées.

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
<button id="ct-start">Lancer</button>
<br>
<button id="ct-stop">Arrêter</button>
</td>
<td>
<div id="ct-text2" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">Cette couleur changera au bout de 3s</div>
</td>
</tr>
</table>
</div>

`set_interval(`_fonction, ms_`)`
> lance l'exécution répétée de la *fonction* toutes les *ms* millisecondes. 
> Renvoie un objet utilisable dans la fonction `clear_interval` décrite ci-dessous.

> Elle repose sur la fonction `setInterval` de Javascript. Voir la 
> [documentation officielle](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-setinterval).

> Quand c'est possible il est préférable d'éviter de se servir de cette 
> fonction et d'utiliser plutôt `request_animation_frame` (voir ci-dessous)

`clear_interval(`_timer_`)`
> termine l'exécution répétée définie par `set_interval()`

> Elle repose sur la fonction `clearInterval` de Javascript. Voir la  
> [documentation officielle](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-clearinterval).

> Voici un exemple qui utilise `set_interval` et `cancel_interval`:

<div style="padding-left:50px;">
```exec_on_load
import time
from browser import document, timer

_timer = None
counter = 0

def show():
    document['_timer'].text = '%.2f' %(time.time()-counter)

def start_timer(ev):
    global _timer,counter
    if _timer is None:
        counter = time.time()
        _timer = timer.set_interval(show,10)
        document['start'].text = 'Pause'
    elif _timer == 'hold': # restart
        # restart timer
        counter = time.time()-float(document['_timer'].text)
        _timer = timer.set_interval(show,10)
        document['start'].text = 'Pause'
    else: # hold
        timer.clear_interval(_timer)
        _timer = 'hold'
        document['start'].text = 'Redémarrer'

def stop_timer(ev):
    global _timer
    timer.clear_interval(_timer)
    _timer = None
    t = 0
    document['_timer'].text = '%.2f' %0
    document['start'].text = 'Démarrer'

document['start'].bind('click', start_timer)
document['stop'].bind('click', stop_timer)
```

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="start">Démarrer</button>
<br><button id="stop">Arrêter</button>
</td>
<td>
<div id="_timer" style="background-color:black;color:#0F0;padding:15px;font-family:courier;font-weight:bold;font-size:23px;">0.00</div>
</td>
</tr>
</table>
</div>

`request_animation_frame(`_function_`)`
> provoque l'exécution répétée de la *fonction* en laissant le navigateur 
> gérer la mise à jour. *fonction* prend un argument non significatif

> Elle repose sur la fonction `requestAnimationFrame` de Javascript. Voir la
> [documentation officielle](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-requestanimationframe). 

`cancel_animation_frame(`_id_`)`
> annule l'exécution répétée de la fonction définie par 
> *request_animation_frame()* ; *id* est l'objet retourné par 
> *request_animation_frame()*

> Elle repose sur la fonction `cancelAnimationFrame` de Javascript. Voir la
> [documentation officielle](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-cancelanimationframe).

> Voici un exemple dans lequel on utilise `request_animation_frame` et
> `cancel_animation_frame` :

<div style="padding-left:50px;">
```exec_on_load
from browser.timer import request_animation_frame as raf
from browser.timer import cancel_animation_frame as caf
from browser import document
import time
from browser.html import CANVAS, BUTTON
import math

ctx = document['raf-canvas'].getContext( '2d' ) 

toggle = True

def draw():
    t = time.time() * 3
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
    caf(id)

document['btn-animate'].bind('click', animate)
document['btn-stop'].bind('click', stop)
```

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="btn-animate" type="button">Animer</button>
<br>
<button id="btn-stop" type="button">Arrêter</button>
</td>
<td>
<canvas id="raf-canvas" width=256 height=256></canvas>
</td>
</tr>
</table>
</div>

