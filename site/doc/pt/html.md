módulo **browser.html**
-----------------------

Este módulo expõe as etiquetas HTML. O nome da etiqueta é em letras
maiúsculas.

As classes definidas neste módulo são:

- etiquetas HTML4: `A, ABBR, ACRONYM, ADDRESS, APPLET, AREA, B, BASE, 
            BASEFONT, BDO, BIG, BLOCKQUOTE, BODY, BR, BUTTON, 
            CAPTION, CENTER, CITE, CODE, COL, COLGROUP, DD, 
            DEL, DFN, DIR, DIV, DL, DT, EM, FIELDSET, FONT, 
            FORM, FRAME, FRAMESET, H1, H2, H3, H4, H5, H6, 
            HEAD, HR, HTML, I, IFRAME, IMG, INPUT, INS, 
            ISINDEX, KBD, LABEL, LEGEND, LI, LINK, MAP, MENU, 
            META, NOFRAMES, NOSCRIPT, OBJECT, OL, OPTGROUP, 
            OPTION, P, PARAM, PRE, Q, S, SAMP, SCRIPT, SELECT, 
            SMALL, SPAN, STRIKE, STRONG, STYLE, SUB, SUP, 
            TABLE, TBODY, TD, TEXTAREA, TFOOT, TH, THEAD, 
            TITLE, TR, TT, U, UL, VAR`

- etiquetas HTML5: `ARTICLE, ASIDE, AUDIO, BDI, CANVAS, 
                      COMMAND, DATA, DATALIST, EMBED, FIGCAPTION, 
                      FIGURE, FOOTER, HEADER, KEYGEN, MAIN, MARK, 
                      MATH, METER, NAV, OUTPUT, PROGRESS, RB, 
                      RP, RT, RTC, RUBY, SECTION, SOURCE, 
                      SUMMARY, TEMPLATE, TIME, TRACK, VIDEO, 
                      WBR`

- etiquetas HTML5.1 : `DETAILS, DIALOG, MENUITEM, PICTURE, SUMMARY`

