módulo **browser.html**
-----------------------

Este módulo permite acceder a las etiquetas HTML. El nombre de la etiqueta se escribe en mayúsculas. 

Las etiquetas disponibles son :

- Etiquetas HTML4 : `A, ABBR, ACRONYM, ADDRESS, APPLET,AREA, B, BASE, BASEFONT, BDO, BIG, BLOCKQUOTE, BODY, BR, BUTTON, CAPTION, CENTER, CITE, CODE, COL, COLGROUP, DD, DEL, DFN, DIR, DIV, DL, DT, EM, FIELDSET, FONT, FORM, FRAME, FRAMESET,H1, H2, H3, H4, H5, H6, HEAD, HR, HTML, I, IFRAME, IMG, INPUT, INS, ISINDEX, KBD, LABEL, LEGEND, LI, LINK, MAP, MENU, META, NOFRAMES, NOSCRIPT, OBJECT,OL, OPTGROUP, OPTION, P, PARAM, PRE, Q, S, SAMP, SCRIPT, SELECT, SMALL, SPAN, STRIKE, STRONG, STYLE, SUB, SUP, TABLE, TBODY, TD, TEXTAREA, TFOOT, TH, THEAD, TITLE, TR, TT, U, UL, VAR`

> En el siguiente [enlace](http://www.w3.org/TR/html4/index/elements.html) puedes ver un listado de las etiquetas HTML4 con sus referencias. Algunas de las etiquetas de arriba han sido abandonadas HTML4.01.

- Etiquetas HTML5 : `ARTICLE, ASIDE, AUDIO, BDI, CANVAS, COMMAND, DATALIST, DETAILS, DIALOG, EMBED, FIGCAPTION, FIGURE, FOOTER, HEADER, HGROUP, KEYGEN, MARK, METER, NAV, OUTPUT, PROGRESS, RP, RT, RUBY, SECTION, SOURCE, SUMMARY, TIME, TRACK, VIDEO, WBR`

> En el siguiente [enlace](http://www.w3.org/TR/html5-author/index.html#elements-1) puedes ver un listado de las etiquetas HTML5 con sus referencias (Borrador).

[Nota: En los siguientes ejemplos a continuación se asume que el módulo **browser.html** ha sido importado de la siguiente forma: `from brower import html`]

La sintaxis para crear un objeto (eg un hiperenlace) es :

<code>A(*[content,[attributes]]*)</code>

- _content_ es el nodo hijo del objeto ; puede ser un objeto Python como un string, un número, una lista, etc, o una instancia de otra clase del módulo `html`
- _attributes_ es una secuencia de palabras clave (keywords) correspondientes a los [atributos](http://www.w3.org/TR/html5-author/index.html#attributes-1) de la etiqueta HTML . Estos atributos deben ser introducidos con sintaxis Javascript, no CSS: _backgroundColor_ en lugar de _background-color_

Para el atributo _style_, el valor debe ser un diccionario :

>    d = html.DIV('Brython', style={'height':100, 'width':200})

Para evitar conflictos con la palabra clave de Python, el atributo _class_ se debe escribir con la primera letra en mayúscula :

>    d = html.DIV('Brython', Class="container")

También se puede crear un objeto sin argumentos y añadirlos a posteriori:

- Para añadir un nodo hijo hay que usar el operador **<=**
- Para añadir atributos se usa la sintaxis clásica de Python : `object.attribute = value`

Ejemplo :

>    link = html.A()
>    link <= html.B('connexion')
>    link.href = 'http://example.com'

También se pueden crear múltiples elementos al mismo nivel usando el signo más (+) :

>    row = html.TR(html.TH('LastName') + html.TH('FirstName'))

Aquí se puede ver como crear una caja de selección a partir de una lista (mediante la combinación de los operadores descritos y sintaxis Python) :

>    items = ['one', 'two', 'three']
>    sel = html.SELECT()
>    for i, elt in enumerate(items):
>        sel <= html.OPTION(elt, value = i)
>    doc <= sel

Es importante resaltar que la creación de una instancia de una clase conlleva la creación HTML a partir de un único objeto DOM. Si asignamos la instancia a una variable, no podrá ser usada en varios sitios. Por ejemplo, con este codigo :

>    link = html.A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= html.P() + 'I repeat: the site is ' + link

El link solo se mostrará en la segunda línea. Una solución sería clonar el objeto original :

>    link = html.A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= html.P() + 'I repeat: the site is ' + link.clone()

Como regla general, los atributos de las instancias de clases HTML tienen el mismo nombre que los objetos DOM correspondientes. Por ejemplo, podemos obtener la opción seleccionada por el atributo _selectedIndex_ del objeto SELECT. Brython añade algunas cosas que permiten que la manipulación sea un poco más Pythónica

Veamos un ejemplo más completo. El código a continuación ha creado la estructura del panel azul. El panel azul es un elemento `div` con el atributo `id="container"`.
Usaremos este `div` para crear una estructura HTML 'poco elegante' con un `div`, una tabla, un formulario y un elemento canvas HTML5:

<div style="padding-left:50px;">
<table cellpadding=10>
<tr>
<td style="width:100px;">
<div id="html-doc" style="background-color:#dddddd;">
    # First of all, the import of some libraries
    from browser import document as doc
    from browser import html
    
    # All the elements will be inserted in the div with the "container" id
    container = doc['container']
    
    # We create a new div element
    newdiv = html.DIV(id = "new-div")
    # Now we add some style
    newdiv.style = {"padding": "5px", 
                   "backgroundColor": "#ADD8E6"}
    
    # Now, lets add a table with a column with numbers and a
    # column with a word on each cell
    text = "Brython is really cool"
    textlist = text.split()
    table = html.TABLE()
    for i, word in enumerate(textlist):
        table <= html.TR(html.TD(i + 1) + 
                         html.TD(word))
    # Now we add some style to the table
    table.style = {"padding": "5px", 
                   "backgroundColor": "#aaaaaa",
                   "width": "100%"}
    # Now we add the table to the new div previously created
    newdiv <= table + html.BR()
    
    # a form? why not?
    form = html.FORM()
    input1 = html.INPUT(type="text", name="firstname", value="First name")
    input2 = html.INPUT(type="text", name="lastname", value="Last name")
    input3 = html.BUTTON("Button with no action!")
    form <= input1 + html.BR() + input2 + html.BR() + input3
    
    newdiv <= form + html.BR()
    
    # Finally, we will add something more 'HTML5istic', a canvas with
    # a color gradient in the newdiv previously created and below the form
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
    
    # And finally we append the newdiv element
    # to the parent, in this case the div with the "container" id
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

