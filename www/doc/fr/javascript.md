module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript présents dans la même page que le
programme Brython.

**javascript**.`JSConstructor(`_constructeur_`)`

> Classe dont les instances représentent des constructeurs Javascript,
> c'est-à-dire des fonctions utilisées avec le mot-clé Javascript `new`.

> <code>JSConstructor(_constructeur_)</code> renvoie un objet appelable ; quand
> on l'appelle, avec les mêmes arguments que le constructeur Javascript, le
> résultat est l'objet Javascript créé par _constructeur_, converti en objet 
> Python en suivant le tableau de la page 
> <a href="jsojects.html">Objets et librairies Javascript</a>.

> _AVERTISSEMENT : cette fonction est dépréciée à partir de la version 3.1.1. A la place de `py_class = JSConstructor(js_class)` utilisez `py_class = js_class.new`_

**javascript**.`JSObject(`_objet\_js_`)`

> Classe des objets Javascript qui ne peuvent pas être convertis 
> "naturellement" en objets Python quand on les référence comme attributs
> de `browser.window`.

> Voir <a href="jsojects.html">Objets et librairies Javascript</a>.

> _AVERTISSEMENT : cette fonction est dépréciée à partir de la version 3.1.1. Les attributs de l'objet `window` sont déjà des instances de la classe `JSObject`_

**javascript**.`load(`_script\_url[,noms]_`)`

> Fonction pour charger le script Javascript à l'adresse _script\_url_ et 
> insérer la liste de _noms_ dans l'espace de noms du programme.

> Cette fonction utilise un appel Ajax bloquant. Il faut l'utiliser quand on
> ne peut pas insérer la librairie Javascript dans la page html par
> `<script src="prog.js"></script>`. 

> Par exemple, le module **jqueryui** de la bibliothèque standard Brython
> fournit une interface avec la librairie Javascript jQueryUI. Si on écrit un
> script Brython qui utilise ce module, on fait simplement `import jqueryui`
> sans insérer les librairies Javascript dans la page. C'est le module 
> **jqueryui** qui les charge, en utilisant cette fonction `load()`

> _AVERTISSEMENT : cette fonction est dépréciée à partir de la version 3.1.1. Utilisez la fonction `load` du module **browser**_

**javascript**.`py2js(`_src_`)`
> Renvoie le code Javascript généré à partir du code source Python _src_.

**javascript**.`this()`
> Renvoie l'objet Brython correspondant au mot-cle Javascript `this`. Peut
> être nécessaire dans l'utilisation de certains frameworks Javascript, par
> exemple quand une fonction de retour utilise cet objet `this`.

