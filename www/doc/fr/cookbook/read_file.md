Problème
--------

Lire le contenu d'un fichier


Solution
--------

On utilise la fonction intégrée `open()` pour récupérer le contenu du fichier

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

```exec
from browser import document
import time
fake_qs = '?foo=%s' %time.time()
document['zone'].value = open('file.txt'+fake_qs).read()
```

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Contenu Initial</textarea>
</td>
</tr>
</table>

Noter la chaine de requête (query string) avec une valeur aléatoire à la fin du nom de fichier : elle est nécessaire pour rafraichir le résultat si le fichier source a été modifié entre deux appels

L'exemple suivant ajoute une fonction de dépassement de délai qui affiche un message au cas où le fichier n'aurait pas été trouvé au bout de 4 secondes :

```python
from browser import document as doc
import time

def on_complete(req):
    if req.status==200 or req.status==0:
        doc["zone"].value = req.text
    else:
        doc["zone"].value = "error "+req.text

def err_msg():
    doc["zone"].text = "le serveur n'a pas répondu après %s secondes" %timeout

timeout = 4

def go(url):
    req = ajax()
    req.bind("complete", on_complete)
    req.set_timeout(timeout,err_msg)
    req.open('GET',url,True)
    req.send()

go('file.txt?foo=%s' %time.time())
```


