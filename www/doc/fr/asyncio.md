module **asyncio**
------------------

Le module fournit une boucle d'événements basique de type [asyncio]
(https://docs.python.org/3.4/library/asyncio-dev.html) pour permettre l'écriture
de code asynchrone en évitant l'"enfer des loopbacks".

La programmation de style `asyncio`, utilisant `Future` et `coroutine`, est
prise en charge. Vous pouvez par exemple écrire

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

`t.value()` renverra une liste contenant le code html des pages demandées.
Le code utilise le "future" `HTTPRequest` fourni par l'implémentation d'asyncio
en Brython (elle prend un argument url obligatoire et des arguments optionnels
`method` ('GET' ou 'POST') et `data` pour les requêtes POST).

En revanche, certaines des fonctionnalités plus avancées de `asyncio` ne sont
pas implémentées. Soit elles n'ont pas de sens dans un navigateur (serveurs TCP, 
...), soit elles auraient du sens mais ne sont pas développées (par
exemple Threading/Multiprocess pourrait en thérie être implémenté avec les
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API))
ou ne sont pas du tout testées à ce stade (WebSocketTransport).

Pour plus d'information sur `asyncio` et `Futures`, voir
[PEP 3156](https://www.python.org/dev/peps/pep-3156/) et
[PEP 3148](https://www.python.org/dev/peps/pep-3148/) ou
[AsyncIO Documentation](https://docs.python.org/3.4/library/asyncio-dev.html).
