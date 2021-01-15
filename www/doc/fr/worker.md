module **browser.worker**
-------------------------

Le module **worker** permet de faire fonctionner les
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
en Brython.

Un "travailleur" (worker) est un script Python qui reçoit des messages depuis
un script principal, et qui lui renvoie des messages en réponse. Le
travailleur est exécuté dans un fil d'exécution (thread) différent ; s'il
doit réaliser des calculs complexes, cela permet de ne pas bloquer le script
principal.

Un "travailleur" n'a pas accès à certaines fonctionnalités d'un script
ordinaire: par exemple, il ne peut pas accéder au document affiché dans le
navigateur, ni le modifier.

### Insérer un script travailleur dans une page HTML

Pour insérer un script travailleur dans une page HTML, on utilise une forme
particulière de la balise `<script type="text/python">`:

```xml
<script type="text/python" class="webworker" id="myworker">
# instructions Python du script travailleur
</script>
```

On peut aussi utiliser l'attribut `src` pour charger le script travailleur:

```xml
<script type="text/python" class="webworker" id="myworker" src="myworker.py">
</script>
```

L'ajout de la classe "webworker" indique qu'il ne faut pas exécuter le script
comme un script Python ordinaire, mais qu'il est destiné à être utilisé comme
travailleur pour un script principal.

L'attribut `id` permet au script principal de spécifier le script travailleur.

### Utilisation d'un travailleur depuis le script principal

Le script principal importe le module **browser.worker** et crée un objet
travailleur en utilisant la classe `Worker`:

`Worker(`_worker_id_`)`

> crée un objet travailleur à partir du script référencé par l'id _worker_id_.

Les instances de la classe `Worker` possèdent deux méthodes:

`bind(`_evt, fonction_`)`

> associe la _fonction_ à l'événement _evt_. L'événement principal est
> "message" : il est déclenché quand le travailleur envoie un message au
> script principal.

> La _fonction_ prend un seul paramètre, un objet événement qui possède
> en particulier l'attribut `data`, dont la valeur est le contenu du
> message envoyé par le travailleur.

> A noter qu'au lieu d'associer l'événement par la syntaxe

<blockquote>
```python
def callback(evt):
    ...

worker.bind("message", callback)
```
</blockquote>
> on peut utiliser la fonction `bind()` du module **browser** comme décorateur:
<blockquote>
```python
from browser import bind

@bind(worker, "message")
def callback(evt):
    ...
```
</blockquote>

`send(`_message_`)`

> envoie un message au travailleur. Le message est un objet Python simple:
> chaine de caractères, nombre, liste...

### Fonctionnement d'un travailleur

Dans un travailleur, le module **browser** ne possède pas tous les attributs
habituels qui permettent de manipuler un document : par exemple l'attribut
`document` n'est pas défini, ni le module `html`.

L'attribut `window` lui-même n'est pas défini; à la place, un attribut `self`
représente le travailleur et permet de gérer la relation avec le script
principal auquel il est associé.

L'objet `browser.self` possède des propriétés similaires à celles de l'objet
`Worker` du script principal:

`bind(`_evt, fonction_`)`

> associe la _fonction_ à l'événement _evt_. L'événement principal est
> "message" : il est déclenché quand le script principal envoie un message au
> travailleur.

> La _fonction_ prend un seul paramètre, un objet événement qui possède
> en particulier l'attribut `data`, dont la valeur est le contenu du
> message envoyé par le script principal.

> A noter qu'au lieu d'associer l'événement par la syntaxe

<blockquote>
```python
def callback(evt):
    ...

self.bind("message", callback)
```
</blockquote>
> on peut utiliser la fonction `bind()` du module **browser** comme décorateur:
<blockquote>
```python
from browser import bind, self

@bind(self, "message")
def callback(evt):
    ...
```
</blockquote>

`send(`_message_`)`

> envoie un message au script principal. Le message est un objet Python
> simple: chaine de caractères, nombre, liste...

### Exemple

La galerie fournit un [exemple de mise en oeuvre](/gallery/webworker_mdn.html)
d'un Web Worker en Brython.

Code du script principal:

```python
"""Main script."""

from browser import bind, document, worker

result = document.select_one('.result')
inputs = document.select("input")


# Create a web worker, identified by a script id in this page.
myWorker = worker.Worker("worker")

@bind(inputs, "change")
def change(evt):
    """Called when the value in one of the input fields changes."""
    # Send a message (here a list of values) to the worker
    myWorker.send([x.value for x in inputs])

@bind(myWorker, "message")
def onmessage(e):
    """Handles the messages sent by the worker."""
    result.text = e.data
```

Code du travailleur:

```python
"""Web Worker script."""

# In web workers, "window" is replaced by "self".
from browser import bind, self

@bind(self, "message")
def message(evt):
    """Handle a message sent by the main script.
    evt.data is the message body.
    """
    try:
        result = int(evt.data[0]) * int(evt.data[1])
        workerResult = f'Result: {result}'
        # Send a message to the main script.
        # In the main script, it will be handled by the function bound to
        # the event "message" for the worker.
        self.send(workerResult)
    except ValueError:
        self.send('Please write two numbers')
```
