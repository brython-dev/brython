módulo **browser.websocket**
----------------------------

Web sockets, defiidos em HTML5, são uma forma de gerir a comunicação
bi direcional entre cliente e servidor.

O módulo define uma função:

`websocket(`_host_`)`

> _host_ é a localização de um servidor que suporta o protocolo
> WebSocket. Retorna um objeto `WebSocket`.

> Se o navegador não suporta WebSocket, um erro `NotImplementedError`
> será levantado.

Objetos `WebSocket` têm os seguintes métodos:

`bind(`_evt,function_`)`

> Vincula a função _function_ ao evento _evt_. Os eventos e os
> argumentos correspondentes da função são:

<blockquote>
<table border=1 cellpadding=5>
<tr>
<th>Evento</th>
<th>Função</th>
</tr>
<tr>
<td>`open`</td>
<td>função sem argumentos, chamada quando a conexão com o servidor é estabelecida</td>
</tr>
<tr>
<td>`error`</td>
<td>função sem argumentos, chamada se um erro ocorrer durante a comunicação</td>
</tr>
<tr>
<td>`message`</td>
<td>função com um único argumento, uma instância de `DOMEvent`. Esta instância tem um atributo `data` que contém a mensagem enviada pelo servidor como uma cadeia de caracteres</td>
</tr>
<tr>
<td>`close`</td>
<td>função sem argumentos, chamada quando a conexão é fechada</td>
</tr>
</table>
</blockquote>

`send(`_data_`)`
> Envia a cadeia de caracteres _data_ para o servidor.

`close()`
> Fecha a conexão.

Exemplo:
<table>
<tr>
<td id="py_source">
    from browser import doc,alert,WebSocket
    
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
        if not __BRYTHON__.has_websocket:
            alert("WebSocket is not supported by your browser")
            return
        global ws
        # open a web socket
        ws = WebSocket("wss://echo.websocket.org")
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
</td>
<td valign="top">
<script type='text/python'>
exec(doc['py_source'].text)
</script>

<button id="openbtn">Abrir conexão</button>
<br><input id="data"><button id="sendbtn" disabled>Enviar</button>
<p><button id="closebtn" disabled>Fechar conexão</button>
</td>
</tr>
</table>
