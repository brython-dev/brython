módulo **browser.ajax**
-----------------------

Este módulo permite a execução de requisões Ajax. É definido por uma única classe:

`Ajax()`
> retorna um objeto ajax

Este objeto possui os atributos e métodos a seguir:

`bind(`_evt, function_`)`
> anexa a  _function_ ao evento _evt_. _evt_ é uma string que corresponde a
> diferentes estados de requisição:

- "uninitialized" : não inicializado
- "loading" : conexão estabelecida
- "loaded": requisição recebida
- "interactive": resposta em andamento
- "complete" : finalizada

> A _function_ recebe um único argumento, uma instância de `Ajax`.

`open(`_method, url, async_`)`
> _method_ é o método HTTP usado para a requisição (normalmente GET ou POST),

> _url_ é a url a ser chamada,

> _async_ é um booleano que indica se a chamada é assíncrona (o script o qual
> iniciou a requisição continua executando sem aguardar resposta) ou não (o
> script aguarda até que a resposta seja recebida).


`readyState`
> um inteiro representando o estado de uma requisição (conforme a tabela a
> seguir).

<blockquote>
<table cellspacing=0 cellpadding=4 border=1>
<tr><th>
readyState
</th><th>
estado da requisição
</th></tr>
<tr><td align="center">0</td><td>"uninitialized"</td></tr>
<tr><td align="center">1</td><td align="center">"loading"</td></tr>
<tr><td align="center">2</td><td align="center">"loaded"</td></tr>
<tr><td align="center">3</td><td align="center">"interactive"</td></tr>
<tr><td align="center">4</td><td align="center">"complete"</td></tr>
</table>
</blockquote>

`set_header(`_name, value_`)`
> seta o _value_ do cabeçalho _name_.

`set_timeout(`_duration, function_`)`
> caso a query não retorne uma resposta em até _duration_ em segundos, esta irá
> cancelar a query e executar a _function_. Esta função não deve conter
> argumentos.

`send(`_[data]_`)`
> envia (incia) a requisição. O argumento opcional _data_ é ignorado se o método
> não for o POST ; É preciso de um dicionário, ou uma string representando a 
> codificação de URL de pares de valores-chave. No caso de envio de arquivos,
> é necessário passar um dicionário com uma das chaves contendo o objeto File, 
> por exemplo, desde que você tenha um elemento de entrada do tipo `file` e id 
> `upload_file` você pode enviar um arquivo selecionado pelo usuário sob a chave
> `upload` pela chamada `send({'upload':doc["upload_file"].elt.files[0]})`

`status`
> um inteiro representando o status HTTP da requisição. Os mais comuns são 200 (ok)
> e 404 (file not found).

`text`
> a resposta do servidor no formato string de caracteres.

`xml`
> a resposta do servidor no formato de um objeto DOM.

### Exemplo

Suponhamos que há uma DIV com id _result_ na página HTML

```python
from browser import document, ajax

def on_complete(req):
   if req.status == 200 or req.status == 0:
       document["result"].html = req.text
   else:
       document["result"].html = "error " + req.text

req = ajax.Ajax()
req.bind('complete', on_complete)
# send a POST request to the url
req.open('POST', url, True)
req.set_header('content-type', 'application/x-www-form-urlencoded')
# send data as a dictionary
req.send({'x': 0, 'y': 1})
```

### Atalhos

Chamadas GET e POST  podem ser realizadas de maneira mais direta com as seguintes
funções correspondentes:

`get(`_url[, blocking=False, headers={}, mode="text", timeout=None, cache=False, data="", **callbacks]_`)`

e o mesmo ocorre para `delete`, `head` e `options`.

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

e o mesmo ocorre para `put`.

> _blocking_ é um booleano que especifica se a requisição é bloqueante ou não.
> O valor padrão é `False` (requisição assíncrona)

> _headers_ é um dicionário com a chave / valores dos cabeçalhos HTTP

> _mode_ é um "text" ou "binary"

> _data_ é uma string ou um dicionário. No último caso, o dicionário é
> convertido para uma string no formato `x=1&y=2`.

> _cache_ é um booleano que especifica se a requisição GET deve ou não
> usar a cache do navegador

> _timeout_ é o tempo em segundos após o qual a solicitação é cancelada

> _**callbacks_ é um dicionário no qual as chaves estão no formato
> `on` + nome do evento (`onloaded`, `oncomplete`...) e os valores são
> funções que tratam este evento. Para a chave `ontimeout`, o valor
> associado a esta é uma função que é chamada caso da duração definida
> em _timeout_ tenha sido alcançada.

Na função callback, o objeto `Ajax` possui um método _read()_ o qual lê o
conteúdo da resposta como uma string (se o mode estiver setado como "text")
ou como `bytes` (se o mode estiver setado como "binary").

O exemplo a seguir pode ser escrito com este atalho:

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

Lendo um arquivo binário:

```python
from browser import ajax

def read(f):
    data = f.read()
    assert isinstance(data, bytes)

req = ajax.get("tests.zip", mode="binary",
    oncomplete=read)
```

### Upload de Arquivos

Para enviar arquivos inseridos em um formulário por uma tag como
```xml
<input type="file" name="choosefiles" multiple="multiple">
```
o módulo disponibiliza a função

`file_upload(`_url, file, [**callbacks]_`)`

> _file_ é o objeto file (arquivo) a ser carregado no _url_, geralmente o
> resultado de uma expressão
<blockquote>
```python
for file in document["choosefiles"].files:
    ...
```
</blockquote>

Exemplo:
```xml
<script type="text/python">
from browser import ajax, bind, document

def upload_ok(req):
    print("Tudo certo")

@bind("#upload", "click")
def uploadfiles(event):
    for f in document["choosefiles"].files:
        ajax.file_upload("/cgi-bin/savefile.py", f,
            oncomplete=upload_ok)
</script>

<form>
    <input id="choosefiles" type="file" multiple="multiple" />
</form>
<button id="upload">Upload</button>
```
