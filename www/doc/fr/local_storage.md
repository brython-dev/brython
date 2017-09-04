modules **browser.local\_storage** et **browser.session\_storage**
-------------------------------------------------------------------

Ce module utilise le stockage local défini par HTML5
([voir la spécification](http://dev.w3.org/html5/webstorage/#the-localstorage-attribute)).

Qu’est-ce que le stockage local?

- C’est une base de donnée clé-valeur sur le client, le navigateur. Cela
  signifie que les données de l’utilisateur sont stockées sur leur machine.
  Cela signifie aussi que ces données ne sont accessibles que si l’utilisateur
  est devant cette même machine, avec ce même navigateur. Notez bien que
  `local_storage` est associé à un navigateur et non à un ordinateur.
- Les clés et les valeurs sont des chaînes de caractères donc si vous entrez
  par exemple une liste, vous ne récupèrerez pas une liste mais une chaîne
  de caractère qui la représente. C’est très important!!!
- Les données dont stockées pour pour un protocole, un domaine et un port.
  Les bases de données `local_storage` sont attachées à une origine HTML5,
  c’est-à-dire ce tuple (protocole, domaine, port) sous la forme
  `protocole://domaine:port`. Cela veut dire que la base de données est partagée
  entre toutes les pages d’un même domaine, éventuellement de façon
  concurrente par plusieurs onglets du navigateur. Cependant, une page en
  `http://` ne peut pas voir une base de données créée lors d’une session
  `https://`.

HTML5 définit deux types de stockage, le _stockage local_ et le _stockage par_
_session_ ; le premier est _persistant_, c'est-à-dire qu'il conserve les 
données stockées quand l'utilisateur ferme la fenêtre du navigateur ; le
second les perd quand la fenêtre du navigateur est fermée.

Le **stockage local HTML5** est implémenté par Brython dans le paquetage 
**browser** sous forme de deux modules :

- **local_storage**
> Ce module expose un objet unique, `storage`, qui donne accès au _stockage_
> _local_. On peut interagir avec lui comme avec un dictionnaire, 
> en se souvement que les clés et les valeurs sont limités à des chaines.
- **session_storage**
> Ce module expose aussi l'object `storage`, qui donne accès au _stockage de_
> _session_. Son interface est la même que **local_storage**. Utilisez
> **session_storage** quand vous ne voulez pas partager les données entre
> sessions ou onglets. C'est typiquement le cas pour un jeton 
> d'enregistrement.

Voici un exemple simple:

```python
from browser.local_storage import storage
storage['foo']='bar'
print(storage['foo'])
```

Maintenant, si vous fermez la page, le navigateur, ou même l’ordinateur, la
valeur stockée sous la clef `'foo'` dans la base de donnée correspondant au
même `protocole://domaine:port` sera encore accessible en utilisant le même
navigateur.

Pour supprimer de façon permanente une paire clef-valeur:

```python
del storage['foo']
print(storage['foo']) # déclenche KeyError
```

L'objet `storage` copie l'interface d'un dictionnaire, et supporte:

- `get`
- `pop`
- `keys`
- `values`
- `items`
- `clear`
- `__len__`
- `__contains__`
- `__iter__`

Notez que `keys`, `values`, et `items` retournent une liste au lieu d'un 
itérateur.

Un exemple plus complet utilisant `local_storage`, une TO-DO list,est affichée
dans l’iframe ci-dessous.

<iframe src="../en/examples/local_storage/local-storage-example.html" width=800, height=500></iframe>

