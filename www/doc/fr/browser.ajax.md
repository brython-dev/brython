module **browser.ajax**
-----------------------

Ce module permet d'exécuter des requêtes Ajax.

La syntaxe de l'API Web normalisée peut être utilisée (voir ci-dessous) mais
Brython propose une syntaxe plus concise: pour chaque méthode de requête (GET,
POST, etc.) le module définit une fonction spécifique.

## Méthodes sans corps de données

`get(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

et même interface pour `connect, delete, head, options` et `trace`.

> _url_ est l'adresse de la ressource appelée

> _blocking_ est un booléen qui indique si la requête doit être bloquante
> ou non. La valeur par défaut est `False` (la requête est asynchrone)

> _headers_ est un dictionnaire avec les clés-valeurs des entêtes HTTP

> _mode_ est le mode de lecture : "text", "binary", "json", "document"

> si _mode_ est "text", _encoding_ est l'encodage du fichier texte

> _timeout_ est la durée en secondes après laquelle la requête est abandonnée

> _cache_ est un booléen qui indique si la requête doit utiliser le cache du
> navigateur. Par défaut il n'est pas utilisé et un paramètre numérique est
> automatiquement ajouté à la requête

> _data_ est soit une chaine de caractères, soit un dictionnaire. Si c'est un
> dictionnaire, il est converti en une chaine de la forme `x=1&y=2` ajoutée à
> l'_url_

> _**callbacks_ est un dictionnaire avec comme clés des noms de la forme
> `on` + nom d'événement (`onloaded`, `oncomplete`...) et comme valeur la
> <a href="#callback">fonction de rappel</a> qui gère cet événement

## Méthodes avec corps de données

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

et même interface pour `patch` et `put`.

Les paramètres ont la même signification que pour les méthodes sans corps
de données. Les paramètres _mode, encoding_ et _cache_ ne sont pas
pertinents pour ces méthodes.

Les données fournies dans _data_ constituent le corps de données. S'il s'agit
d'un dictionnaire, il est transformé de façon transparente. La longueur du
corps de données (entête "Content-Length") est calculée automatiquement.

<a name="callback"></a>
## Fonction de rappel

Les fonctions de rappel sont appelées quand un événement se produit sur
l'objet Ajax.

Les événements possibles sont:

- "uninitialized" : non initialisé
- "loading" : connexion établie
- "loaded" : requête reçue
- "interactive" : réponse en cours
- "complete" : terminé

En pratique, on ne définit généralement que la fonction correspondant à
l'événement "complete".

Cette fonction prend un seul argument, l'objet requête. Dans le corps de la
fonction on peut utiliser les attributs et méthodes suivants de cet objet:

`status`

> un entier décrivant le code HTTP de la réponse : 200 si la ressource a été
> atteinte, 404 si elle n'existe pas, etc.

`text`

> le contenu de la réponse : instance de `str` si le mode de la requête est
> "text", "json" ou "xml", instance de `bytes` si le mode est "binary"

`json`

> si le mode de la requête est "json", l'attribut `json` est l'objet résultant
> de la désérialisation de la chaine JSON envoyée en réponse

`xml`

> si le mode de la requête est "document", l'attribut `xml` est l'objet
> contenant l'arbre XML obtenu à partir de la réponse

`read()`

> lit le contenu de la réponse en tenant compte du mode de la requête

L'autre événement géré est "timeout", déclenché si la durée spécifiée dans
l'argument `timeout` est atteinte. Pour cet événement la fonction de rappel
ne prend pas d'argument.


## Exemples

Lecture d'un fichier texte

```python
from browser import ajax

def read(req):
    print(req.text)

ajax.get("test.txt", oncomplete=read)
```

Si le fichier texte est encodé autrement qu'en UTF-8 on spécifie l'encodage

```python
from browser import ajax

def read(req):
    print(req.text)

ajax.get("test-latin1.txt", encoding="latin1", oncomplete=read)
```

Lecture d'un fichier texte sous forme d'octets

```python
from browser import ajax

def read(req):
    assert isinstance(req.text, bytes)

