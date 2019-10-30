Módulo **browser.ajax**
-----------------------

El módulo permite ejecutar peticiones Ajax. En el módulo se define una única
clase :

`Ajax()`
> devuelve un objeto `ajax`

Este objeto posee los siguientes atributos y métodos:

`bind(`_evt, funcion_`)`:
> adjunta la función al evento *evt*. *evt* es una cadena que define uno de los
> siguientes estados de la petición

- "uninitialized" : no inicializado
- "loading" : conexión establecida
- "loaded" : solicitud recibida
- "interactive" : respuesta en curso
- "complete" : terminado

> La _función_ toma un único argumento: el objeto `Ajax`.

`open(`_method, url, async_`)`
> _method_ es el método HTTP usado para la petición (normalmente GET o POST),

> _url_ es la url a llamar,

> _async_ es el booleano que indica si la llamada es asíncrona (el
> script que comenzó la petición se ejecuta sin esperar a la
> respuesta) o no (el script espera hasta que se recibe la respuesta).

`readyState`
> un entero que representa el estado de la petición (ver tabla más abajo)

<blockquote>
<table cellspacing=0 cellpadding=4 border=1>
<tr><th>
readyState
</th><th>
estado de la petición
</th></tr>
<tr><td align="center">0</td><td>"uninitialized"</td></tr>
<tr><td align="center">1</td><td align="center">"loading"</td></tr>
<tr><td align="center">2</td><td align="center">"loaded"</td></tr>
<tr><td align="center">3</td><td align="center">"interactive"</td></tr>
<tr><td align="center">4</td><td align="center">"complete"</td></tr>
</table>
</blockquote>

`set_header(`_name, value_`)`
> establece el _valor_ del _nombre_ del cabecero

`set_timeout(`_duration, function_`)`
> si la petición no devuelve una respuesta durante la _duración_ en segundos,
> cancelará la petición y ejecutará la _función_. Esta función no puede tener
> argumentos

`send(`_[data]_`)`
> envía (inicia) la petición. El argumento opcional _data_ será ignorado si el
> método no es POST ; debe ser un diccionario o una cadena representando la codificación url
> de los pares clave-valor. Si deseas enviar ficheros, necesitarás pasar un diccionario siendo una de las claves
> un objeto File, e.g. en caso que tengas un elemento _input_ de tipo `file` e _id_ `upload_file`
> podrías enviar el fichero seleccionado por el usuario bajo la clave `upload` mediante una
> llamada `send({'upload':doc["upload_file"].elt.files[0]})`

`status`
> es un entero que representa el estatus HTTP de la petición. Los valores más
> usuales son 200 (ok) y 404 (file not found)

`text`
> la respuesta del servidor como una cadena de caracteres

`xml`
> la respuesta del servidor como un objeto DOM

### Ejemplo

Supondremos que existe un DIV con id _result_ en la página HTML

```python
from browser import document, ajax

def on_complete(req):
    if req.status == 200 or req.status == 0:
        document["result"].html = req.text
    else:
        document["result"].html = "error " + req.text

req = ajax.Ajax()
req.bind('complete', on_complete)
# envía una petición POST a la url
req.open('POST', url, True)
req.set_header('content-type', 'application/x-www-form-urlencoded')
# envía datos como un diccionario
req.send({'x': 0, 'y': 1})
```

### Atajos

Las llamadas GET y POST se pueden efectuar de una forma más directa de la
siguiente forma:

`get(`_url[, blocking=False, headers={}, mode="text", timeout=None, cache=False, data="", **callbacks]_`)`

y lo mismo se podría hacer con `delete`, `head` y `options`.

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

y lo mismo para `put`.

> _blocking_ es un booleano que sirve para especificar si la petición es
> bloqueante o no. El valor por defecto es `False` (asincrona petición)

> _headers_ es un diccionario con los cabeceros HTTP (claves / valores)

> _mode_ es "text" o "binary"

> _data_ puede ser tanto un *string* como un diccionario. En el caso del,
> diccionario el mismo se convierte a una cadena de la forma `x=1&y=2`.

> _cache_ es un booleano que sirve para especificar si la petición GET
> debería usar la caché del navegador

> _timeout_ es el tiempo en segundos después del cual se cancelará la petición

> _**callbacks_ es un diccionario donde las claves son de la forma
> `on` + nombre del evento (`onloaded`, `oncomplete`...) y el valor es la
> función que maneja ese evento. Para la clave `ontimeout`, el valor
> es la función para llamar si la duración definida en _timeout_ se alcanza.

En la función de *callback*, el objeto `Ajax` posee el método _read()_ que lee
el contenido de la respuesta como un *string* si el modo es "text" y como `bytes`
si el modo es "binary".

El ejemplo anterior se podría escribir de la siguiente forma usando el atajo:

```python
from browser import document, ajax

def on_complete(req):
    if req.status == 200:
        document["result"].html = req.text
    else:
        document["result"].html = "error " + req.text

ajax.post(url,
          data={'x': 0, 'y': 1},
          oncomplete=on_complete)
```

Reading a binary file:

```python
from browser import ajax

def read(f):
    data = f.read()
    assert isinstance(data, bytes)

req = ajax.get("tests.zip", mode="binary",
    oncomplete=read)
```
