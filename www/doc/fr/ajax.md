module **browser.ajax**
-----------------------

Ce module permet d'exécuter des requêtes Ajax.

La syntaxe de l'API Web normalisée peut être utilisée (voir ci-dessous) mais
Brython propose une syntaxe plus concise: pour chaque méthode de requête (GET,
POST, etc.) le module définit une fonction spécifique.

## Méthodes sans corps de données

`connect(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

`delete(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

`head(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

`get(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

`options(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

`trace(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

> _url_ est l'adresse de la ressource appelée

> _blocking_ est un booléen qui indique si la requête doit être bloquante
> ou non. La valeur par défaut est `False` (la requête est asynchrone)

> _headers_ est un dictionnaire avec les clés-valeurs des entêtes HTTP

> _mode_ est le mode de lecture : "text", "binary", "json", "document"

> si _mode_ est "text", _encoding_ est l'encodage du fichier texte

> _timeout_ est la durée en secondes après laquelle la requête est abandonnée

> _cache_ est un booléen qui indique si la requête doit utiliser le cache du
> navigateur

> _data_ est soit une chaine de caractères, soit un dictionnaire. Si c'est un
> dictionnaire, il est converti en une chaine de la forme `x=1&y=2` ajoutée à
> l'_url_

> _**callbacks_ est un dictionnaire avec comme clés des noms de la forme
> `on` + nom d'événement (`onloaded`, `oncomplete`...) et comme valeur la
> <a href="#callback">fonction de rappel</a> qui gère cet événement

## Méthodes avec corps de données

`patch(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

`put(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

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
fonction on peut utiliser les attributs et méthodes suivant de cet objet:

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
- "timeout" : la durée maximum est atteinte



## Exemples

Lecture d'un fichier texte

```python
from browser import ajax

def read(req):
    print(req.text)

req = ajax.get("test.txt", oncomplete=read)
```

Si le fichier texte est encodé autrement qu'en UTF-8 on spécifie l'encodage

```python
from browser import ajax

def read(req):
    print(req.text)

req = ajax.get("test-latin1.txt", encoding="latin1", oncomplete=read)
```

Lecture d'un fichier texte sous forme d'octets

```python
from browser import ajax

def read(req):
    assert isinstance(req.text, bytes)

req = ajax.get("test.txt", mode="binary", oncomplete=read)
```


Lecture d'un fichier au format JSON

```python
from browser import ajax

def read(req):
    print(req.json)

req = ajax.get("test.json", mode="json", oncomplete=read)
```





## Interface standard Web API

Il définit une seule classe :

`Ajax()`
> Renvoie un nouvel objet Ajax

## Fonction de rappel

`bind(`_evt, fonction_`)`
> Attache la _fonction_ à l'événement _evt_. _evt_ est une chaine de
> caractères correspondent aux différents états de la requête :

- "uninitialized" : non initialisé
- "loading" : connexion établie
- "loaded" : requête reçue
- "interactive" : réponse en cours
- "complete" : terminé

> La _fonction_ prend un seul argument, qui est l'objet `ajax`

## Ouverture de la connexion

`open(`_methode, url, async_`)`
> _methode_ est la méthode HTTP utilisée pour la requête (habituellement GET
> ou POST).

> _url_ est l'url appelée.

> _async_ est un booléen qui indique si l'appel est asynchrone (le script qui
> a effectué la requête continue de s'exécuter sans attendre la réponse à
> cette requête) ou non (l'exécution du script s'arrête en attendant la
> réponse).

Quand la requête est ouverte, on peut spécifier certaines de ses propriétés

`encoding`
> si la ressource spécifiée par l'url appelée est un fichier texte, `encoding`
> est l'encodage de ce fichier.

`overrideMimeType(`_mimetype_`)`
> spécifie le type Mime attendu (cf. [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType))

`responseType`
> le type de réponse attendu (cf. [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType))

`set_header(`_nom,valeur_`)`
> affecte la _valeur_ à l'entête _nom_.

`set_timeout(`_duree, fonction_`)`
> si la requête n'a pas renvoyé de réponse dans les _duree_ secondes, annule
> la requête et exécute la _fonction_. Cette fonction ne prend pas d'argument.


`readyState`
> un entier représentant l'état d'avancement de la requête, selon le tableau
> ci-dessous :

<blockquote>
<table cellspacing=0 cellpadding=4 border=1>
<tr><th>
readyState
</th><th>
événement
</th></tr>
<tr><td align="center">0</td><td>"uninitialized"</td></tr>
<tr><td align="center">1</td><td>"loading"</td></tr>
<tr><td align="center">2</td><td>"loaded"</td></tr>
<tr><td align="center">3</td><td>"interactive"</td></tr>
<tr><td align="center">4</td><td>"complete"</td></tr>
</table>
</blockquote>

> Si la méthode _overrideMimeType()_ n'est pas explicitement appelée, le fait
> de donner une valeur à `encoding` donne au type Mime la valeur
> "text/plain;charset=x-user-defined".

> Ceci permet de récupérer comme valeur de l'attribut `text` le contenu
> du fichier dans l'encodage spécifié

`send(`_[data]_`)`
> lance la requête. L'argument optionnel _data_ n'est pris en charge que si la
> méthode est POST ; il doit s'agir soit d'un dictionnaire, soit d'une chaine
> de caractères.

`status`
> un entier représentant le statut HTTP de la requête. Les valeurs les plus
> courantes sont 200 (ok) et 404 (fichier non trouvé).

`json`
> si l'attribut `responseType` a la valeur "json", donne la réponse du serveur
> comme l'objet sérialisé au format json.

`text`
> la réponse du serveur sous forme de chaine de caractères.

> utilise l'attribut `encoding` ci-dessus s'il a été spécifié.

`xml`
> la réponse du serveur sous forme d'objet DOM.

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

### Raccourcis

Les appels peuvent être effectués plus simplement avec les
fonctions correspondantes :

`get(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

et de même pour `delete`, `head` et `options`.

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

et de même pour `put`.

> _blocking_ est un booléen qui indique si la requête doit être bloquante
> ou non. La valeur par défaut est `False` (la requête est asynchrone)

> _headers_ est un dictionnaire avec les clés-valeurs des entêtes HTTP

> _mode_ est le mode de lecture : "text", "binary", "json", "document"

> si _mode_ est "text", _encoding_ est l'encodage du fichier texte

> _cache_ est un booléen qui indique si la requête GET doit utiliser le cache
> du navigateur

> _data_ est soit une chaine de caractères, soit un dictionnaire. Si c'est un
> dictionnaire, il est converti en une chaine de la forme `x=1&y=2`

> _timeout_ est la durée en secondes après laquelle la requête est abandonnée

> _**callbacks_ est un dictionnaire avec comme clés des noms de la forme
> `on` + nom d'événement (`onloaded`, `oncomplete`...) et comme valeur la
> fonction qui gère cet événement. La clé `ontimeout` a pour valeur la
> fonction à appeler si la durée définie dans _timeout_ est dépassée.

Dans la fonction de rappel, l'objet Ajax possède une méthode _read()_ qui lit
le contenu de la réponse sous forme de chaine si le mode est "text" et sous
forme de `bytes` si le mode est "binary".

L'exemple ci-dessus peut être réécrit de la façon suivante:

```python
from browser import document, ajax

def on_complete(req):
    if req.status == 200:
        document["result"].html = req.text
    else:
        document["result"].html = "error " + req.text

ajax.post(url,
          data={'x': 0, 'y': 1},
          oncomplete=on_complete)
```

Lecture d'un fichier en mode binaire:

```python
from browser import ajax

def read(f):
    data = f.read()
    assert isinstance(data, bytes)

req = ajax.get("tests.zip", mode="binary",
    oncomplete=read)
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
