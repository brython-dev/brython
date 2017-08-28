Módulo **asyncio**
-----------------------

El módulo `asyncio` proporciona un eventloop básico al estilo del 
[asyncio en CPython](https://docs.python.org/3.4/library/asyncio-dev.html)
eventloop que permite escribir código asíncrono sin ser forzado a permanecer 
en el "infierno loopback".

Permite programación básica al estilo `asyncio` usando `Future`'s y 
`coroutine`. E.g. puedes escribir

```python
import asyncio

@asyncio.coroutine
def test_wget(urls):
    results = []
    for u in urls:
        req = yield from asyncio.HTTPRequest(u)
        results.append(req.response)
    return results

t = asyncio.ensure_future(test_wget(['http://google.com','http://wikipedia.org']))

```

y, eventualmente, `t.result()` devolverá una lista que contiene el código
HTML de las páginas requeridas. El código usa el `HTTPRequest` future 
que proporciona la implementación asyncio de Brython (usa de forma obligada un 
argumento url y las palabras clave opcionales `method` ('GET' o 'POST') 
y `data` para POST-requests).

Sin embargo, alguna funcionalidad `asyncio` más avanzada no se encuentra
implementado. Tampoco tiene mucho sentido en el navegador (servidores TCP, ...), 
o puede tener sensito pero actualmente no está soportado (e.g. Threading/Multiprocess 
podría, en teoría, ser implementado usando
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)).

Para más información sobre `asyncio` y `Futures`, ver
[PEP 3156](https://www.python.org/dev/peps/pep-3156/) y
[PEP 3148](https://www.python.org/dev/peps/pep-3148/) o
[Documentación AsyncIO](https://docs.python.org/3.4/library/asyncio-dev.html).
