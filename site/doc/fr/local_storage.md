module **browser.local_storage**
--------------------------------

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

Le **stockage local HTML5** est implémenté par Brython avec le module
`browser.local_storage`. Ce module définit un objet `storage` qui est utilisé
comme un dictionnaire Python classique.

Voici un exemple simple:

>    from browser.local_storage import storage
>    storage['foo']='bar'
>    print(storage['foo'])

Maintenant, si vous fermez la page, le navigateur, ou même l’ordinateur, la
valeur stockée sous la clef `'foo'` dans la base de donnée correspondant au
même `protocole://domaine:port` sera encore accessible en utilisant le même
navigateur.

Pour supprimer de façon permanente une paire clef-valeur:

>    del storage['foo']
>    print(storage['foo']) # raises KeyError

Un exemple plus complet utilisant `local_storage`, une TO-DO list,est affichée
dans l’iframe ci-dessous.

<iframe src="../en/examples/local_storage/local-storage-example.html" width=800, height=500></iframe>

