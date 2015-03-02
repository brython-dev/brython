Traduction de la syntaxe Python en code Javascript
--------------------------------------------------

<p>
<table border=1>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Commentaires</th>
</tr>

<tr>
<td><pre><code>
x = 1
y = 3.14
z = "azerty"
</code></pre></td>
<td>    
    var $globals = __BRYTHON__.vars["__main__"]
    var $locals = $globals
    x=$globals["x"]=Number(1)
    y=$globals["y"]=float(3.14)
    z=$globals["z"]="azerty"
</td>
<td>Les 2 premières lignes sont présentes dans tous les scripts ; elles définissent des variables internes à Brython qui sont utilisées par les fonctions intégrées `globals()` et `locals()`. Ces lignes ne seront pas recopiées dans les exemples suivants

_float_ est une fonction Javascript définie dans __py\_float.js__
</td>
</tr>

<tr>
<td><pre class="python">
`x = foo.bar`
</td>
<td>
`x=getattr(foo,"bar")`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`foo.bar = x`</td>
<td>`setattr(foo,"bar",x)`</pre>
<td>&nbsp;</td>
</tr>

<tr>
<td>`x = foo[bar]`</td>
<td>`x=getattr(foo,"__getitem__")(bar)`</pre>
<td>&nbsp;</td>
</tr>

<tr>
<td>
`foo[bar] = x`
</td>
<td>
`getattr(foo,"__setitem__")(bar,x)`
</pre>
<td>&nbsp;</td>
</tr>

<tr>
<td>`x+y`</td>
<td>`getattr(x,"__add__")(y)`</pre>
<td>même chose pour tous les opérateurs

indispensable pour implémenter des opérations comme 2*"a"
</td>
</tr>

<tr>
<td>`x += y`</td>
<td>
    var $temp=y;
    if(typeof $temp=="number" && typeof x=="number"){
        x+=$temp;$globals["x"]=x
    }else if(!hasattr(x,"__iadd__")){
        var x=$globals["x"]=getattr(x,"__add__")($temp);
    }
    else{
        x=$globals["x"]=getattr(x,"__iadd__")($temp)
    }
</td>
<td>Le premier test permet d'améliorer les performances si les deux variables sont des entiers : dans ce cas on peut utiliser l'opérateur Javascript +=
</td>
</tr>

<tr>
<td>`a and b`</td>
<td>`$test_expr($test_item(a)&&$test_item(b))`
<td>on conserve l'opérateur Javascript && pour ne pas évaluer b si a est faux

_$test\_item_ retourne un booléen Javascript (`true` ou `false`) et stocke la valeur évaluée dans une variable globale ; _$test\_expr_ renvoie cette variable globale</td>
</td>
</tr>


<tr>
<td>
    for obj in iterable:
        (...)
</td>
<td>
    var $next9=$locals["$next9"]=getattr(iter(iterable),"__next__")
    var $no_break9=true;while(true){
        try{
            var obj=$globals["obj"]=$next9();None;
        }
        catch($err){
            if(__BRYTHON__.is_exc($err,[StopIteration])){
                __BRYTHON__.$pop_exc();break
            }else{
                throw($err)
            }
        }
        (...)
    }


</td>
<td>_$no\_break_ est un booléen utilisé si la boucle `for` possède une clause `else`

_$pop\_exc()_ est une fonction interne qui enlève la dernière exception de la pile

_$is\_exc(exc,classes)_ est une fonction interne qui indique si l'exception _exc_ est une instance d'une des _classes_
</td>
</tr>

<tr>
<td>`x,y = iterable`</td>
<td>
    var $right9=getattr(iter(iterable),"__next__");
    var $rlist9=[];while(true){
        try{$rlist9.push($right9())}
        catch(err){__BRYTHON__.$pop_exc();break}
    }
    if($rlist9.length<2){
        throw ValueError("need more than "+$rlist9.length+
            " values to unpack")
    }
    if($rlist9.length>2){
        throw ValueError("too many values to unpack (expected 2)")}
    var x=$globals["x"]=$rlist9[0]
    var y=$globals["y"]=$rlist9[1]
