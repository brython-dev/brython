Translation of the Python syntax into Javascript code
-----------------------------------------------------

<table border=1 cellpadding=3>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Comments</th>
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
<td>The first 2 lines are present in all scripts ; they define internal Brython variables that are used by the built-in functions `globals()` and `locals()`. They will not be reproduced in the next examples

`float` is a Javascript function defined in __py\_float.js__</td>
</tr>

<tr>
<td>`x = foo.bar`</td>
<td>`x=getattr(foo,"bar")`
<td>&nbsp;</td>
</tr>

<tr>
<td>`foo.bar = x`</td>
<td>`setattr(foo,"bar",x)`
<td>&nbsp;</td>
</tr>

<tr>
<td>`x = foo[bar]`</td>
<td>`x=getattr(foo,"__getitem__")(bar)`
<td>&nbsp;</td>
</tr>

<tr>
<td>`foo[bar] = x`</td>
<td>`getattr(foo,"__setitem__")(bar,x)`
<td>&nbsp;</td>
</tr>

<tr>
<td>`x+y`</td>
<td>`getattr(x,"__add__")(y)`
<td>same for all operators
<br>necessary to implement such operations as 2 * "a"</td>
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
<td>The first test allows performance improvement if both variables are integers : in this case, the Javascript operator += can be used
</td>
</tr>

<tr>
<td>`a and b`</td>
<td>`$test_expr($test_item(a)&&$test_item(b))`
<td>we are keeping the Javascript && operator so as to not evaluate b if a is false
<br>_$test\_item_ returns a Javascript boolean (true or false)  and stores the resulting value in a global variable ; _$test\_expr_ returns this global variable</td>
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
<td>_$no\_break_ is a boolean used if the `for` loop has an `else` clause

_$pop\_exc()_ is an internal function that removes the last exception from the exception stack

_$is\_exc(exc,classes)_ is an internal function that checks if the exception _exc_ in an instance of one of the _classes_

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
<td>The translation is quite long, but exception handling must be done at runtime</td>
</tr>

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
_$ns_ is an internal variable, an object returned by the built-in function _$MakeArgs_ that inspects the function arguments and sets values according to the function signature

If no exception is raised by _$MakeArgs_, local values are set, and stored in the internal variable _$locals_, and in an internal object _\_\_BRYTHON\_\_.vars[_function\_id_] where _function\_id_ is an identifier of the function, made of the module name, the function name and a random string (here "a8mk6bg2")

The line `$globals["foo"]=foo` adds the function name in the module namespace

The function attribute _$type_ is used internally to sort module-level function from methods defined in classes
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
<td>for a global variable, we do not use the `var` keyword</td>
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
<td>the _$MakeArgs_ function builds a Javascript object matching the names defined in the function signature to the values that are actually passed to it. The following line builds the namespace of the function (local variables)</td>
</tr>

<tr>
<td>`foo(x)`
</td>
<td>`getattr(foo,"__call__")(x)`
</td>
<td>Calls use the method \_\_call\_\_ of the object
</tr>



<tr>
<td>`foo(x,y=1)`
</td>
<td>`getattr(foo,"__call__")(x,$Kw("y",Number(1)))`
</td>
<td>arguments passed as keywords are converted into objects created by the _$Kw_ function
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
<td>the lines
    catch($err51){
        if(false){void(0)}
        
are added before all `except` clauses, translated as `else if` when an exception name is specified or as an `else` when it is not the case

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
<td>The class definition body is run in a function prefixed by the sign $. This function returns an object `$class` that holds the attributes and methods of the class

The class itself is built with the function _$class\_constructor_ defined in __py\_types.js__ that builds 2 Javascript objects for the class : a "factory" used to build class instances, and an object with the class attributes and methods

The arguments passed to _$class\_constructor_ are the class name, the function prefixed by $, a tuple with the optional parent classes, the parents class names, and an optional `metaclass` keyword argument
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
<td>The code shows that the object `$class` receives the method `__init__()` as attribute

The class inherits from another class `A`, it is found as the 3rd argument of `$class_constructor`
</td>
</tr>


</table>

