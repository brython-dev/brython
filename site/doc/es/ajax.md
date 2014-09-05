Módulo **browser.ajax**
-----------------------

El módulo permite ejecutar peticiones Ajax. En el módulo se define una única función :

`ajax()`

> devuelve un objeto `ajax`

Este objeto posee los siguientes atributos y métodos:

`bind(`_evt, funcion_`)`:
> adjunta la función al evento *evt*. *evt* es una cadena que define uno de los siguientes estados
de la petición

- "uninitialized" : no inicializado
- "loading" : conexión establecida
- "loaded" : solicitud recibida
- "interactive" : respuesta en curso
- "complete" : terminado

> La _función_ toma un único argumento: el objeto `ajax`.

Es equivalente a: _req.on\_evt = func_

`open(`_method, url, async_`)`
> _method_ es el método HTTP usado para la petición (normalmente GET o POST), _url_ es la url a llamar, _async_ es el booleano que indica si la llamada es asíncrona o no

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
> si la petición no devuelve una respuesta durante la _duración_ en segundos, cancelará la petición y ejecutará la _función_. Esta función no puede tener argumentos

`send()`
> envía (inicia) la petición

`status`
> es un entero que representa el estatus HTTP de la petición. Los valores más usuales son 200 (ok) y 404 (file not found)

`text`
> la respuesta del servidor como una cadena de caracteres

`xml`
> la respuesta del servidor como un objeto DOM

### Ejemplo

Supondremos que existe un DIV con id _result_ en la página HTML

>    from browser import document as doc
>    from browser import ajax
>
>    def on_complete(req):
>        if req.status==200 or req.status==0:
>            doc["result"].html = req.text
>        else:
>            doc["result"].html = "error "+req.text
>    
>    req = ajax.ajax()
>    req.bind('complete',on_complete)
>    req.open('POST',url,True)
>    req.set_header('content-type','application/x-www-form-urlencoded')
>    req.send(data)
