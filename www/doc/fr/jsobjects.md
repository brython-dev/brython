Utiliser des objets Javascript
------------------------------

Il faut gérer la période transitoire où Brython va cohabiter avec Javascript 
;-)

### Accès aux objets Brython depuis Javascript

Brython n'expose par défaut que deux noms dans l'espace de noms global de 
Javascript :

> `brython()` : la fonction exécutée au lancement de la page web.

> `__BRYTHON__` : un objet utilisé en interne par Brython pour stocker les 
> objets nécessaires à l'exécution des scripts.

Par défaut, un programme Javascript ne donc peut pas accéder aux objets 
Brython. Par exemple, si on veut utiliser une fonction `echo()` définie dans 
un script Brython pour réagir à un événement sur un élément de la page, au 
lieu de la syntaxe

>    <button onclick="echo()">

qui ne fonctionne pas puisque le nom _echo_ n'est pas accessible depuis 
Javascript, il faut plutôt affecter un id à l'élément :

>    <button id="echo">

et définir le lien entre cet élément et un événement _click_ par :

>    document['echo'].bind('click',echo)

Une autre possibilité est de forcer l'inscription de _echo_ dans l'espace de 
noms Javascript en le définissant comme attribut de l'objet `window` du module 
**browser** :

>    from browser import window
>    window.echo = echo

Cette méthode n'est pas recommandée, parce qu'elle introduit un risque de 
conflit avec des noms définis dans un programme ou une librairie Javascript 
utilisée dans la page.

### Utilisation d'objets Javascript dans un script Brython

Un document HTML peut utiliser des scripts ou des librairies Javascript, et 
des scripts ou des librairies Python.

Les noms qui sont ajoutés par les programmes Javascript à l'espace de noms 
Javascript sont accessibles depuis les scripts Brython comme attributs de 
l'objet `window` défini dans le module **browser**.

Par exemple :

>    <script type="text/javascript">
>    circle = {surface:function(r){return 3.14*r*r}}
>    </script>
>
>    <script type="text/python">
>    from browser import document, window
>
>    document['result'].value = window.circle.surface(10)
>    </script>

Les objets Javascript sont convertis en leurs équivalents Python selon le 
tableau suivant :

<table border='1' cellpadding=3>

<tr><th>Objet Javascript (js\_obj)</th><th>Objet Python (window.js\_obj)</th>
</tr>
<tr><td>Elément DOM</td><td>instance de `DOMNode`</td></tr>
<tr><td>Evénement DOM</td><td>instance de `DOMEvent`</td></tr>
<tr><td>Collection d’éléments DOM</td><td>liste d'instances de `DOMNode`</td>
</tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>entier (Integer)</td><td>instance de `int`</td></tr>
<tr><td>réel (Float)</td><td>instance de `float`</td></tr>
<tr><td>chaîne (String)</td><td>instance de `str`</td></tr>
<tr><td>tableau Javascript (Array)</td><td>instance de `list`</td></tr>
</table>

Les autres objets Javascript sont convertis en une instance de la classe 
`JSObject` définie dans le module **javascript**. On peut les convertir
en dictionnaire Python par :

>    py_obj = window.js_obj.to_dict()

Si l'objet est une fonction, les arguments passés à la fonction Python sont 
convertis dans l'appel de la fonction Javascript en utilisant le tableau 
inverse de celui ci-dessus.

Attention, une fonction Javascript ne peut pas être appelée avec des
arguments par mots-clés, cela déclenche une exception `TypeError` : si la 
fonction est définie par

>    function foo(x, y)

et qu'on l'appelle depuis un script Brython par

>    window.foo(y=0, x=1)

la conversion des arguments dans le bon ordre n'est pas possible, parce que le
script Brython ne connait pas la signature de la fonction Javascript.

### Utilisation de constructeurs Javascript dans un script Brython

Si une fonction Javascript est un constructeur d'objets, qu'on peut appeler 
dans du code Javascript avec le mot-clé `new`, on peut l'utiliser avec Brython 
en la transformant par la fonction `JSConstructor()` du module **javascript**.

<code>JSConstructor(_constr_)</code> renvoie une fonction qui, quand on lui 
passe des arguments, retourne un objet Python correspondant à l'objet 
Javascript constuit par le constructeur *constr*.

Par exemple :

    <script type="text/javascript">
    function Rectangle(x0,y0,x1,y1){
        this.x0 = x0
        this.y0 = y0
        this.x1 = x1
        this.y1 = y1
        this.surface = function(){return (x1-x0)*(y1-y0)}
    }
    </script>
    
    <script type="text/python">
    from browser import alert, window
    from javascript import JSConstructor

    rectangle = JSConstructor(window.Rectangle)
    alert(rectangle(10,10,30,30).surface())
    </script>

### Exemple d'interface avec jQuery

Voici un exemple plus complet qui montre comment utiliser la populaire 
librairie jQuery :

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
    from browser import document, window
    
    def change_color(ev):
      _divs=document.get(selector='div')
      for _div in _divs:
          if _div.style.color != "blue":
             _div.style.color = "blue"
          else:
             _div.style.color = "red"
    
    # créer un alias pour "$" de jQuery (causerait une SyntaxError en Python)
    jq = window.jQuery.noConflict(True)
    _jQuery = jq("body")
    _jQuery.click(change_color)    
    </script>
    
    <body onload="brython()">

      <div>Cliquer ici</div>
      <div>pour parcourir</div>
      <div>ces divs.</div>
     
    </body>
    </html>
    
### Autres exemples

Vous trouverez dans la [galerie](../../gallery/gallery_fr.html) d'autres 
exemples d'utilisation de librairies Javascript (Three, Highcharts, Raphael) 
dans des scripts Brython.
