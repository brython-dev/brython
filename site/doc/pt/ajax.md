módulo **browser.ajax**
-----------------------

Este módulo permite executar requisições Ajax. Ele define uma única
função:

`ajax()`
> retorna um objeto `ajax`

Este objeto tem os seguintes atributos e métodos:

`bind(`_evt,function_`)`

> vincula a função _function_ ao evento _evt_. _evt_ é uma cadeia que
> corresponde aos diferentes estados da requisição:

- "uninitialized" : não inicializado
- "loading" : conexão estabelecida
- "loaded": requisição recebida
- "interactive": resposta em andamento
- "complete" : acabado

> A função _`function`_ toma um único argumento, o objeto `ajax`.

Isso é equivalente a: _req.on\_evt_ = _function_

`open(`_method, url, async_`)`

> o método _method_ é o método HTTP usado para a requisição
> (normalmente GET ou POST), _url_ é a url a chamar, _async_ é o valor
> booleano que indica se a chamada é asíncrona ou não.

`readyState` 

> Um inteiro representando o estado da requisição (conforme a tabela
> abaixo):

<blockquote>
<table cellspacing=0 cellpadding=4 border=1>
<tr><th>
readyState
</th><th>
request state
</th></tr>
<tr><td align="center">0</td><td>"uninitialized"</td></tr>
<tr><td align="center">1</td><td align="center">"loading"</td></tr>
<tr><td align="center">2</td><td align="center">"loaded"</td></tr>
<tr><td align="center">3</td><td align="center">"interactive"</td></tr>
<tr><td align="center">4</td><td align="center">"complete"</td></tr>
</table>
</blockquote>

`set_header(`_name, value_`)`
> Estabelece o valor _value_ do cabeçalho _name_.

`set_timeout(`_duration, function_`)`

> Se a consulta não retornar uma resposta durante dentro da duração
> _duration_ em segundos, este método cancelará a consulta e executará
> a função _function_. Esta função não pode ter argumentos.

`send()`
> Envia (inicia) a requisição.

`status`

> Um inteiro representando o status HTTP da requisição. Os mais usuais
> são 200 (ok) e 404 (arquivo não encontrado).

`text`
> A resposta do servidor como uma cadeia de caracteres.

`xml`
> A resposta do servidor como um objeto DOM.



### Exemplo

Supomos que exista um DIV com id _result_ na página HTML.

>    from browser import doc,ajax
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
