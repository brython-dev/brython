module **browser.ajax**
-----------------------

Ce module permet d'exécuter des requêtes Ajax. Il définit une seule classe :

`Ajax()`
> Renvoie un objet ajax

Cet objet possède les attributs et méthodes suivants :

`bind(`_evt,fonction_`)`
> Attache la _fonction_ à l'événement _evt_. _evt_ est une chaine de
> caractères correspondent aux différents états de la requête :

- "uninitialized" : non initialisé
- "loading" : connexion établie
- "loaded" : requête reçue
- "interactive" : réponse en cours
- "complete" : terminé

> La _fonction_ prend un seul argument, qui est l'objet `ajax`

`open(`_methode, url, async_`)`
> _methode_ est la méthode HTTP utilisée pour la requête (habituellement GET
> ou POST).

> _url_ est l'url appelée.

> _async_ est un booléen qui indique si l'appel est asynchrone (le script qui
> a effectué la requête continue de s'exécuter sans attendre la réponse à
> cette requête) ou non (l'exécution du script s'arrête en attendant la
> réponse).

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

`set_header(`_nom,valeur_`)`
> affecte la valeur _valeur_ à l'entête _nom_.

`set_timeout(`_duree, fonction_`)`
> si la requête n'a pas renvoyé de réponse dans les _duree_ secondes, annule
> la requête et exécute la _fonction_. Cette fonction ne prend pas d'argument.

`send(`_[data]_`)`
> lance la requête. L'argument optionnel _data_ n'est pris en charge que si la
> méthode est POST ; il doit s'agir soit d'un dictionnaire, soit d'une chaine
> de caractères.

`status`
> un entier représentant le statut HTTP de la requête. Les valeurs les plus
> courantes sont 200 (ok) et 404 (fichier non trouvé).

`text`
> la réponse du serveur sous forme de chaine de caractères.

`xml`
> la réponse du serveur sous forme d'objet DOM.

### Example

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

`get(`_url[, blocking=False, headers={}, mode="text", timeout=None, cache=False, data="", **callbacks]_`)`

et de même pour `delete`, `head` et `options`.

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

et de même pour `put`.

> _blocking_ est un booléen qui indique si la requête doit être bloquante
> ou non. La valeur par défaut est `False` (la requête est asynchrone)

> _headers_ est un dictionnaire avec les clés-valeurs des entêtes HTTP

> _mode_ est le mode de lecture : "text" ou "binary"

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

`file_upload(`_url, file, [**callbacks]_`)`

> _file_ est l'objet fichier à envoyer vers l'_url_, typiquement le résultat
> d'une expression
<blockquote>
```python
for file in document["choosefiles"].files:
    ...
```
</blockquote>

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
