módulo **javascript**
---------------------

O módulo **javascript** permite a interação com objetos definidos em
programas e bibliotecas em Javascript presentes na mesma página que o
programa em Brython.

Ele define duas classes:

**javascript**.`JSObject`
> é uma classe cujas instâncias intermediam objetos Javascript

> <code>JSObject(_jsobj_)</code> retorna um objeto *brobj* que
> intermedia o objeto Javascript *jsobj*. Operações realizadas na
> instância de `JSObject` impactam o objeto Javascript convertendo, o
> mais precisamente possível, tipos Python em tipos Javascript.

> Se *jsobj* é uma função, os argumentos passados para *brobj* são
> convertidos antes de serem passados para *jsobj* da seguinte
> maneira:

> <table border='1'>
<tr><th>Argumento na chamada da função em Brython</th><th>Argumento passado para a função Javascript</th></tr>
<tr><td>instância de `DOMNode`</td><td>elementos DOM</td></tr>
<tr><td>instância de `DOMEvent`</td><td>evento DOM</td></tr>
<tr><td>lista de instâncias de `DOMNode`</td><td>lista de nodos DOM</td></tr>
<tr><td>`None, True, False`</td><td>`null, true, false`</td></tr>
<tr><td>instância de `int`</td><td>inteiro</td></tr>
<tr><td>instância de `float`</td><td>ponto flutuante (float)</td></tr>
<tr><td>instância de `str`</td><td>cadeia de caractéres</td></tr>
<tr><td>instância de `list`</td><td>array Javascript</td></tr>
<tr><td>instância de `JSObject`</td><td>objeto Javascript</td></tr>
</table>

> O resultado é convertido para um objeto Brython usando operações
> reversas.

**javascript**.`JSConstructor`

> é uma classe cujas instâncias representam construtores Javascript,
> (ex. funções usadas com a paravra-chave de Javascript `new`)

> <code>JSConstructor(_jsconstr_)</code> retorna um objeto
> Brython. Este objeto é chamável; ele retorna uma instância de
> `JSObject` representando o objeto Javascript obtido ao passar para o
> construtor *jsconstr* os argumentos convertidos como indicado na
> tabela acima

Exemplos
--------
Usando `JSObject` com a biblioteca jQuery:

>    from javascript import JSObject
>
>    def callback(*args):
>        ...
>
>    _jQuery=JSObject($("body"))
>    _jQuery.click(callback)

> Veja [jQuery](../../gallery/jsobject_example.html) para uma
> demonstração.


Usando `JSConstructor` com a biblioteca three.js:

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor( THREE.PerspectiveCamera )
>    camera = cameraC( 75, 1, 1, 10000 )

> Veja [three](../../gallery/three.html) para um exemplo totalmente
> funcional.
