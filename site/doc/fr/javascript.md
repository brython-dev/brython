module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript présents dans la même page que le
programme Brython.

Il définit deux classes :

**javascript**.`JSObject`
> Classe dont les instances «&nbsp;enveloppent&nbsp;» des objets Javascript.

> <code>JSObject(_jsobj_)</code> renvoie un objet *brobj* qui «&nbsp;»enveloppe&nbsp;»
> l'objet Javascript *jsobj*. Les opérations réalisées sur l'instance de
> `JSObject` sont répercutées sur l'objet Javascript en convertissant du mieux
> possible les types Python en types Javascript.

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

Exemples
--------
Utilisation de `JSObject` avec la bibliothèque Javascript jQuery.

>    from javascript import JSObject
>
>    def callback(*args):
>        ...
>
>    _jQuery=JSObject($("body"))
>    _jQuery.click(callback)

> Voir [la démo jQuery](../../gallery/jsobject_example.html) pour une
> démonstration grandeur nature.

Utilisation de `JSConstructor` avec la bibliothèque Javascript three.js :

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor(THREE.PerspectiveCamera)
>    camera = cameraC(75, 1, 1, 10000)

> Voir [la démo three](../../gallery/three.html) pour une démonstration
> grandeur nature.

