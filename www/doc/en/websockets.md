module **browser.websocket**
----------------------------

Web sockets, defined in HTML5, are a way to handle bi directional communication between client and server

The module defines a boolean:

`supported`
> indicates if the protocol is supported by the browser

and a function:

`WebSocket(`_host_`)`
> _host_ is the location of a server that supports the WebSocket protocol.
> Returns a `WebSocket` object. If the browser doesn't support WebSocket, a
> `NotImplementedError` will be raised

`WebSocket` objects have the following methods :

`bind(`_evt,function_`)`
> attaches the _function_ to the event _evt_. The events and the corresponding function arguments are :

<blockquote>
<table border=1 cellpadding=5>
<tr>
<th>Event</th>
<th>Function</th>
</tr>
<tr>
<td>`open`</td>
<td>function with no argument, called once the connection with the server is established</td>
</tr>
<tr>
<td>`error`</td>
<td>function with no argument, called if an error occurs during the communication</td>
</tr>
<tr>
<td>`message`</td>
<td>function that takes one argument, an instance of `DOMEvent`. This instance has an attribute `data` that holds the message sent by the server as a string</td>
</tr>
<tr>
<td>`close`</td>
<td>function with no argument, called when the connection is closed</td>
</tr>
</table>
</blockquote>

`send(`_data_`)`
> sends the string _data_ to the server

`close()`
> closes the connection

Example :
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
