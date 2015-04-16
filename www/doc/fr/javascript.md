module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript présents dans la même page que le
programme Brython.

Il définit deux classes et une fonction :

**javascript**.`JSObject`
> Classe dont les instances «&nbsp;enveloppent&nbsp;» des objets Javascript.

> _**Avertissement : **_ Cette classe n'est normalement pas utilisée 
> directement. Un objet dont on obtient une référence par `window.js_object`
> est une instance de `JSObject`

> <code>JSObject(_jsobj_)</code> renvoie un objet *brobj* qui 
> «&nbsp;enveloppe&nbsp;» l'objet Javascript *jsobj*. Les opérations réalisées 
> sur l'instance de `JSObject` sont répercutées sur l'objet Javascript en 
> convertissant du mieux possible les types Python en types Javascript.

> Si *jsobj* est une fonction, les arguments passés à *brobj* sont convertis
> avant d'être passés à *jsobj* de la façon suivante&nbsp;:

<blockquote>
<table border='1' cellpadding=3>

<tr><th>Type d'argument dans l'appel de fonction Brython</th><th>Argument passé à la fonction Javascript</th></tr>
<tr><td>instance de `DOMNode`</td><td>Elément DOM</td></tr>
<tr><td>instance de `DOMEvent`</td><td>Evénement DOM</td></tr>
<tr><td>liste d'instances de `DOMNode`</td><td>Tableau (`array`) d’éléments DOM</td></tr>
<tr><td>`None, True, False`</td><td>`null, true, false`</td></tr>
<tr><td>instance de `int`</td><td>entier</td></tr>
<tr><td>instance de `float`</td><td>réel</td></tr>
<tr><td>instance de `str`</td><td>chaîne</td></tr>
<tr><td>instance de `list`</td><td>tableau Javascript</td></tr>
<tr><td>instance de `JSObject`</td><td>objet Javascript correspondant</td></tr>
</table>
</blockquote>

> Le résultat est converti en effectuant les opérations inverses.


**javascript**.`JSConstructor`
> Classe dont les instances représentent des constructeurs Javascript,
> c'est-à-dire des fonctions utilisées avec le mot-clé Javascript `new`.

> <code>JSConstructor(_jsconstr_)</code> renvoie l'objet Brython *brconstr*.
> Cet objet est un *callable* («&nbsp;appelable&nbsp;»)&nbsp;; il renvoie une
> instance de `JSObject` représentant l'objet Javascript obtenu en passant au
> constructeur *jsconstr* les arguments convertis comme indiqué dans le tableau
> ci-dessus.

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