</td>
<td>La traduction est assez longue, mais il faut gérer les exceptions au moment de l'exécution</td></tr>

<tr>
<td><pre><code>
def foo():
   x=3
</code></pre></td>
<td>
    var foo= (function (){
        var $defaults = {}
        return function(){
            try{
                var $locals = __BRYTHON__.vars["__main__-foo-a8mk6bg2"]={}
                for(var $var in $defaults){
                    eval("var "+$var+"=$locals[$var]=$defaults[$var]")
                }
                var $ns=__BRYTHON__.$MakeArgs("foo",arguments,
                    [],[],null,null,[])
                for(var $var in $ns){
                    eval("var "+$var+"=$ns[$var]")
                    $locals[$var]=$ns[$var]
                }
                var x=$locals["x"]=3;None;
            }
            catch(err10){
                throw __BRYTHON__.exception(err10)
            }
        }
    }
    )()
    foo.__name__="foo"
    $globals["foo"]=foo
    foo.$type='function'
    foo.__module__ = "__main__"
    foo.__doc__=""
    foo.__code__= {__class__:__BRYTHON__.$CodeDict}
</td>

<td>_$ns_ est une variable interne, un object renvoyé par la fonction _$MakeArgs_ qui inspecte les arguments passés à la fonction et affecte des valeurs selon la signature de la fonction

Si aucune exception n'est déclenchée par _$MakeArgs_, les variables locales sont initialisées et stockées dans la variable interne _$locals_, et dans un objet interne _\_\_BRYTHON\_\_.vars[_function\_id_] où _function\_id_ est un identifiant de la fonction, constitué du nom du module, du nom de la fonction et d'une chaine aléatoire (ici "a8mk6bg2")

Le nom "foo" est ajouté dans l'espace de noms du module, `$globals`

L'attribut _$type_ de la fonction est utilisée en interne pour différencier les fonctions des méthodes définies dans des classes
</td></tr>

<tr>
<td><pre><code>
def foo():
   global x
   x=3
</code></pre></td>
<td>
    var foo= (function (){
        var $defaults = {}
        return function(){
            try{
                var $locals = __BRYTHON__.vars["__main__-foo-o098yx0t"]={}
                for(var $var in $defaults){
                    eval("var "+$var+"=$locals[$var]=$defaults[$var]")
                }
                var $ns=__BRYTHON__.$MakeArgs("foo",arguments,
                    [],[],null,null,[])
                for(var $var in $ns){
                    eval("var "+$var+"=$ns[$var]")
                    $locals[$var]=$ns[$var]
                }
                x=$globals["x"]=3
            }
            catch(err9){throw __BRYTHON__.exception(err9)}
        }
    }
    )()
    foo.__name__="foo"
    $globals["foo"]=foo;foo.$type='function'
    foo.__module__ = "__main__"
    foo.__doc__=""
    foo.__code__= {__class__:__BRYTHON__.$CodeDict}

</td>
<td>pour une variable globale, on ne précède pas l'affectation du mot-clé `var`</td>
</tr>

<tr>
<td><pre><code>
    def foo(x,y=3,*args,**kw):
       (...)
</code></pre></td>
<td>
    var foo= (function (){
        var $defaults = {y:3}
        return function(){
            try{
                var $locals = __BRYTHON__.vars["__main__-foo-6f58vupa"]={}
                for(var $var in $defaults){
                    eval("var "+$var+"=$locals[$var]=$defaults[$var]")
                }
                var $ns=__BRYTHON__.$MakeArgs("foo",arguments,
                    ["x"],["y"],"args","kw",[])
                for(var $var in $ns){
                    eval("var "+$var+"=$ns[$var]")
                    $locals[$var]=$ns[$var]
                }
                (...)
            }
            catch(err9){throw __BRYTHON__.exception(err9)}
        }
    }
    )()
</td>
<td>la fonction _$MakeArgs_ contruit un objet Javascript faisant correspondre les noms définis dans la signature de la fonction aux valeurs effectivement passées. La ligne suivante construit l'espace de noms de la fonction (variables locales)</td>
</tr>

