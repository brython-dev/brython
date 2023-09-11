Options d'exécution
===================

Un certain nombre d'options sont disponibles pour personnaliser l'exécution
des scripts. Ces options peuvent être définies au niveau de la page HTML, ou
par script.

Définition des options
----------------------

La déclaration d'options valables pour toute la page se fait par les attributs
d'une balise spécifique `<brython-options>`. Par exemple pour définir
les options `debug` et `cache`:

```xml
<brython-options debug="1" cache="true">
</brython-options>
```

Pour définir une option pour un script spécifique, il faut la définir dans la
balise `<script>`:

```xml
<script type="text/python" debug="2">
```

Options disponibles seulement au niveau page
--------------------------------------------

*ids*

> par défaut, tous les scripts de la page sont exécutés. Cette option
> spécifie la liste des identifiants des scripts à exécuter (attribut `id` de la
> balise) sous forme d'une liste séparée par des espaces.
>
> Si la chaine est vide, aucun script n'est exécuté.

<blockquote>
```xml
<brython-options ids="scriptA scriptB"></brython-options>
```
</blockquote>

*indexedDB*

> indique si le programme peut utiliser la base indexedDB pour
> stocker une version précompilée des modules situés dans __brython_stdlib.js__
> ou __brython_modules.js__. Vaut `true` par défaut.

Options disponibles au niveau page ou par script
------------------------------------------------

Une option définie pour un script a priorité sur une option définie au niveau
de la page.

*args*

> équivalent des arguments passés en ligne de commande, disponibles dans le
> programme par `sys.argv`. Les valeurs sont des chaines de caractères.

*cache* : utilisation du cache du navigateur

> si la valeur est `true`, les appels Ajax pour importer des
> modules, charger des scripts externes par `<script src="foo.py">` ou lire
> des fichiers avec `open()` utilisent le cache du navigateur. Vaut `false`
> par défaut

*debug* : le mode de débogage

- 0 (valeur par défaut) : aucun débogage. A utiliser quand l'application est
  au point, cela accélère légèrement l'exécution
- 1 : les messages d'erreur sont imprimés dans la console du navigateur (ou
  vers la sortie spécifiée par `sys.stderr`)
- 2 : la traduction du code Python en code Javascript est affichée dans la
  console
- 10 : la traduction du code Python et des modules importés est affichée dans
  la console

*pythonpath*

> une liste, séparée par des espaces, de chemins dans lesquels chercher les
> modules importés

*static\_stdlib\_import*

> booléen qui indique si, pour importer des modules
> ou des paquetages de la bibliothèque standard, on se sert du tableau de
> correspondance statique du script __stdlib\_paths.js__. Vaut `true` par
> défaut

La fonction <i>brython(options)</i>
-----------------------------------

Dans les versions de Brython antérieures à 3.12, les options ne pouvaient
être définies que pour l'ensemble des scripts de la page, et étaient passées
comme argument de la fonction `brython()` appelée explicitement au
chargement de la page par la syntaxe

```xml
<body onload="brython({debug: 2})">
```

Cette syntaxe reste utilisable dans la version 3.12.

Si la page définit une balise `<brython-options>`, les valeurs passées à la
fonction `brython()` remplacent celles de la balise.