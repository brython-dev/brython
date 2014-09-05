Problème
--------
Obtenir le contenu d'un élément de la page web


Solution
--------

<table width="100%">
<tr>
<td style="width:50%;">

    from browser import document as doc
    from browser import alert
    # doc['zone'] est la cellule colorée
    alert(doc['zone'].text)

<button id="show_text">Montrer le texte</button>

    alert(doc['zone'].html)

<br><button id="show_html">Montrer le html</button>

    # doc['entry'] est le champ de saisie
    alert(doc['entry'].value)

<br><button id="show_value">Montrer la saisie</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">
<B>Contenu de la cellule</B><p>
<INPUT id="entry" value="champ de saisie">
</td>
</tr>
</table>

<script type="text/python3">
from browser import doc
def show_text(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)

def show_html(ev):
    src = doc.get(selector="pre.marked")[1].text
    exec(src)

def show_value(ev):
    src = doc.get(selector="pre.marked")[2].text
    exec(src)

doc['show_text'].bind('click', show_text)
doc['show_html'].bind('click', show_html)
doc['show_value'].bind('click', show_value)
</script>    

Chaque élément de la page a un attribut `text`, une chaine de caractères avec le texte visible dans l'élément

Il possède aussi un attribut `html`, une chaine avec le code HTML contenu dans l'élément

Les champs de saisie ont un attribut `value`, une chaine avec la valeur saisie

`alert()` est une fonction intégrée qui affiche ses arguments dans une fenêtre

