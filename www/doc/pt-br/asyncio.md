módulo **asyncio**
-----------------------

O módulo asyncio fornece um estilo básico de eventloop [asyncio](https://docs.python.org/3.4/library/asyncio-dev.html) para suporte de gravação de código assíncrono sem ser forçado a "loopback hell".

Suporta a programação básica no estilo `asyncio`, usando `Future` e `coroutine`. Exemplo:

```python
import asyncio

@asyncio.coroutine
def test_wget(urls):
    results = []
    for u in urls:
        req = yield asyncio.HTTPRequest(u)
        results.append(req.response)
    return results

t = asyncio.ensure_future(test_wget(['http://google.com','http://wikipedia.org']))

```

e, eventualmente, `t.result()` iŕa retornar uma lista contendo o código html das
páginas requisitadas. O código utiliza um `HTTPRequest` fornecido pela implementação
assíncrona de Brython (é necessário um argumento obrigatório de URL e argumentos
opcionais de palavra-chave `method` ('GET' ou 'POST') e `data` para solicitações POST).

Contudo, algumas funcionalidades avançadas de `asyncio` ainda não estão implementadas, 
seja por não fazer sentido no navegador (servidores TCP, ...) ou ainda, fazendo sentido,
porém atualmente ainda não sendo suportado (por exemplo, Threading/Multiprocess poderia,
em teoria, ser implementado usando [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)).

Para mais informações de `asyncio` e `Futures`, veja
[PEP 3156](https://www.python.org/dev/peps/pep-3156/) e
[PEP 3148](https://www.python.org/dev/peps/pep-3148/) ou
[Documentação do AsyncIO](https://docs.python.org/3.4/library/asyncio-dev.html).