> Neste
> [link](https://w3c.github.io/elements-of-html/) você
> pode encontrar o índice de etiquetas (tags) HTML com referências
> (rascunho de especificação).

Nota: Nos exemplos seguintes assumimos que o módulo **browser.html**
foi importado como segue: `from brower import html`

A sintaxe para criar um objeto (p.ex. um hyperlink) é:

`html.A(`*[content,[attributes]]*`)`

> *content* é o conteúdo, o nodo filho do objeto; ele pode ser um
> objeto Python como uma cadeia, um número, uma lista, etc., ou uma
> instância de uma outra classe do módulo **html**

> *atributes* é o conjunto de atributos do elemento, é uma sequência
> de palavras-chave correspondentes aos
> [atributos](http://www.w3.org/TR/html5-author/index.html#attributes-1)
> da etiqueta HTML. Estes atributos devem ser fornecidos com a sintaxe
> Javascript, e não CSS (p.ex. *backgroundColor* em vez de
> *background-color*)

Se um atributo não for um nome válido em Python (ex. _data-type_) ele
pode ser passado como um argumento; o método `setAttribute` deve ser
usado:

>    form = html.FORM()
>    form.setAttribute("data-type", "confirm")

Para o atributo *style*, o valor deve ser um dicionário:

>    d = html.DIV('Brython', style={'height':100, 'width':200})

ou

>    d = html.DIV('Brython', style=dict(height=100, width=200))

Para evitar conflitos com palavra-chave de Python, atributo
*class* deve ter a primeira letra maiúscula:

>    d = html.DIV('Brython', Class="container")

Você pode também criar um objeto sem argumentos e acrescentá-los
depois:

- para adicionar um nodo filho, use o operador **<=**
- para adicionar atributos, use a sintaxe clássica de Python: `object.attribute = value`

Exemplo :    
>    link = html.A()
>    link <= html.B('conection')
>    link.href = 'http://example.com'

Você pode também criar múltiplos elementos no mesmo nível usando o
sinal de adição (+):

>    row = html.TR(html.TH('LastName') + html.TH('FirstName'))

Abaixo vemos como criar uma caixa de seleção a partir de uma lista (ao
combinar estes operadores e a sintaxe Python):

>    items = ['one', 'two', 'three']
>    sel = html.SELECT()
>    for i, elt in enumerate(items):
>        sel <= html.OPTION(elt, value = i)
>    doc <= sel

É importante notar que a criação de uma instância de uma classe
consiste na criação de HTML de um único objeto DOM. Se designarmos a
instância a uma variável, você não pode usá-la em diversos
lugares. Por exemplo, com este código:

>    link = A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= P( + 'I repeat: the site is ' + link

o link aparecerá somente na segunda linha. Uma solução é clonar o
objeto original:

>    link = html.A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= html.P() + 'I repeat: the site is ' + link.clone()

Como regra geral, atributos de instâncias de classes HTML têm o mesmo
nome que os objetos DOM correspondentes. Por exemplo, podemos obter a
opção selecionada pelo atributo `selectedIndex` do objeto
`SELECT`. Brython adiciona algumas coisas para tornar a manipulação um
pouco mais Pythonica.

Vejamos um exemplo mais completo. O código abaixo cria a estrutura no
painel azul. O painel azul é um elemento `div` com o atributo
`Id="container"`. Usaremos este `div` para criar internamente uma
estrutura html "feia" com um div, uma tabela, um formulário e uma tela
(canvas) HTML5:

<div style="padding-left:50px;">
<table cellpadding=10>
<tr>
<td style="width:100px;">
<div id="html-doc" style="background-color:#dddddd;">
    # Primeiro, importar algumas bibiliotecas
    from browser import doc, html
    
    # Todos os elementos serão inseridos no div com o Id "container"
    container = doc['container']
    
    # Criamos um novo elemento div
    newdiv = html.DIV(id = "new-div")
    # Agora adicionamos um estilo
    newdiv.style = {"padding": "5px", 
                   "backgroundColor": "#ADD8E6"}
    
    # Vamos adicionar a tabela com uma coluna com números
    # e uma coluna com uma palavra em cada célula
    text = "Brython is really cool"
    textlist = text.split()
    table = html.TABLE()
    for i, word in enumerate(textlist):
        table <= html.TR(html.TD(i + 1) + 
                         html.TD(word))
    # Adicionamos um estilo à tabela
    table.style = {"padding": "5px", 
                   "backgroundColor": "#aaaaaa",
                   "width": "100%"}
    # Adicionamos a tabela ao novo div previamente criado
    newdiv <= table + html.BR()
    
    # um formulário? por que não?
    form = html.FORM()
    input1 = html.INPUT(type="text", name="firstname", value="First name")
    input2 = html.INPUT(type="text", name="lastname", value="Last name")
    input3 = html.BUTTON("Button with no action!")
    form <= input1 + html.BR() + input2 + html.BR() + input3
    
    newdiv <= form + html.BR()
    
    # Finalmente, vamos adicionar alguma coisa mais 'HTML5ística', uma canvas com
    # um gradiente de cor no novo div previamente criado e abaixo do formulário
    canvas = html.CANVAS(width = 300, height = 300)
    canvas.style = {"width": "100%"}
    ctx = canvas.getContext('2d')
    ctx.rect(0, 0, 300, 300)
    grd = ctx.createRadialGradient(150, 150, 10, 150, 150, 150)
    grd.addColorStop(0, '#8ED6FF')
    grd.addColorStop(1, '#004CB3')
    ctx.fillStyle = grd
    ctx.fill()
    
    newdiv <= canvas
    
    # E finalmente, acrescentamos o elemento newdiv
    # ao elemento pai, neste caso o div com Id "container"
    container <= newdiv
    
</div>
</td>
<td>
<div id="container"></div>
</td>
</tr>
</table>
</div>

<script type="text/python">
exec(doc["html-doc"].text)
</script>

