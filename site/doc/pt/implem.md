Tradução da sintaxe de Python em código Javascript
--------------------------------------------------

<table border=1 cellpadding=3>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Comentários</th>
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
<td>As duas primeiras linhas estão presentes em todos os scripts; elas
definem as variáveis que são usadas pelas funções integradas
`globals()` e `locals()`. Elas não serão repsoduzidas nos próximos
exemplos.

_float_ é uma função Javascript definnida em __py\_builtin\_functions.js__</td>
</tr>

<tr>
<td>`x = foo.bar`</td>
<td>`x=getattr(foo,"bar")`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`foo.bar = x`</td>
<td>`setattr(foo, "bar", x)`
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
<td>O mesmo para todos os operadores.
<br>Necessário para implementar operações como 2 * "a"</td>
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
<td>Estamos mantendo o operador && de Javascript de forma a não avaliar b se a for falso.
<br>_$test\_item_ retorna um valor booleano de Javascript (true ou false) e armazena o valor resultante em uma variável global; _$test\_expr_ retorna esta variável global</td>
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
<td>_$no\_break_ é um booleano usado se o laço `for` tiver uma cláusula `else`

_$pop\_exc()_ é uma função interna que remove a última excessão da
pilha de excessçoes

_$is\_exc(exc,classes)_ é uma função interna que verifica se a
excessão _exc_ é uma instância de uma das _classes_

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
<td>A tradução é bastante longa, mas a resolução de excessões deve ser feita em tempo de execução</td></tr>

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

_$ns_ é uma variável interna, um objeto retornado pela função
integrada _$MakeArgs_ que inspeciona os argumentos da função e atribui
valores de acordo com a assinatura da função.

Se nenhuma excessão for levantada por _$MakeArgs_, os valores locais
são atribuídos, e armazenados em uma variável initerna _$locals_, e no
atributo _\_\_dict\_\__ de um valor do objeto interno
_\_\_BRYTHON\_\_.scope_ indexado por uma cadeia aleatória (no exemplo
"a54xmumg") associada com a função.

Para ser consistente com a gestão do espaço de nomes (namespace) de
Python, a variável local `x` é declarada pela palavra-chave `var`.

A linha `window.foo = foo` adiciona o nome da função ao espaço de
nomes do navegador; ela somente existirá se a função estiver no nível
de módulo e não dentro de outra função.

O atributo _$type_ da função é usado internamente para separar funções
em nível de módulo de métodos definidos em classes.

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
<td>Para uma variável global, não usamos a palavra-chave `var`.</td>
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
<td>
A função _$MakeArgs_ constrói um objeto Javascript combinando os nomes
definidos na assinatura da função com os valores que são realmente
passados a ela. A linha seguinte constrói o espaço de nomes da função
(variáveis locais)
</td>
</tr>

<tr>
<td>`foo(x)`
</td>
<td>`getattr(foo,"__call__")(x)`
</td>
<td>Chamadas usam o método \_\_call\_\_ do objeto.
</tr>

<tr>
<td>`foo(x,y=1)`
</td>
<td>`getattr(foo,"__call__")(x,$Kw("y",Number(1)))`
</td>
<td>Argumentos passados como palavras-chave são convertidos em objetos criados pela funlção _$Kw_
</tr>

<tr>
<td>
    x='brython'
    try:
        x[2]='a'
    except TypeError:
        log('error')
    except:
        log('another error')
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
<td>As linhas
    catch($err0){
        if(false){void(0)}
        
são adicionadas antes de todas as cláusulas `except`, traduzidas como
`else if` quando o nome de uma excessão é especificado ou como `else`
quando não for esse o caso.

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
<td>

O corpo da definição da classe é executado em uma função com o prefixo
$. Esta função retorna um objeto `$class` que contém os atributos e
métodos da classe.

A classe em si é construída com a função _$class\_constructor_
definida em __py\_utils.js__ que constrói 2 onjetos Javascript para a
classe: uma "fábrica" (factory) usada para construir instâncias da
classe, e um objeto com os atributos e métodos de classe.

Os argumentos passados para _$class\_constructor_ são o nome da
classe, a função prefixada com $, e uma tupla com as classes pai
opcionais

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
<td>O código mostra que o objeto `$class` recebe o método `__init__()` como um atributo

A classe herda de uma outra classe `A`. É o terceiro argumento de `$class_constructor`.
</td>
</tr>

</table>
