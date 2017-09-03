module **browser.webworker**
----------------------------

Le module **webworker** fournit une intégration basique entre Brython et les
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

Il permet d'exécuter un script Python dans un "travailleur" (web worker) de
façon relativement simple. Deux classes sont fournies : `Worker` et
`RPCWorker`.


## Classe Worker

Cette classe permet d'exécuter un script dans le travailleur et de communiquer
avec lui par envoi de messages.

Pour démarrer le travailleur, on crée une instance de la classe `WorkerParent`.
Le constructeur prend comme arguments l'url du script à exécuter (absolue ou
relative au répertoire du code source Brython), les arguments passés au script
(disponibles par `sys.argv` dans le script) et le contenu de `os.environ` pour
le script.

```python
from browser import webworker as ww
w = ww.WorkerParent('web_workers/test_worker.py', [1, 2, 3], {"test": "Ahoj"})
```

La communication avec le travailleur s'effectue par envoi de messages,
représentés par la classe `Message`. Notez qu'alors qu'il faut attendre un
certain temps avant que le travailleur soit prêt (ce qui se traduit par un
statut `w.status` égal à `S_RUNNING`), on peut commencer à lui envoyer des
messages immédiatement (ils sont mis dans une file d'attente et envoyés quand
le travailleur est prêt).

```python
m = ww.Message('ping', "salut")
r = w.post_message(m, want_reply=True)
```

L'envoi du message est fait par la méthode `WorkerCommon.post_message`, qui
prend comme paramètres le message (instance de la classe `Message`) et
`want_reply` qui indique si on veut attendre une réponse au message. Le
résultat est une instance de `asyncio.Future` qui sera résolue quand la
réponse arrivera.

On peut ajouter un paramètre `timeout`, le temps (en secondes) après lequel
le _future_ échoue si on n'a pas reçu de réponse.

Si on veut ignorer la réponse, ou qu'on n'en attend pas, on peut omettre les
deux paramètres et faire seulement

```python
w.post_message(ww.Message('quit', None))
```

Implémenter le travailleur est très simple. On définit d'abord les méthodes qui
vont traiter les différents messages:

```python
from browser.webworker import current_worker, Message
from browser import console

from sys import argv
from os import environ

def pong(self, message, **_):
    print('Le Web worker a reçu le message (',message.id,')', message.name,
        message.data)
    current_worker.post_reply(message, Message('pong', message.data))

def quit(self, *args, **kwargs):
    current_worker.terminate()

```

Remarquez l'utilisation de `current_worker.post_reply` au lieu de
`current_worker.post_message` pour indiquer que le message est une réponse au
message reçu.

Ensuite il faut associer ces méthodes aux messages correspondants. Ceci est
fait par la méthode `WorkerCommon.bind_message`. Son premier argument est le
nom du message et le second est la méthode à appeler quand le message
arrive.

```
current_worker.bind_message('ping', pong)
current_worker.bind_message('quit', quit)
```

Enfin il faut dire au parent qu'on est prêt à accepter des message. Pour cela
on utilise la méthode `current_worker.exec`.

```python
print("Début du worker de test avec les arguments:", argv,
    "et l'environnement", environ)
current_worker.exec()
```

`current_worker` est une instance de la classe `WorkerChild` est n'est
disponible que dans le travailleur.


## Classe RPCWorker

Les classes `WorkerParent` et `WorkerChild` qui représentent les deux côtés
de la connection sont très simples et peuvent être utilisés pour construire
des travailleurs plus utiles. Par exemple les classes `RPCWorkerParent` et
`RPCWorkerChild` qui sont utiles dans un scénario où nous voudrions
exécuter des méthodes Python dans un travailleur comme si elles étaient
dans le fil d'exécution principal.

Un programme pourrait typiquement se présenter ainsi:

```python
from browser import webworker as ww
from asyncio import coroutine

@coroutine
def main(w):
    # Attente du démarrage du travailleur
    yield w.wait_for_status(ww.S_RUNNING)

    # Appel de la méthode distante "add"
    a = yield w.add(10,20)
    assert a == 30

    # Appel de la méthode distante "log"
    yield w.log("Message de sortie")

    # Destruction du travailleur
    w.terminate()

# Création d'une nouvelle instance de travailleur
w = ww.RPCWorkerParent('web_workers/test_rpc.py', [1, 2, 3],
    {"USER":"personne"})

# Exécute la méthode principale
main(w)
```

La différence avec l'exemple `WorkerParent` est qu'il faut maintenant
réellement attendre que le travailleur ait démarré (jusque là nous ne savons
pas quelles méthodes il expose). Il faut donc tout envelopper dans une
coroutine `main` (`async def` dans les versions récentes de Python), où nous
pouvons attendre que le travailleur soit prêt par un `yield from` (`await`)
depuis la méthode `WorkerCommon.wait_for_status`.

On appelle ensuite la méthode `add`, qui doit être définie dans le
travailleur, où elle est exécutée. La méthode retourne une instance de
`asyncio.Future` qui représente la valeur de retour de l'appel de méthode. Le
`yield` dans la coroutine met en pause sont exécution jusqu'à ce qu'il soit
disponible. On appelle ensuite la méthode `log` et pour finir on clôt le
travail par la méthode `WorkerCommon.terminate`.

L'implémentation de la partie travailleur est très proche du cas précédent. La
principale différence est qu'à la place de `WorkerCommon.bind_message` on
utilise la méthode `RPCWorkerChild.register_method`:

```python
from browser.webworker import current_worker, Message
from browser import console

from sys import argv
from os import environ

def add(x, y):
    """Additionne deux nombres"""
    return x+y

def log(*args):
    print(*args)

# Enregistre les méthodes `add` et `log`.
current_worker.register_method(add)
current_worker.register_method(log)


# Dit au parent qu'on est prêt
print("Lancement du travailleur RPC de test avec les arguments:", argv,
    "et l'environment", environ)
current_worker.exec()
```


## Création de nouvelles classes `Worker`

Chaque nouveau type de travailleur nécessite deux classes, Parent et Enfant,
pour représenter le travailleur dans le fil d'exécution principal et dans le
thread du travailleur. Elles sont reliées à travers l'attribut `CHILD_CLASS`
de la classe Parent. Il doit d'agir d'une chaine de caractères qui peut être
utilisé pour importer la classe Enfant dans le travailleur (par exemple
pour la classe `RPCWorkerParent` l'attribut vaut
`"browser.webworker.RPCWorkerChild"`).

Le module se charge ensuite d'instancier la classe Enfant dans le travailleur
et de le stocker dans `webworker.current_worker`.
