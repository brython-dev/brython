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

<code>bind(_evt,funcion_)</code> 

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

<code>send(_data_)</code>

> envía el string _data_ al servidor
`close()`

> cierra la conexión

Ejemplo :
<table>
<tr>
<td>
```exec_on_load
from browser import alert, document as doc
from browser import websocket

def on_open(evt):
    doc['sendbtn'].disabled = False
    doc['closebtn'].disabled = False
    doc['openbtn'].disabled = True

def on_message(evt):
    # message reeived from server
    alert("Message received : %s" %evt.data)

def on_close(evt):
    # websocket is closed
    alert("Connection is closed")
    doc['openbtn'].disabled = False
    doc['closebtn'].disabled = True
    doc['sendbtn'].disabled = True

ws = None
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

def send(ev):
    data = doc["data"].value
    if data:
        ws.send(data)

def close_connection(ev):
    ws.close()
    doc['openbtn'].disabled = False

doc['openbtn'].bind('click', _open)
doc['sendbtn'].bind('click', send)
doc['closebtn'].bind('click', close_connection)
```        
</td>

<td valign="top">
<button id="openbtn">Open connection</button>
<br><input id="data"><button id="sendbtn" disabled>Send</button>
<p><button id="closebtn" disabled>Close connection</button>
</td>

</tr>
</table>
