module **browser.html**
-----------------------

This module exposes the HTML tags. The tag name is in uppercase letters

The classes defined are :

- HTML4 tags : <code>A, ABBR, ACRONYM, ADDRESS, APPLET, AREA, B, BASE, 
BASEFONT, BDO, BIG, BLOCKQUOTE, BODY, BR, BUTTON, 
CAPTION, CENTER, CITE, CODE, COL, COLGROUP, DD, 
DEL, DFN, DIR, DIV, DL, DT, EM, FIELDSET, FONT, 
FORM, FRAME, FRAMESET, H1, H2, H3, H4, H5, H6, 
HEAD, HR, HTML, I, IFRAME, IMG, INPUT, INS, 
ISINDEX, KBD, LABEL, LEGEND, LI, LINK, MAP, MENU, 
META, NOFRAMES, NOSCRIPT, OBJECT, OL, OPTGROUP, 
OPTION, P, PARAM, PRE, Q, S, SAMP, SCRIPT, SELECT, 
SMALL, SPAN, STRIKE, STRONG, STYLE, SUB, SUP, SVG,
TABLE, TBODY, TD, TEXTAREA, TFOOT, TH, THEAD, 
TITLE, TR, TT, U, UL, VAR</code>

- HTML5 tags : <code>ARTICLE, ASIDE, AUDIO, BDI, CANVAS, 
COMMAND, DATA, DATALIST, EMBED, FIGCAPTION, 
FIGURE, FOOTER, HEADER, KEYGEN, MAIN, MARK, 
MATH, METER, NAV, OUTPUT, PROGRESS, RB, 
RP, RT, RTC, RUBY, SECTION, SOURCE, 
SUMMARY, TEMPLATE, TIME, TRACK, VIDEO, 
WBR</code>

- HTML5.1 tags : <code>DETAILS, DIALOG, MENUITEM, PICTURE, SUMMARY</code>

> In the following [link](https://w3c.github.io/elements-of-html/) you can 
> find the index of HTML tags with references (DRAFT).

[Note: In the following examples we assume that the **browser.html** module 
has been imported as follows: `from brower import html`]

The syntax to create an object (e.g. a hyperlink) is :

`A(`*[content,[attributes]]*`)`

> *content* is the child node of the the object ; it can be a Python object 
> such as a string, a number, etc., or an instance of another class in 
> the **html** module

> *attributes* is a sequence of keywords corresponding to the 
> [attributes](http://www.w3.org/TR/html5-author/index.html#attributes-1) of 
> the HTML tag. If the attribute contains a hyphen (`-`) it must be replaced by
> an underscore (`_`) : *http\_equiv* and not *http-equiv* (the `-` would be
> interpreted as the minus sign).


If *content* is an iterable (other than a string), all the items in the
iterable become children of the object. For instance :

```python
html.UL(html.LI('item %s' %i) for i in range(5))
```

creates an unordered list with the `<li>` tags in the generator expression

For the *style* attribute, the value must be a dictionary :

```python
d = html.DIV('Brython', style={'height':100, 'width':200})
````

or

```python
d = html.DIV('Brython', style=dict(height=100, width=200))
```

The keyword arguments of *style* must be written by the Javascript syntax, not
CSS : *backgroundColor* and not *background-color*.

To avoid conflicts with the Python keyword, the attribute *class* must be 
capitalized :

```python
d = html.DIV('Brython', Class="container")
```

You can also create an object without argument, then build it up:

- to add a child node, use the **<=** operator
- to add attributes, use the classic Python syntax : 
  `object.attribute = value`

Example :    

```python
link = html.A()
link <= html.B('connexion')
link.href = 'http://example.com'
```

You can also create multiple elements at the same level by using the plus (+) 
sign :

```python
row = html.TR(html.TH('LastName') + html.TH('FirstName'))
```

and you can add all the items in an iterable :

```python
from browser.html import *

t = TABLE()
t <= TR(TH('Number')+TH('Square'))
t <= (TR(TD(i)+TD(i*i)) for i in range(10))
```

Here is how to create a selection box from a list (by combining these 
operators and Python syntax) :

```python
from browser import document
from browser.html import *

document <= SELECT(OPTION(elt, value=i) 
    for i, elt in enumerate(['one', 'two', 'three']))
```

It is important to note that the creation of an instance of a class involves 
creating HTML from a single DOM object. If we assign the instance to a 
variable, you can not use it in several places. For example, with this code :

```python
link = html.A('Python', href='http://www.python.org')
document <= 'Official Python Website: ' + link
document <= html.P() + 'I repeat: the site is ' + link
```

the link will only show in the second line. One solution is to clone the 
original object :

```python
link = html.A('Python', href='http://www.python.org')
document <= 'Official Python Website: ' + link
document <= html.P() + 'I repeat: the site is ' + link.clone()
```

As a rule of thumb, instances of HTML classes have the same attribute names as
the corresponding DOM objects. For example, it can retrieve the option 
selected by the `selectedIndex` attribute of the `SELECT` object. Brython adds 
a few things to make the manipulation a bit more Pythonic

Let's see a more complete example. The code below have created the structure 
in the blue panel. The blue panel is a `div` element with `id="container"` 
attribute.

We will use this `div` to create an 'ugly' html structure inside with a div, a
table, a form and a HTML5 canvas:

<div style="padding-left:50px;">
<table cellpadding=10>
<tr>
<td style="width:100px;">
```exec_on_load
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
```
</td>
<td>
<div id="container"></div>
</td>
</tr>
</table>
</div>
