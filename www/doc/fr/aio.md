module **browser.aio**
-----------------------

Ce module permet de gérer la programmation asynchrone en Brython en utilisant
les mots-clés `async` et `await`.

Il remplace le module **asyncio** de la distribution standard CPython, qui ne
peut pas fonctionner dans le contexte du navigateur:

1. il utilise des fonctions bloquantes comme `run()` ou `run_until_complete()`,
or le mode de fonctionnement des navigateurs ne permet pas de définir des
fonctions dont l'exécution est suspendue dans l'attente d'un événement.

2. le navigateur possède sa propre boucle d'événements, il n'est pas possible
d'en définir une autre comme le fait **asyncio** avec la fonction
`set_event_loop()`

Le module **browser.aio** définit les fonctions asynchrones suivantes:

### Requêtes Ajax

`ajax(`_method, url[, format="text", headers=None, data=None, cache=False]_`)`

> `req = await ajax("GET", url)` suspend l'exécution d'une fonction asynchrone
> jusqu'à ce que la requête Ajax de type _method_ ("GET", "POST", "PUT", etc.)
> vers l'URL spécifiée soit effectuée. La valeur de retour est une instance de
> la classe `Request` (voir ci-dessous).

> _format_ est le format de réponse attendu. Les valeurs possibles sont:

>> "text" : le contenu du fichier est renvoyé comme chaine de caractères

>> "binary" : une instance de la classe `bytes`

>> "dataURL" : une chaine de caractères au format
>> [dataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)

> _headers_ est un dictionnaire avec les entêtes HTTP à envoyer avec la
> requête.

> _data_ est une chaine de caractères, ou un dictionnaire qui sera converti en
> chaine de caractères pour former la chaine de requête ("query string") pour
> la méthode "GET" et en corps de la requête pour "POST".

> _cache_ est un booléen qui indique s'il faut utiliser le cache du navigateur

`get(`_url[, format="text", headers=None, data=None, cache=False]_`)`

> raccourci pour `ajax("GET", url...)`

`post(`_url[, format="text", headers=None, data=None]_`)`

> raccourci pour `ajax("POST", url...)`

#### Objets `Request`

Les instances de la classe `Request`, retournées par `await ajax()`,
`await get()` ou `await post()`, possèdent les attributs suivants:

> `data` : le contenu du fichier, au format défini par l'argument _format_

> `response_headers` : un dictionnaire correspondant aux entêtes de réponse

> `status` : statut de la réponse HTTP sous forme d'entier (200, 404...)

> `statusText` : statut de la réponse HTTP sous forme de chaine de
> caractères ("200 Ok", "404 File not found"...)


### Autres fonctions asynchrones

`event(`_element, name_`)`

> `evt = await aio.event(element, "click")` suspend l'exécution d'une fonction
> asynchrone jusqu'à ce que l'utilisateur clique sur l'élément spécifié. La
> valeur de retour est une instance de la classe `DOMEvent` (cf. la section
> [événements](events.html))

`sleep(`_seconds_`)`

> Dans une fonction asynchrone, `await sleep(n)` rend le contrôle au programme
> principal, et reprend l'exécution de la fonction au bout de `n` secondes.

### Exécuter une fonction asynchrone

`run(`_coroutine_`)`

> Exécute une coroutine, c'est-à-dire le résultat de l'appel d'une fonction
> asynchrone. Cette fonction est _non bloquante_ : elle n'attend pas que la
> fonction appelée soit terminée pour exécuter les instructions sur les lignes
> suivantes. Le moment où la ligne suivante est exécutée n'est pas
> (facilement) prévisible.

### Futures

`aio` implemente une class `Future` qui s'inspire de la class du même nom dans
`asyncio`. Celle-ci vous permet de convertir des fonctions utilisant des
callbacks en fonctions asynchrones pouvant être utilisées avec le mot clef
`await`.

La version de Brython est basique, elle n'implémente à l'heure actuelle que les
méthodes `set_result` et `set_exception`. Veuillez vous réferer à 
[la documentation de asyncio](https://docs.python.org/3/library/asyncio-future.html)
pour les détails.

### Exemples

Saisie de texte dans un élément INPUT

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

Lecture de fichiers

```python
from browser import document, html, aio

async def main():
    req = await aio.ajax("GET", "test.html")
    print(len(req.data))
    req = await aio.get("eraser.png", format="binary")
    print(len(req.data))
    req = await aio.get("eraser.png", format="dataURL")
    document <= html.IMG(src=req.data)

aio.run(main())
```

Utiliser une fonction avec des callbacks

```python
from browser import timer, aio

async def main():
    fut = aio.Future()
    timer.set_timeout(lambda: fut.set_result("timeout!"), 2000)
    print("awaiting...")
    result = await fut
    print(f"future awaited, result: {result}")

aio.run(main())
```
