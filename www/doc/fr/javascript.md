module **javascript**
---------------------

Le module **javascript** permet d'interagir avec les objets définis dans les
bibliothèques et programmes Javascript présents dans la même page que le
programme Brython.

**javascript**.`py2js(`_src_`)`
> Renvoie le code Javascript généré à partir du code source Python _src_.

**javascript**.`this()`
> Renvoie l'objet Brython correspondant au mot-cle Javascript `this`. Peut
> être nécessaire dans l'utilisation de certains frameworks Javascript, par
> exemple quand une fonction de retour utilise cet objet `this`.
