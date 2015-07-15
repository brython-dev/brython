module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript présents dans la même page que le
programme Brython.

Il définit deux classes et une fonction :

**javascript**.`JSConstructor`
> Classe dont les instances représentent des constructeurs Javascript,
> c'est-à-dire des fonctions utilisées avec le mot-clé Javascript `new`.

> <code>JSConstructor(_jsconstr_)</code> renvoie un objet appelable ; quand
> on l'appelle, avec les mêmes arguments que le constructeur Javascript, le
> résultat est l'objet Javascript créé par _jsconstr_, converti en objet 
> Python en suivant le tableau de la page 
> <a href="jsojects.html">Objets et librairies Javascript</a>.

**javascript**.`JSObject`
> Classe des objets Javascript qui ne peuvent pas être convertis 
> "naturellement" en objets Python quand on les référence comme attributs
> de `browser.window`. Cette classe est interne à Brython et n'est normalement
> pas utilisée dans les programmes.

> Voir <a href="jsojects.html">Objets et librairies Javascript</a>.

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

Exemple
-------

Utilisation de `JSConstructor` avec la bibliothèque Javascript three.js :

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor(THREE.PerspectiveCamera)
>    camera = cameraC(75, 1, 1, 10000)

> Voir [la démo three](../../gallery/three.html) pour une démonstration
> grandeur nature.

