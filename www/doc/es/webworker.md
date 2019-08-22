módulo **browser.webworker**
----------------------------

El modulo webworker proporciona una integración básica entre Brython y [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
Permite ejecutar un script python en un web worker con relativa facilidad. Actualmente hay dos clases disponibles para usar.
Una clase Worker básica y una clase RPCWorker.


## Clase Worker básica

Esta clase permite ejecutar un script en el webworker comunicándose con él enviando mensajes.

Iniciamos el web worker creando una nueva instancia de la clase `WorkerParent`. El constructor usa una
url de un script a ejecutar (puede ser una ruta absoluta o relativa al directorio fuente de Brython ), argumentos  
para el script (disponibles vía `sys.argv` en el script) y los contenidos de `os.environ` para el script

```python
from browser import webworker as ww
w = ww.WorkerParent('web_workers/test_worker.py',[1,2,3],{"test":"Ahoj"})
```

La comunicación con el worker se realiza enviando mensajes, representados mediante la calse `Message`. Notar
que aunque hará falta algo de tiempo antes de que el worker arranque y esté funcionando (el worker 
está listo cuando su estatus `w.status` es `S_RUNNING`), podemos empezar a enviar mensajes desde el principio 
(se pondrán en una cola y se enviarán cuando esté listo).

```python
m = ww.Message('ping',"hi")
r = w.post_message(m,want_reply=True)
```

La publicación del mensaje se realiza mediange el método `WorkerCommon.post_message`. Coge el mensaje
(una instancia de la clase `Message`) como primer parámetro. El segundo parámetro (`want_reply`)
indica qye qeremos esperar una respuesta al mensaje. El resultado será una instancia de `asyncio.Future`
que será resulta una vez llegue la respuesta. Opcionalmente, podemos añadir un timeout 
(el `timeout`) en segundos despuñes del cual el futuro se resolverá con una excepción timeout.

Si no nos interesa la respuesta (o si no esperamos una), podemos omitir los dos parámetros
y hace simplemente

```python
w.post_message(ww.Message('quit',None))
```

Implementar el worker es sencillo. Primero definimos los métodos que gestionarán los
distintos mensajes:
    
```python
from browser.webworker import current_worker, Message
from browser import console

from sys import argv
from os import environ

def pong(self, message, **_):
    print('Web worker received message (',message.id,')', message.name, message.data)
    current_worker.post_reply(message, Message('pong', message.data))
        
def quit(self, *args, **kwargs):
    current_worker.terminate()
    
```

Fíjate en como hemos usado `current_worker.post_reply` en lugar de `current_worker.post_message`
para indicar que el mensaje es una respuesta en el mensaje recibido.

Después hemos de unir estos métodos a los mensajes relevantes. Esto se realiza mediante
el método `WorkerCommon.bind_message`. Su primer argumento es el nombre del mensaje y
el segundo argumento es el método que se llamará cuando llega un mensaje.

```python
current_worker.bind_message('ping', pong)
current_worker.bind_message('quit', quit)
```

Finalmente, deberíamos dejar al padre saber que estamos listos para empezar a recibir mensajes.
Esto se hace usando el método `current_worker.exec`.

```python
print("Starting test worker with args:", argv, "and environment", environ)
current_worker.exec()
```

El `current_worker` es una instancia de la clase `WorkerChild` y solo está disponible
en el worker (siempre está en el hilo principal).


## Clase RPC Worker

Las clases `WorkerParent` y `WorkerChild` (representando las dos caras de una conexión)
son muy sencillas y se pueden usar para construir workers más útiles. Un ejemplo de esto
son las clases `RPCWorkerParent` y `RPCWorkerChild` que son útiles en un escenario, donde
nos gustaría ejecutar métodos python en un webworker como si estuvieran ejecutándose
en el hilo principal. Un programa típico podría ser algo como lo siguiente:

```python
from browser import webworker as ww
from asyncio import coroutine

@coroutine
def main(w):
    # Wait for the worker to start
    yield w.wait_for_status(ww.S_RUNNING)
    
    # Call the remote add method
    a = yield w.add(10,20)
    assert a == 30
    
    # Call the remote log method
    yield w.log("Test output")
    
    # Destroy the worker
    w.terminate()

# Create a new instance of the worker
w = ww.RPCWorkerParent('web_workers/test_rpc.py',[1,2,3],{"USER":"nobody"})

# Run the main method
main(w)
```
 
La diferencia del simple ejemplo `WorkerParent` es que ahora necesitamos esperar
a que el worker comience (hasta ese momento no conocemos los métodos disponibles). Por lo que
envolvemos todo en una corutina `main` (async def en versions recientes de Python), 
donde podemos esperar a que el worker esté listo cediendo (esperando en Python reciente) 
el método `WorkerCommon.wait_for_status`.
 
Después llamamos al método `add`, que debe ser definido en el worker en el cual será ejecutado. El
método devuelve una instancia de `asyncio.Future`  que representa el valor de retorno de la llamada al método. 
Esperando en nuestra corutina se pausa la ejecución hasta que esté disponible. Después llamamos al método `log`
y finalmente terminamos el worker usando el método `WorkerCommon.terminate`.

Implementar la parte del worker es muy similar al caso anterior. La principal diferencia es que
en lugar de usar el método `WorkerCommon.bind_message` usaremos el método `RPCWorkerChild.register_method`:

```python
from browser.webworker import current_worker, Message
from browser import console 

from sys import argv
from os import environ

def add(x, y):
    """Adds two numbers"""
    return x+y

def log(*args):
    print(*args)

# Register the `add` and `log` methods.
current_worker.register_method(add)
current_worker.register_method(log)```python


# Tell the parent we are ready
print("Starting test RPC worker with args:", argv, "and environment", environ)
current_worker.exec()import asyncio
```


## Creando nuevas clases Worker

Cada nuevo worker necesita dos clases --- Las clases padres e hijos --- representando al worker en
el hilo principal y en el hilo del worker, respectivamente. Se unen usando el atributo `CHILD_CLASS`
De la clase Worker padre. Esto debería ser una *string* que se puede usar para importar a la clase
hija en el webworker (e.g. la clase `RPCWorkerParent` tiene el atributo ajustado a `"browser.webworker.RPCWorkerChild"`).
Luego, el módulo se encargará de instanciar la clase hija en el web worker y lo almacena en
`webworker.current_worker`. 