ajax.get("test.txt", mode="binary", oncomplete=read)
```

Lecture d'un fichier binaire (par exemple une image)

```python
from browser import ajax

def read(req):
    assert isinstance(req.read(), bytes)

ajax.get("picture.png", mode="binary", oncomplete=read)
```


Lecture d'un fichier au format JSON

```python
from browser import ajax

def read(req):
    print(req.json)

ajax.get("test.json", mode="json", oncomplete=read)
```


## Interface standard Web API

On peut aussi écrire des requêtes Ajax avec une syntaxe proche de la
spécification Web API.

Le module expose la fonction `Ajax()`, sans paramètre, qui renvoie un nouvel
objet Ajax.

L'objet Ajax possède les méthodes suivantes:

`open(`_methode, url, async_`)`
> ouvre la connexion. _methode_ est la méthode HTTP utilisée pour la requête
> (habituellement GET ou POST).

> _url_ est l'url appelée.

> _async_ est un booléen qui indique si l'appel est asynchrone (le script qui
> a effectué la requête continue de s'exécuter sans attendre la réponse à
> cette requête) ou non (l'exécution du script s'arrête en attendant la
> réponse).

`bind(`_evt, fonction_`)`
> Attache la _fonction_ à l'événement _evt_. Les événements sont les mêmes que
> ci-dessus.
> La _fonction_ prend comme argument l'objet Ajax, qui possède les mêmes
> propriétés que ci-dessus

Quand la requête est ouverte, on peut spécifier certaines de ses propriétés:

`encoding`
> si la ressource spécifiée par l'url appelée est un fichier texte, `encoding`
> est l'encodage de ce fichier.

> si le type Mime (cf. [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType))
> n'est pas explicitement défini, le fait de donner une valeur à `encoding`
> donne au type Mime la valeur "text/plain;charset=x-user-defined".

> Ceci permet de récupérer comme valeur de l'attribut `text` le contenu
> du fichier dans l'encodage spécifié.

`responseType`
> le type de réponse attendu (cf. [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType))

`set_header(`_nom,valeur_`)`
> affecte la _valeur_ à l'entête _nom_.

`set_timeout(`_duree, fonction_`)`
> si la requête n'a pas renvoyé de réponse dans les _duree_ secondes, annule
> la requête et exécute la _fonction_. Cette fonction ne prend pas d'argument.

Toutes les propriétés des objets [XMLHTTPRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
peuvent être utilisées sur l'objet Ajax.

### Envoi de la requête

`send(`_[data]_`)`
> lance la requête. L'argument optionnel _data_ n'est pris en charge que si la
> méthode est POST, PUT ou PATCH ; il doit s'agir soit d'un dictionnaire, soit
> d'une chaine de caractères.

### Exemple

On suppose qu'il y a un DIV avec l'id _result_ dans la page HTML.

```python
from browser import document, ajax

def on_complete(req):
   if req.status == 200 or req.status == 0:
       document["result"].html = req.text
   else:
       document["result"].html = "erreur " + req.text

req = ajax.ajax()
req.bind('complete', on_complete)
# envoie une requête POST à l'url
req.open('POST', url, True)
req.set_header('content-type', 'application/x-www-form-urlencoded')
# envoie les données sous forme de dictionnaire
req.send({'x': 0, 'y': 1})
```

### Envoi de fichiers

Pour envoyer des fichiers saisis dans un formulaire par une balise du type
```xml
<input type="file" name="choosefiles" multiple="multiple">
```
on peut utiliser la fonction

`file_upload(`_url, file, method="POST", field_name="filetosave", [**callbacks]_`)`

> _file_ est l'objet fichier à envoyer vers l'_url_, typiquement le résultat
> d'une expression
<blockquote>
```python
for file in document["choosefiles"].files:
    ...
```
</blockquote>

> _method_ est la méthode à utiliser pour l'envoi du fichier ('POST' par
> défaut, mais peut prendre la valeur 'PUT')

> _field_name_ est le nom du champ associé au fichier envoyé, qui sera utilisé
> par le serveur pour récupérer les données

Exemple:
```xml
<script type="text/python">
from browser import ajax, bind, document

def upload_ok(req):
    print("c'est tout bon")

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
