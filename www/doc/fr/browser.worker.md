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

Le script principal et le travailleur communiquent par _messages_. Un
_message_ doit être un objet Python "simple" : chaine de caractères, nombre,
liste avec des items "simples", dictionnaires avec des clés et valeurs
"simples".

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

L'attribut `id` permet au script principal de référencer le script travailleur.

### Utilisation d'un travailleur depuis le script principal

Le script principal crée un objet travailleur en utilisant la fonction
`create_worker`:

`create_worker(`_worker_id, onready=None, onmessage=None, onerror=None_`)`

> déclenche la création d'un _objet travailleur_ (voir ci-dessous), à partir
> du script référencé par l'identifiant _worker_id_ (l'attribut `id` de la
> balise du script travailleur)
>
> _onready_ est la fonction appelée quand la création du travailleur est
> terminée. Elle prend un seul argument, l'_objet travailleur_
>
> _onmessage_ est la fonction appelée quand le script principal reçoit un
> message de la part du travailleur. Elle prend un argument unique, un
> objet événement, qui possède deux attributs principaux: `data` (le message
> envoyé par le travailleur) et `target` (l'_objet travailleur_)
>
> _onerror_ est la fonction appelée s'il y a une erreur dans le travailleur.
> Elle prend un argument unique, le message d'erreur
> (une chaine de caractères)

L'_objet travailleur_ possède une méthode:

`send(`_message_`)`

> envoie un message au travailleur

### Fonctionnement d'un travailleur

Dans un travailleur, le module **browser** ne possède pas tous les attributs
habituels qui permettent de manipuler un document : par exemple l'attribut
`document` n'est pas défini, ni le module `html`.

L'attribut `window` lui-même n'est pas défini; à la place, un attribut `self`
représente le travailleur et permet de gérer la relation avec le script
principal auquel il est associé.

L'objet `browser.self` possède les méthodes suivantes:

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

> envoie un message au script principal

### Exemple

La galerie fournit un [exemple de mise en oeuvre](/gallery/webworker_mdn.html)
d'un Web Worker en Brython.

Code du script principal:

```python
"""Main script."""

from browser import bind, document, worker

result = document.select_one('.result')
inputs = document.select("input")

def onmessage(e):
    """Handles the messages sent by the worker."""
    result.text = e.data

def onready(myWorker):

    @bind(inputs, "change")
    def change(evt):
        """Called when the value in one of the input fields changes."""
        # Send a message (here a list of values) to the worker
        myWorker.send([x.value for x in inputs])

# Create a web worker, identified by a script id in this page.
worker.create_worker("worker", onready, onmessage)
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
        # In the main script, it will be handled by the function passed as the
        # argument "onmessage" of create_worker().
        self.send(workerResult)
    except ValueError:
        self.send('Please write two numbers')
```

### La classe `Worker` (dépréciée en version 3.12)

Pour la compatibilité ascendante, le module expose une class dépréciée pour
créer un travailleur dans le script principal

`Worker(`_worker_id_`)`

> retourne un objet travailleur, à partir du script référencé par
> l'identifiant _worker_id_ (l'attribut `id` de la balise du script
> travailleur)

Cette version n'est pas asynchrone, l'objet travailleur peut être utilisé
immédiatement.

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

> envoie un message au travailleur