<tr>
<td><pre>
`foo(x)`
</pre></td>
<td>
`getattr(foo,"__call__")(x)`
</td>
<td>Cette transformation est nécessaire pour rendre appelables les instances des classes qui définissent une méthode`__call__()`

</tr>

<tr>
<td>
`foo(x,y=1)`
</td>
<td>
`getattr(foo,"__call__")(x,$Kw("y",Number(1)))`
</td>
<td>les arguments passés sous forme de mots-clés sont convertis en objets créés par la fonction _$Kw()_
</tr>

<tr>
<td>
    x='brython'
    try:
        x[2]='a'
    except TypeError:
        print('erreur')
    except:
        print('autre erreur')
</code></pre></td>
<td>
    __BRYTHON__.$failed9=false
    try{
        getattr(x,"__setitem__")(2,'a')
    }
    catch($err9){
        __BRYTHON__.$failed9=true
        if(false){void(0)}
        else if(__BRYTHON__.is_exc($err9,[TypeError])){
            getattr($print,"__call__")('erreur')
        }
        else{
            getattr($print,"__call__")('autre erreur')
        }
    }

</td>
<td>les lignes
    catch($err0){
       if(false){void(0)}
sont ajoutées avant toutes les clauses `except`, qui sont traduites en `else if` si un nom d'exception est précisé ou `else` sinon

</tr>

<tr>
<td><pre><code>class foo:
   pass
</code></pre></td>
<td>
    var $foo=(function(){
        var $class = {$def_line:__BRYTHON__.line_info}
        void(0)
        return $class
    }
    )()
    $foo.__doc__=""
    $foo.__module__="__main__"
    var foo=__BRYTHON__.$class_constructor("foo",$foo,tuple([]),[],[])
    __BRYTHON__.vars["__main__"]["foo"]=foo
</td>
<td>le corps de la définition de la classe est intégré dans une fonction préfixée par le signe $. Cette fonction renvoie un objet `$class` qui possède les attributs et méthodes définis dans la classe

La classe elle-même est construite par la fonction _$class\_constructor_ définie dans __py_types.js__ qui retourne un objet Javascript correspondant au constructeur de la classe Python (la fonction qui crée et initialise des instances de la classe). Les arguments passés à cette fonction sont le nom de la classe, la fonction préfixée par $, un tuple contenant les éventuelles classes parentes, la liste des noms de ces classes, et un éventuel mot-clé `metaclass`

La dernière ligne ajoute le nom de la classe à l'espace de noms du module, indexé par son nom `__main__`
</tr>

<tr>
<td>
    class foo(A):
        def __init__(self,x):
            self.x = x
</td>
<td><code><pre>
    var $foo=(function(){
        var $class = {$def_line:__BRYTHON__.line_info}
        $class.__init__= (function (){
            var $defaults = {}
            return function(){
                try{
                    var $locals = __BRYTHON__.vars["__main__-__init__-kdc7mc5z"]={}
                    for(var $var in $defaults){
                        eval("var "+$var+"=$locals[$var]=$defaults[$var]")
                    }
                    var $ns=__BRYTHON__.$MakeArgs("__init__",arguments,
                        ["self","x"],[],null,null,[])
                    for(var $var in $ns){
                        eval("var "+$var+"=$ns[$var]")
                        $locals[$var]=$ns[$var]
                    }
                    setattr(self,"x",x)
                }
                catch(err10){throw __BRYTHON__.exception(err10)}
            }
        }
        )()
        $class.__init__.__name__="__init__"
        $class.__init__.__module__ = "__main__"
        $class.__init__.__doc__=""
        $class.__init__.__code__= {__class__:__BRYTHON__.$CodeDict}
        return $class
    }
    )()
    $foo.__doc__=""
    $foo.__module__="__main__"
    var foo=__BRYTHON__.$class_constructor("foo",$foo,tuple([A]),["A"],[])
    __BRYTHON__.vars["__main__"]["foo"]=foo

</pre></code>
</td>
<td>On voit que l'objet `$class` reçoit comme attribut la méthode `__init__()`

La classe hérite d'une autre classe `A`, qu'on retrouve comme 3ème argument de l'appel à `$class_constructor`
</td>
</tr>

</table>
