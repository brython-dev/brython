Traducción de la sintaxis Python a código Javascript
----------------------------------------------------

<table border=1 cellpadding=3>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Comentarios</th>
</tr>

<tr>
<td>
`x = 1`

`y = 3.14`

`z = "azerty"`
</td>
<td>
    var $globals = __BRYTHON__.scope["__main__"].__dict__
    var $locals = $globals
    x=$globals["x"]=Number(1)
    y=$globals["y"]=float(3.14)
    z=$globals["z"]="azerty"
</td>
<td>Las primeras dos líneas están presentes en todos los scripts ; definen variables internas Brython que usan las funciones `globals()` y `locals()`. Tened en cuenta que en los siguientes ejemplos no se mostrarán esas dos líneas.

_float_ es una función Javascript definida en __py\_builtin\_functions.js__</td>
</tr>

<tr>
<td>`x = foo.bar`</td>
<td>`x=getattr(foo,"bar")`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`foo.bar = x`</td>
<td>`setattr(foo,"bar",x)`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x = foo[bar]`</td>
<td>`x=getattr(foo,"__getitem__")(bar)`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`foo[bar] = x`</td>
<td>`getattr(foo,"__setitem__")(bar,x)`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x+y`</td>
<td>`getattr(x,"__add__")(y)`
<td>lo mismo para todos los operadores
<br>necesario para implementar operaciones como 2 * "a"</td>
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
<td>La primera prueba permite una mejora de la eficiencia si ambas variables son enteros : en ese caso
se podría usar el operador Javascript +=
</td>
</td>
</tr>

<tr>
<td>`a and b`</td>
<td>`$test_expr($test_item(a)&&$test_item(b))`
<td>Se mantiene el operador && Javascript y de esta forma no se evalúa b si a es falso
<br>_$test\_item_ devuelve un booleano Javascript (true o false) y almacena el valor resultante en una variable global ; _$test\_expr_ devuelve esta variable global</td>
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
<td>_$no\_break_ es un booleano usado en el caso de que el bucle `for` tenga un `else`

_$pop\_exc()_ es una función interna que elimina la última excepción de la pila de excepciones

_$is\_exc(exc,classes)_ es una función interna que comprueba si la excepción _exc_ es una instanncia de una de las _clases_

</td></tr>

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
<td>La traducción es bastante larga, pero el manejo de las excepciones se debe realizar en el tiempo de ejecución</td></tr>

<tr>
<td>
    def foo():
       x=3
</td>
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
<td>
_$ns_ es una variable interna, un objeto devuelto por la función _$MakeArgs_ que inspecciona los argumentos de la función y establece los valores

Si _$MakeArgs_ no devuelve una excepción, se crearán los valores locales y se almacenarán en la variable interna _$locals_, y un objeto interno _\_\_BRYTHON\_\_.vars[_function\_id_] donde _function\_id_ es un identificador de la función, hecho con el nombre del módulo, el nombre de la función y una cadena aleatoria (here "a8mk6bg2")

La línea `$globals["foo"]=foo` añade el nombre de la función en el espacio de nombres del módulo

El atributo _$type_ de la función se usa internamente para ordenar funciones respecto de métodos de clases definidos al mismo nivel del módulo
</td>
</tr>

<tr>
<td>
    def foo():
       global x
       x=3
</td>
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
<td>Para una variable global no se usará la palabra clave `var`</td>
</tr>

<tr>
<td>
    def foo(x,y=3,*args,**kw):
       (...)
</td>
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
<td>la función _$MakeArgs_ creará un objeto Javascript con los nombres definidos en la definición de la función y con los valores correspondientes que se le pasan a la función. La siguiente línea crea el espacio de nombres de la función (variables locales)</td>
</tr>

<tr>
<td>`foo(x)`
</td>
<td>`getattr(foo,"__call__")(x)`
</td>
<td>Las llamadas usan el método \_\_call\_\_ del objeto
</tr>

<tr>
<td>`foo(x,y=1)`
</td>
<td>`getattr(foo,"__call__")(x,$Kw("y",Number(1)))`
</td>
<td>los argumentos pasados como palabras clave se convierten a objetos gracias a la función _$Kw_
</tr>

<tr>
<td>
    x='brython'
    try:
        x[2]='a'
    except TypeError:
        print('error')
    except:
        print('another error')
</td>
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
<td>Las líneas
    catch($err51){
        if(false){void(0)}
        
se añaden antes de cualquier `except`, traducidas en forma de un `else if` cuando se especifica el nombre de una excepción o como un `else` cuando no se especifica nada

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
<td>La definición de una clase se ejecuta mediante una función prefijada con el signo $. Esta función devuelve un objeto `$class` que incorpora los atributos y los métodos de la clase

La propia clase se crea mediante la función _$class\_constructor_ definida en __py\_types.js__. Construirá dos objetos Javascript para la clase : Un "factory", usado para crear las instancias de la clase, y un objeto con los atributos y métodos de la clase

Los argumentos que se le pasan a _$class\_constructor_ son el nombre de la clase, la función que lleva el prefijo del signo $ y una tupla con las clases padre opcionales
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
<td>El código muestra que el objeto `$class` recibe el método `__init__()` como atributo

La clase hereda de la clase `A`, se puede ver en el tercer argumento de `$class_constructor`
</td>
</tr>


</table>
