Usando objetos Javascript
-------------------------

Teremos que gerenciar o período de transição em que Brython irá
coexistir com Javascript ;-)

### Acessando objetos de Brython a partir de código Javascript

Por padrão, Brython expõe somente dois nomes no espaço de nomes
(namespace) global de Javascript:

> `brython()` : a função executada ao carregar a página.

> `__BRYTHON__` : um objeto usado internamente por Brython para
> guardar os objetos necessários à execução dos scripts

Consequentemente, por padrão, um programa Javascript não pode acessar
objetos Brython. Por exemplo, para a função `echo()` definida em um
script Brython reagir a um evento em um elemento na página, em vez de
usar a sintaxe regular de Javascript:

    <button onclick="echo()">

(porque a função _echo_ de Brython não é acessável pelo Javascript),
uma solução é atribuir um id ao elemento:

    <button id="mybutton">

e definir o vínculo entre este elemento e o evento _click_ fazendo:

    doc['mybutton'].bind('click',echo)

Uma outra opção é forçar a introdução do nome _echo_ no espaço de
nomes de Javascript definindo-a como um atributo do objeto `window` no
módulo **browser**:

    from browser import window
    window.echo = echo

**NOTA: Este método não é recomendado, pois ele cria um risco de**
**conflito com nomes definidos em um programa ou biblioteca de**
**Javascript usado na página.**

### Objetos em programas Javascript

Um documento HTML pode usar scripts e bibliotecas em Javascript, e
scripts e bibliotecas em Python. Brython não pode usar objetos
Javascript diretamente: por exemplo, a busca de atributos usa o
atributo _\_\_class\_\__ que não existe em objetos objetos Javascript.

Para poder utilizá-los em um script Python, eles devem ser
explicitamente transformados pela função `JSObject()` definida no
módulo **javascript**.

Por exemplo:

    <script type="text/javascript">
    circle = {surface:function(r){return 3.14*r*r}}
    </script>
    
    <script type="text/python">
    from browser import doc
    from javascript import JSObject
    doc['result'].value = JSObject(circle).surface(10)
    </script>

### Usando construtores Javascript

Se uma função Javascript é um construtor de objetos, que pode ser
chamada em Javascript com a palavra-chave `new`, ela pode ser usada em
Brython transformando-a com a função `JSConstructor()` definida no
módulo **javascript**.

`JSConstructor(`_constr_`)`

> retorna a função que, quando chamada com argumantos, retorna um
> objeto Python que corresponde ao objeto Javascript construído pelo
> construtor _constr_

Por exemplo:

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
    from browser import alert
    from javascript import JSConstructor
    rectangle = JSConstructor(Rectangle)
    alert(rectangle(10,10,30,30).surface())
    </script>

### Exemplo jQuery

Abaixo um exemplo mais completo de como você pode usar a popular
biblioteca jQuery:

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
        from browser import doc
        from javascript import JSObject
        
        def change_color(ev):
          _divs=doc.get(selector='div')
          for _div in _divs:
              if _div.style.color != "blue":
                 _div.style.color = "blue"
              else:
                 _div.style.color = "red"
        
        # creating an alias for "$" in jQuery would cause a SyntaxError in Python
        # so we assign jQuery to a variable named jq

        jq = jQuery.noConflict(true)
        _jQuery=JSObject(jq("body"))
        _jQuery.click(change_color)    
    </script>
    
    <body onload="brython()">

      <div>Click here</div>
      <div>to iterate through</div>
      <div>these divs.</div>
     
    </body>
    </html>
