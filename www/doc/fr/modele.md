Compilation et exécution
------------------------

### Vue d'ensemble

<table border=1 cellpadding =5>
<tr><td>Etape</td><td>réalisée par</td></tr>
<tr>
<td>Lecture du code source Python</td>
<td>fonction <code>brython(_debug\_mode_)</code> dans __py2js.js__

Si le code est dans un fichier externe, il est récupéré par un appel Ajax

  Cette fonction crée notamment les variables d'environnement suivantes :
  - `__BRYTHON__.$py_src` : objet indexé par les noms de module, contenant le code source du module
  - `__BRYTHON__.debug` : le niveau de débogage
  - `__BRYTHON__.exception_stack` : une liste avec les erreurs générées en cours d'analyse ou d'exécution
  -`__BRYTHON__.imported` : objet Javascript, fait correspondre les noms des modules importés aux objets modules
  -`__BRYTHON__.modules` : objet Javascript, fait correspondre les noms de modules aux objets module
  -`__BRYTHON__.vars` : objet Javascript, fait correspondre les noms de modules au dictionnaire des variables définies dans le module
</td>
</tr>

<tr>
<td>
création de l'arbre représentant le code Python
</td>
<td>
fonction `__BRYTHON__.py2js(`_source,module_`)` dans __py2js.js__

Cette fonction appelle :

- <code>$tokenize(_source_)</code> : analyse syntaxique des jetons dans le code source Python et contruction d'un arbre ;
 renvoie la racine de l'arbre
- <code>transform(_root_)</code> : transforme l'arbre pour préparer la conversion en Javascript (cf ci-dessous)
- `$add_line_num()` pour ajouter les numéros de ligne si le mode de débogage est supérieur à 0

Renvoie la racine de l'arbre
</td>
</tr>

<tr>
<td>génération du code Javascript</td>
<td>méthode `to_js()` de l'arbre renvoyé par `__BRYTHON__.py2js()`

Cette fonction appelle la méthode de même nom sur tous les éléments de syntaxe rencontrés dans l'arbre. Elle renvoie la chaine de caractères contenant le code Javascript. Si le mode de débogage vaut 2, cette chaine est affichée dans la console du navigateur
</td>
</tr>

<tr>
    
<td>
exécution du code Javascript
</td>
<td>
évaluation par la fonction `eval()`
</td>
</tr>

</table>

### Fichiers utilisés

Le fichier __brython.js__ est généré par compilation de plusieurs scripts :


- __brython\_builtins.js.js__ : définit l'objet `__BRYTHON__` qui sert de passerelle entre les objets natifs Javascript (`Date, RegExp, Storage`...) et Brython
- __version\_info.js__ : généré automatiquement par le script make_dist.py, contient le numéro de la version courante de Brython
- __py2js.js__ : opère la conversion entre le code Python et le code Javascript
- __py\_utils.js__ : fonctions utilitaires (conversion de types entre Javascript et Python)
- __py\_object.js__ : implémentation de la classe **object**
- __py\_type.js__ : implémentation de la classe **type**
- __py\_builtin\_function.js__ : les fonctions intégrées Python
- __js\_object.js__ : implémentation de `JSObject` et `JSConstructor` pour l'interaction avec les objets Javascript
- __py\_import.js__ : implémentation du mot-clé `import`
- __py\_float.js__, __py\_int.js__, __py\_complex.js__, __py\_dict.js__, __py\_list.js__, __py\_string.js__, __py\_set.js__ : implémentation des classes Python correspondantes
- __py\_dom.js__ : interaction avec le document HTML (DOM)

###Compléments sur la traduction et l'exécution

La traduction et l'exécution d'un script Brython par __py2js.js__ passent par les phases suivantes :
<ol>
<li>analyse syntaxique et construction d'un arbre

Cette étape repose sur un automate dont l'état évolue en fonction des jetons rencontrés dans le code source

Le code Python est découpé en jetons qui peuvent avoir les types suivants : 
- mot-clé
- identifiant
- littéral (chaine de caractères, entier, réel)
- opérateur
- point
- deux points (:)
- parenthèse / crochet / accolade ouvrant ou fermant
- affectation (signe =)
- décorateur (signe @)
- fin de ligne

Pour chaque jeton, un appel est réalisé à la fonction _$transition()_ qui renvoie un nouvel état en fonction de l'état courant et du jeton

A chaque instruction du code source correspond un noeud dans l'arbre (instance de la classe _$Node_). Si une ligne comporte plusieurs instructions séparées par ":" (`def foo(x):return x`) ou par ";" (`x=1;print(x)`), plusieurs noeuds sont créés pour cette ligne

A chaque élément de syntaxe (identifiant, appel de fonction, expression, opérateur...) correspond une classe décrivant le contexte de cet élément (voir dans le code source de __py2js.js__ entre `function $AbstractExprCtx` et `function $YieldCtx`)

Dans cette étape, des erreurs peuvent être signalées : 
- erreur de syntaxe
- erreur d'indentation
- chaine de caractères non terminée
- parenthèses non équilibrées
- caractère illégal
- mot clé Python non géré par Brython

<li>Transformation de l'arbre

Pour certains éléments de la syntaxe Python, il est nécessaire de modifier l'arbre représentant le code source (ajouter des branches) avant de passer à la traduction en Javascript. Ceci est réalisé en appelant récursivement la méthode `transform()` depuis le sommet de l'arbre, et en appliquant la méthode de même nom sur les contextes de chaque noeud

Par exemple, pour le code Python <code>assert _condition_</code> qui produit une branche de l'arbre, cette étape la transforme en une branche <code>if not _condition_</code> et une branche "fille" de celle-ci correspondant à `raise AssertionError`

Les éléments concernés sont : `assert`, l'assignation en chaine (`x=y=0`) et multiple (`x,y=1,2`), `class, def, except, for, try`

Cette étape sert aussi à mémoriser les variables déclarées par `global`

<li> Exécution du code Javascript généré

Le script généré peut faire appel en cours d'exécution :

- aux classes intégrées définies dans les fichiers listés ci-dessus (__py\_int, py\_list__, etc.)

- à des fonctions internes, non accessibles en Python (leur nom commence systématiquement par $) qui sont pour la plupart définies dans  __py\_utils.js__. Les plus importantes sont :

 - _$JS2Py_ : prend un seul argument et renvoie :
  - l'argument sans changement s'il est d'un type reconnu par Brython (c'est-à-dire s'il possède un attribut \_\__class\_\__)
  - une instance de DOMObject (respectivement DOMEvent) si l'argument est un objet (resp. un événement) DOM
  - une instance de JSObject "enveloppant" l'argument sinon
 - _$MakeArgs_ appelée au début de l'exécution de chaque fonction dont la signature comporte au moins un argument. Elle construit un espace de noms à partir des arguments passés à la fonction, en appelant notamment la fonction $JS2Py sur tous les arguments
 - _$class\_constructor_ est appelée pour la définition des classes
 - _$list\_comp_ est appelée pour chaque liste en extansion
 - _$lambda_ est appelée pour les fonctions anonymes définies par `lambda`
 - _$test\_expr_ et _$test\_item_ sont utilisés dans l'évaluation de conditions combinées par `and` ou `or`

- aux fonctions définies dans __py\_import.js__ pour la gestion des imports

En cas d'erreur d'exécution, une trace aussi proche que possible de celle générée par Python est imprimée dans la console du navigateur, ou vers un autre élément défini par `sys.stderr`

</ol>
