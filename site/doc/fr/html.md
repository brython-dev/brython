module **browser.html**
-----------------------

Ce module définit des classes correspondant aux balises HTML, en majuscules.

Les classes définies sont :

- les balises HTML4 : `A, ABBR, ACRONYM, ADDRESS, APPLET, AREA, B, BASE, BASEFONT, BDO, BIG, BLOCKQUOTE, BODY, BR, BUTTON, CAPTION, CENTER, CITE, CODE, COL, COLGROUP, DD, DEL, DFN, DIR, DIV, DL, DT, EM, FIELDSET, FONT, FORM, FRAME, FRAMESET, H1, H2, H3, H4, H5, H6, HEAD, HR, HTML, I, IFRAME, IMG, INPUT, INS, ISINDEX KBD, LABEL, LEGEND, LI, LINK, MAP, MENU, META, NOFRAMES, NOSCRIPT, OBJECT, OL, OPTGROUP, OPTION, P, PARAM, PRE, Q, S, SAMP, SCRIPT, SELECT, SMALL, SPAN, STRIKE, STRONG, STYLE, SUB, SUP, TABLE, TBODY, TD, TEXTAREA, TFOOT, TH, THEAD, TITLE, TR, TT, U, UL, VAR`

> En suivant [ce lien](http://www.w3.org/TR/html4/index/elements.html), vous
> trouverez la liste des balises HTML4 ainsi que leur documentation. Certaines
> balises listées ci-dessus sont devenues obsolètes en HTML4.01.

- les balises HTML5 : `ARTICLE, ASIDE, AUDIO, BDI, CANVAS, COMMAND, DATALIST, DETAILS, DIALOG, EMBED, FIGCAPTION, FIGURE, FOOTER, HEADER, HGROUP, KEYGEN, MARK, METER, NAV, OUTPUT, PROGRESS, RP, RT, RUBY, SECTION, SOURCE, SUMMARY, TIME, TRACK, VIDEO, WBR`

> En suivant [ce lien](http://www.w3.org/TR/html5-author/index.html#elements-1),
> vous trouverez la liste des balises HTML5 ainsi que leur documentation. Cette
> spécification est encore provisoire.

La syntaxe pour créer un objet (par exemple un lien hypertexte) est :

`A(`*[content,[attributes]]*`)`

> *content* est le noeud «fils» de l'objet ; il peut s'agir d'un objet Python
> comme une chaîne de caractères, un nombre, une liste, etc., ou bien une
> instance d'une autre classe du module **html**.

> *attributes* est une suite de mots-clés correspondant aux
> [attributs](http://www.w3.org/TR/html5-author/index.html#attributes-1) de la
> balise HTML. Ces attributs doivent être fournis avec la syntaxe Javascript et
> non CSS : *backgroundColor* et pas *background-color*.

Si un attribut n'est pas un nom Python valide (par exemple _data-type_) on
ne peut pas le passer comme paramètre ; il faut utiliser la méthode
`setAttribute` :

>    form = html.FORM()
>    form.setAttribute("data-type", "confirm")

Pour l’attribut *style*, la valeur fournie doit être un dictionnaire :

>    d = html.DIV('Brython', style={'height':100, 'width':200})

ou

>    d = html.DIV('Brython', style=dict(height=100, width=200))

Pour éviter les conflits avec le mot-clé de Python, l'attribut
*class* doit être écrits avec une majuscule :

>    d = html.DIV('Brython', Class="container")

On peut aussi créer un objet sans argument, puis le compléter :
- pour ajouter un noeud enfant, utiliser l'opérateur **<=**
- pour ajouter des attributs, utiliser la syntaxe Python classique :
  `objet.attribut = valeur`

Exemple :

>    link = html.A()
>    link <= html.B('connexion')
>    link.href = 'http://example.com'

On peut aussi créer plusieurs éléments de même niveau par addition (symbole
**+**) :

>    row = html.TR(html.TH('Nom')+html.TH('Prénom'))

En combinant ces opérateurs et la syntaxe Python, voici comment créer une boîte
de sélection à partir d'une liste :

>    items = ['un','deux','trois']
>    sel = html.SELECT()
>    for i, elt in enumerate(items):
>        sel <= html.OPTION(elt, value=i)
>    doc <= sel

Noter que la création d'une instance d'une classe relative aux balises HTML
entraîne la création d'un unique objet DOM. Si on affecte l'instance à une
variable, on ne peut pas l'utiliser à plusieurs endroits. Par exemple :

>    link = html.A('Python',href='http://www.python.org')
>    doc <= 'Site officiel de Python : ' + link
>    doc <= html.BR() + 'Je répète : le site est ' + link

le lien ne sera montré que dans la deuxième ligne. Une solution est de cloner
l'objet initial :

>    link = html.A('Python',href='http://www.python.org')
>    doc <= 'Site officiel de Python : '+link
>    doc <= html.BR() + 'Je répète : le site est ' + link.clone()

En général, les classes relatives au HTML ont des attributs portant le même nom
que l’objet DOM correspondant. Par exemple, on a accès à l’option choisie par
l’utilisateur au travers de l’attribut `selectedIndex` d’un objet `SELECT`.
Brython permet une approche encore plus pythonique avec quelques ajouts.

Voyons un exemple plus complet. Le code ci-dessous a généré la structure dans
la partie bleue (une `div` identifiée par `id=container`). Nous allons insérer
une structure HTML fictive dans cette `div` : une `div`, un `table`, un `form`
et un `canvas` HTML5 :

<div style="padding-left:50px;">
<table cellpadding=10>
<tr>
<td style="width:100px;">
<div id="html-doc" style="background-color:#dddddd;">
    # Tout d’abord, l’import de quelques bibliothèques.
    from browser import document as doc
    from browser import html
    
    # Nous allons ajouter les éléments à la div identifiée "container".
    container = doc['container']
    
    # Création d’une nouvelle div,
    newdiv = html.DIV(id = "new-div")
    # à laquelle on ajoute du style.
    newdiv.style = {"padding": "5px", 
                   "backgroundColor": "#ADD8E6"}
    
    # Créons un tableau à deux colonnes, une pour le numéro de ligne,
    # une pour les mots.
    text = "Brython is really cool"
    textlist = text.split()
    table = html.TABLE()
    for i, word in enumerate(textlist):
        table <= html.TR(html.TD(i + 1) + 
                         html.TD(word))
    # Un peu de style pour ce tableau:
    table.style = {"padding": "5px", 
                   "backgroundColor": "#aaaaaa",
                   "width": "100%"}
    # Maintenant, on ajoute le tableau à la div précédemment créée
    newdiv <= table + html.BR()
    
    # Un formulaire? Pourquoi pas!
    form = html.FORM()
    input1 = html.INPUT(type="text", name="firstname", value="Prénom")
    input2 = html.INPUT(type="text", name="lastname", value="Nom")
    input3 = html.BUTTON("Bouton inactif pour l’exemple!")
    form <= input1 + html.BR() + input2 + html.BR() + input3
    
    newdiv <= form + html.BR()
    
    # Finalement, quelque chose de plus orienté HTML5, un canvas avec un
    # gradient de couleurs.
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
    
    # La div est finalement insérée dans le conteneur.
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

