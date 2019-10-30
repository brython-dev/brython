módulo **browser.aio**
-----------------------

Este módulo suporta programação assíncrona no Brython, usando as palavras-chave
`async` e `await`.

Susbstitui o módulo **asyncio** da biblioteca padrão CPython a qual não
funciona no contexto do navegador:

1. utiliza funções bloqueantes tais como `run ()` ou `run_until_complete ()`,
uma vez que a maneira como os navegadores funcionam torna impossível a definição
de funções cuja a execução seja suspensa até que um evento ocorra.

2. o navegador implicitamente possui seu próprio loop de eventos sendo impossível
definir outro como os módulos **asyncio** com a funcionalidade `set_event_loop()`.

O módulo **browser.aio** define as seguintes funções assíncronas:

### Requisições Ajax 

`ajax(`_method, url[, format="text", headers=None, data=None, cache=False]_`)`

> `req = await ajax("GET", url)` dentro de uma função assíncrona devolve o
> controle para o programa principal e retoma a função quando a solicitação Ajax
> do tipo _method_ ("GET", "POST", "PUT", etc.) de um URL especificado é completada.
> O valor retornado é uma instância da classe `Request` (a seguir).

> _format_ é o formato de resposta espeado. Pode ser dos tipos:

>> "text" : a resposta é uma string;

>> "binary" : é uma instância da classe `bytes`;

>> "dataURL" : uma string formatada como:
>> [dataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs);

> _headers_ é um dicionário com o cabeçalho HTTP para ser enviado junto à requisição;

> _data_ é uma string ou dicionário que a ser enviado junto à requisição para formar
> uma query para a requisição do tipo "GET" ou o corpo da requisição do tipo "POST";

> _cache_ é um booleano que indica ao navegador se a cache deve ou não ser utilizada.

`get(`_url[, format="text", headers=None, data=None, cache=False]_`)`

> um atalho para `ajax("GET", url...)`

`post(`_url[, format="text", headers=None, data=None]_`)`

> um atalho para `ajax("POST", url...)`

#### Instâncias `Request`

Instâncias da classe `Request`, retornadas por `await ajax()`, `await get()`
ou `await post()`. Possuem os seguintes atributos:

> `data` : o corpo da resposta, com formatação definida pelo argumento _format_;

> `response_headers` : um dicionário que corresponde aos cabeçalhos de resposta;

> `status` : status da resposta HTTP no formato de um inteiro (Ex.: 200, 404...);

> `statusText` : status da resposta HTTP no formato string (Ex.: "200 Ok", "404
> File not found"...);


### Outras funções assíncronas

`event(`_element, name_`)`

> `evt = await aio.event(element, "click")` suspende a execução de uma
> função assíncrona até que o usuário clique sob um elemento específico.
> O valor retornado é uma instância da classe `DOMEvent` (confira a
> sessão [eventos](../events.html))

`sleep(`_seconds_`)`

> Em uma função asíncrona, `await sleep(n)` devolve o controle para o
> programa principal e retoma à execução da função após `n` segundos.

### Executando uma função assíncrona

`run(`_coroutine_`)`

> Executa uma co-rotina, como por exemplo, o resultado de uma chamada para uma
> função assíncrona definida por `async def`. Esta é uma função _non blocking_:
> não espera até a função assíncrona ser completada para executar as instruções
> das linhas seguintes. O momento em que as próximas instruções serão executadas
> não é (facilmente) previsível.

### Exemplos

Inserindo um texto em um elemento INPUT (função customizada `input()`)

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

Leitura assíncrona de arquivos

```python
from browser import document, html, aio

async def main():
    # Arquivo de texto
    req = await aio.ajax("GET", "test.html")
    print(len(req.data))
    # Arquivo binário
    req = await aio.get("memo.pdf", format="binary")
    print(len(req.data))
    # Leitura do arquivo binário como um dataURL
    req = await aio.get("eraser.png", format="dataURL")
    # Imprime a imagem com uma tag IMG
    document <= html.IMG(src=req.data)

aio.run(main())
```