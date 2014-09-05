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
    $temp=y
    if(!hasattr(x,"__iadd__")){
     x=getattr(x,"__add__")($temp)
    }else{
     x=getattr(x,"__iadd__")($temp)
    }
</td>
<td>&nbsp;
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
    var $iter48=iter(y)
    var $no_break48=true
    while(true){
        try{
            x=$globals["x"]=getattr($iter48,"__next__")()
        }
        catch($err){
            if($is_exc($err,[StopIteration])){
                $pop_exc();break
            }else{
                throw($err)
            }
        }
        (...)
    }

</td>
<td>_$no\_break1_ es un booleano usado en el caso de que el bucle `for` tenga un `else`

_$pop\_exc()_ es una función interna que elimina la última excepción de la pila de excepciones

_$is\_exc(exc,classes)_ es una función interna que comprueba si la excepción _exc_ es una instanncia de una de las _clases_

</td></tr>

<tr>
<td>`x,y = iterable`</td>
<td>
    $right=iter(iterable)
    $counter=-1
    try{
        $counter++
        x=next($right)
        $counter++
        y=next($right)
    }catch($err49){
        if($err49.__name__=="StopIteration"){
            $pop_exc()
            throw ValueError("need more than "+$counter+" value"+
                ($counter>1 ? "s" : "")+" to unpack")
        }
    }
    var $exhausted=true
    try{
        next($right)
        $exhausted=false
    }catch(err){
        if(err.__name__=="StopIteration"){
        $pop_exc()
        }
    }
    if(!$exhausted){
        throw ValueError("too many values to unpack (expected "+
            ($counter+1)+")")
    } 
</td>
<td>La traducción es bastante larga, pero el manejo de las excepciones se debe realizar en el tiempo de ejecución</td></tr>

<tr>
<td>
    def foo():
       x=3
</td>
<td>
    var foo= (function (){
        return function(){
            try{
                var $ns=$MakeArgs("foo",arguments,[],{},null,null)
                for($var in $ns){eval("var "+$var+"=$ns[$var]")}
                var $locals = __BRYTHON__.scope["a54xmumg"].__dict__=$ns
                var x=$locals["x"]=Number(3)
            }catch(err51){
                throw __BRYTHON__.exception(err51)
            }
        }
    })()
    foo.__name__="foo"
    window.foo=foo
    foo.$type='function'
</td>
<td>
_$ns_ es una variable interna, un objeto devuelto por la función _$MakeArgs_ que inspecciona los argumentos de la función y establece los valores

Si _$MakeArgs_ no devuelve una excepción, se crearán los valores locales y se almacenarán en la variable interna _$locals_, y en el atributo _\_\_dict\_\__ del valor _\_\_BRYTHON\_\_.scope_ indexado mediante una cadena aleatoria (en este caso "a54xmumg") asociada con la función

Para ser consistente con la gestión del espacio de nombres de Python la variable local `x` se declare mediante el uso de la palabra clave `var` 

La línea `window.foo = foo` añade el nombre de la función al espacio de nombres del navegador ; solo existirá si la función está al mismo nivel que el módulo y no dentro de otra función

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
        return function(){
            try{
                var $ns=$MakeArgs("foo",arguments,[],{},null,null)
                for($var in $ns){eval("var "+$var+"=$ns[$var]")}
                var $locals = __BRYTHON__.scope["a54xmumg"].__dict__=$ns
                x=$locals["x"]=Number(3)
            }catch(err51){
                throw __BRYTHON__.exception(err51)
            }
        }
    })()
    foo.__name__="foo"
    window.foo=foo
    foo.$type='function'

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
        return function(){
            try{
                var $ns=$MakeArgs("foo",arguments,["x"],
                    {"y":Number(3)},"args","kw")
                for($var in $ns){eval("var "+$var+"=$ns[$var]")}
                var $locals = __BRYTHON__.scope["jez7jnqt"].__dict__=$ns
                (...)
            }catch(err51){
                throw __BRYTHON__.exception(err51)
            }
        }
    })()
    foo.__name__="foo"
    window.foo=foo
    $globals["foo"]=foo
    foo.$type='function'
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
    x=$globals["x"]='brython'
    $failed49=false
    try{
        getattr(x,"__setitem__")(Number(2),'a')
    }
    catch($err49){
        var $failed49=true
        if(false){void(0)}
        else if($is_exc($err49,[TypeError])){
            getattr($print,"__call__")('error')
        }
        else{
            getattr($print,"__call__")('another error')
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
        var $class = new Object()
        void(0)
        return $class
    }
    )()
    var foo=$class_constructor("foo",$foo)
    window.foo=foo
    __BRYTHON__.scope["__main__"].__dict__["foo"]=foo
</td>
<td>La definición de una clase se ejecuta mediante una función prefijada con el signo $. Esta función devuelve un objeto `$class` que incorpora los atributos y los métodos de la clase

La propia clase se crea mediante la función _$class\_constructor_ definida en __py\_utils.js__. Construirá dos objetos Javascript para la clase : Un "factory", usado para crear las instancias de la clase, y un objeto con los atributos y métodos de la clase

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
        var $class = new Object()
        $class.__init__= (function (){
        return function(){
            try{
                var $ns=$MakeArgs("__init__",arguments,
                    ["self","x"],{},null,null)
                for($var in $ns){eval("var "+$var+"=$ns[$var]")}
                var $locals = __BRYTHON__.scope["dybwedwu"].__dict__=$ns
                setattr(self,"x",x)
            }catch(err52){
                throw __BRYTHON__.exception(err52)
            }
        }
        })()
        $class.__init__.__name__="__init__"
        return $class
        }
    )()
    var foo=$class_constructor("foo",$foo,A)
    window.foo=foo
    __BRYTHON__.scope["__main__"].__dict__["foo"]=foo
</pre></code>
</td>
<td>El código muestra que el objeto `$class` recibe el método `__init__()` como atributo

La clase hereda de la clase `A`, se puede ver en el tercer argumento de `$class_constructor`
</td>
</tr>


</table>
