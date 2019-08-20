módulo **browser.websocket**
----------------------------

Los Web sockets, definidos en HTML5, son una manera de manejar comunicación bidireccional entre el cliente y el servidor.

El módulo define una función :

`supported`

> indica si el protocolo está soportado por el navegador 

y una función: 

`WebSocket(`_host_`)`

> _host_ define la localización de un servidor que soporta el protocolo WebSocket. devuelve un objeto `WebSocket`.
> Si el navegador no soporta `WebSocket`, se lanzará un `NotImplementedError` 

Un objeto `WebSocket` dispone de los siguientes métodos :

`bind(`_evt,function_`)` 
> adjunta la _funcion_ al evento _evt_. Los eventos y los correspondientes argumentos de la función son :

<blockquote>
<table border=1 cellpadding=5>
<tr>
<th>Evento</th>
<th>Función</th>
</tr>
<tr>
<td>`open`</td>
<td>función sin argumento, establece la conexión con el servidor una vez que se la llama</td>
</tr>
<tr>
<td>`error`</td>
<td>función sin argumento, será llamada si ocurre un error durante la comunicación</td>
</tr>
<tr>
<td>`message`</td>
<td>función con un argumento, una instancia del `DOMEvent`. Esta instancia posee el atributo `data` que recibe el mensaje enviado por el servidor como una cadena</td>
</tr>
<tr>
<td>`close`</td>
<td>función sin argumento, será llamada cuando se cierra la conexión</td>
</tr>
</table>
</blockquote>

`send(`_data_`)`
> envía el string _data_ al servidor

`close()`
> cierra la conexión

Ejemplo :
<table>
<tr>
<td valign="top">
```exec_on_load
from browser import alert, document, websocket

def on_open(evt):
    document['sendbtn'].disabled = False
    document['closebtn'].disabled = False
    document['openbtn'].disabled = True

def on_message(evt):
    # message received from server
    alert(f"Message received : {evt.data}")

def on_close(evt):
    # websocket is closed
    alert("Connection is closed")
    document['openbtn'].disabled = False
    document['closebtn'].disabled = True
    document['sendbtn'].disabled = True

ws = None

@document['openbtn'].bind('click')
def _open(ev):
    if not websocket.supported:
        alert("WebSocket is not supported by your browser")
        return
    global ws
    # open a web socket
    ws = websocket.WebSocket("wss://echo.websocket.org")
    # bind functions to web socket events
    ws.bind('open',on_open)
    ws.bind('message',on_message)
    ws.bind('close',on_close)

@document['sendbtn'].bind('click')
def send(ev):
    data = document["data"].value
    if data:
        ws.send(data)

@document['closebtn'].bind('click')
def close_connection(ev):
    ws.close()
    document['openbtn'].disabled = False
```        
</td>

<td valign="top">
<button id="openbtn">Open connection</button>
<br><input id="data"><button id="sendbtn" disabled>Send</button>
<p><button id="closebtn" disabled>Close connection</button>
</td>

</tr>
</table>
