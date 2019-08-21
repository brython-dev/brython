módulo **browser.worker**
-------------------------

El módulo **worker** es una implementación de
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
para Brython.

Un "worker"  es un script Python que recibe mensajes del script principal y 
devuelve mensajes de respuesta. El worker se ejecuta en un hilo diferente al del
script principal; incluso si necesita mucho tiempo para completarse el script principal
sigue respondiendo y el navegador no se queda congelado.

Un worker tiene un acceso restringido a las características del navegador; por ejemplo,
no puede acceder al documento que se está mostrando ni modificarlo.

### Insertando un script worker en una pagina HTML

Un script worker se inserta en una página HTML medianto una forma específica de la 
stiqueta `<script type="text/python">`:

```
<script type="text/python" class="webworker" id="myworker">
# instructions of the worker program
</script>
```

El atributo `src` se puede usar también para cargar el script del worker:

```
<script type="text/python" class="webworker" id="myworker" src="myworker.py">
</script>
```

Añadir la clase "webworker" especifica que el script no debe ser ejecutado como un
script Python sino que que se espera que se use como un worker por el script 
principal.

El atributo `id` es obligatorio (sino obtendremos un `AttributeError`); se usa
por el script principal como referencia para el script del worker.

### Usando un worker desde el script principal

El script principal importa el módulo **browser.worker** y crea un objeto worker
con la clase `Worker`:

`Worker(`_worker_id_`)`

> crea un objeto worker basado en el script referenciado mediante el identificador
> _worker_id_ (el atributo `id` de la etiqueta de script worker).

Las instancias de `Worker` tienen dos métodos:

`bind(`_evt, function_`)`

> enlaza la _función_ al evento _evt_. El evento principal es "message" : Se
> desencadena cuando un worker envía un mensaje al script principal.

> La _función_ acepta un único parámetro, un objeto evento con el atributo
> `data` cuyo valor es el valor del mensaje enviado por el worker.

> Destacar que en lugar de enlazar el evento mediante la sintaxis

<blockquote>
```python
def callback(evt):
    ...

worker.bind("message", callback)
```
</blockquote>
> Puedes usar la función `bind()` en el módulo **browser** como un decorador:
<blockquote>
```python
frow browser import bind

@bind(worker, "message")
def callback(evt):
    ...
```
</blockquote>

`send(`_message_`)`

> envía un mensaje al worker. El mensaje debe ser un objeto Python "simple"
> (*string*, número, lista con elementos "simples", diccionario con claves y 
> valores "simples")

### ¿Cómo funciona un worker?

En un worker, el módulo **browser** no tiene todos las atributos típicos. Por
ejemplo, no tiene aquellos que permiten acceder al documento: e,g, el atributo
`document` o el módulo **html** no están disponibles.

El atributo `window` no se encuentra definido; en su lugat, un atributo `self`
representa al worker y gestiona la relación con el script principal al que se
encuentra asociado.

Este objeto, `browser.self`, tiene atributos similares a aquellos del objeto worker
del script principal:

`bind(`_evt, function_`)`

> enlaza la _función_ al evento _evt_. El evento principal es "message" : Se
> desencadena cuando un worker envía un mensaje al script principal.

> La _función_ acepta un único parámetro, un objeto evento con el atributo
> `data` cuyo valor es el valor del mensaje enviado por el worker.

> Destacar que en lugar de enlazar el evento mediante la sintaxis

<blockquote>
```python
def callback(evt):
    ...

self.bind("message", callback)
```
</blockquote>

> Puedes usar la función `bind()` en el módulo **browser** como un decorador:

<blockquote>
```python
frow browser import bind, self

@bind(self, "message")
def callback(evt):
    ...
```
</blockquote>

`send(`_message_`)`

> envía un mensaje al worker. El mensaje debe ser un objeto Python "simple"
> (*string*, número, lista con elementos "simples", diccionario con claves y 
> valores "simples")

### Ejemplo

La galería proporciona un [ejemplo](/gallery/webworker_mdn.html) de un Web
Worker escrito con Brython.

Código del script principal:

```python
"""Main script."""

from browser import bind, document, worker

result = document.select_one('.result')
inputs = document.select("input")

# Create a web worker, identified by a script id in this page.
myWorker = worker.Worker("worker")

@bind(inputs, "change")
def change(evt):
    """Called when the value in one of the input fields changes."""
    # Send a message (here a list of values) to the worker
    myWorker.send([x.value for x in inputs])

@bind(myWorker, "message")
def onmessage(e):
    """Handles the messages sent by the worker."""
    result.text = e.data
```

Código del script worker:

```python
"""Web Worker script."""

# In web workers, "window" is replaced by "self".
from browser import bind, self

@bind(self, "message")
def message(evt):
    """Handle a message sent by the main script.
    evt.data is the message body.
    """
    try:
        result = int(evt.data[0]) * int(evt.data[1])
        workerResult = f'Result: {result}'
        # Send a message to the main script.
        # In the main script, it will be handled by the function bound to
        # the event "message" for the worker.
        self.send(workerResult)
    except ValueError:
        self.send('Please write two numbers')
```
