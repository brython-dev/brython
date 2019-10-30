módulo **browser.aio**
-----------------------

Este módulo añade programación asíncrona a Brython mediante el uso de las 
palabras clave `async` y `await`.

Reemplaza al módulo **asyncio** disponible en la biblioteca estándar de CPython, 
el cual no funciona en el contexto de un navegador web:

1. Usa funciones de bloqueo como `run()` o `run_until_complete()`.
La forma en que funcionan los navegadores hace que sea imposible definir
funciones cuya ejecución se suspenda hasta que ocurra un evento.

2. El navegador tiene si propio bucle de eventos implícito. No es posible definir
otro como lo hace el módulo **asyncio** mediante la función `set_event_loop()`.

El módulo **browser.aio** define las siguientes funciones asíncronas:

### Ajax requests

`ajax(`_method, url[, format="text", headers=None, data=None, cache=False]_`)`

> `req = await ajax("GET", url)` dentro de una función asíncrona devuelve el
> control al programa principal y reanuda la función cuando la petición Ajax
> del tipo _method_ ("GET", "POST", "PUT", etc.) a la URL especificada se ha
> completado. El valor devuelto es una instancia de la clase `Request` (ver
> más abajo).

> _format_ es el formato de respuesta esperado. Puede ser uno de:

>> "text" : La respuesta es un *string*

>> "binary" : es una instancia de la clase `bytes`

>> "dataURL" : un *string* formateado como
>> [dataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)

> _headers_ es un diccionario con los cabeceros HTTP a enviar con la petición.

> _data_ es un *string* o un diccionario que será enviado con la petición para
> formar el *string* para una petición "GET" o el cuerpo de la petición "POST".

> _cache_ es un booleano indicando si la caché dl navegadorse debería de usar.

`get(`_url[, format="text", headers=None, data=None, cache=False]_`)`

> atajo de teclado para `ajax("GET", url...)`

`post(`_url[, format="text", headers=None, data=None]_`)`

> atajo de teclado para `ajax("POST", url...)`

#### Instancias `Request`

Instancias de la clase `Request` tal como son devueltas por `await ajax()`, 
`await get()` o `await post()`. Disponen de los siguientes atributos:

> `data` : el cuerpo de la respuesta, con el formato definido mediante el
> argumento _format_

> `response_headers` : un diccionario con los cabeceros de la respuesta

> `status` : estatus de respuesta HTTP definido como entero (200, 404...)

> `statusText` : estatus de respuesta HTTP definido como un *string* ("200 Ok", 
> "404 File not found"...)

### Otras funciones asíncronas

`event(`_element, name_`)`

> `evt = await aio.event(element, "click")` suspende la ejecución de una
> función asíncrona hasta que el usuario pulsa sobre el elemento especificado.
> El valor devuelto es una instancia de la clase `DOMEvent` (cf. sección
> [eventos](../events.html))

`sleep(`_seconds_`)`

> En una función asíncrona, `await sleep(n)` devuelve el control al programa
> principal y reanuda la ejecución de la función después de `n` segundos.

### Ejecutando una función asíncrona

`run(`_coroutine_`)`

> Ejecuta una corutina, i.e. el resultado de la llamada a una función
> asíncrona definida mediante `async def`. Esta es una función no _bloqueante_: 
> no espera hasta que la función asíncrona se ha completado para ejecutar 
> las instrucciones en las líneas siguiente. El tiempo cuando las siguientes
> instrucciones se ejecutan no es (fácilmente) predecible.

### Ejemplos

Introducir texto en un elemento INPUT (función `input()` adaptada)

```python
from browser import alert, document, html, aio

async def main():
    input = html.INPUT()
    document <= input
    while True:
        ev = await aio.event(input, "blur")
        try:
            v = int(ev.target.value)
            input.remove()
            alert(f"Value: {v}")
            break
        except ValueError:
            input.value = ""

aio.run(main())
```

Lectura de ficheros de forma asíncrona

```python
from browser import document, html, aio

async def main():
    # Text file
    req = await aio.ajax("GET", "test.html")
    print(len(req.data))
    # Binary file
    req = await aio.get("memo.pdf", format="binary")
    print(len(req.data))
    # Read binary file as dataURL
    req = await aio.get("eraser.png", format="dataURL")
    # display the image in an IMG tag
    document <= html.IMG(src=req.data)

aio.run(main())
```
