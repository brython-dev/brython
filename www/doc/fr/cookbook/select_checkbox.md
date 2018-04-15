Problème
--------
Gérer la sélection d'options dans un élément SELECT ou dans des cases à cocher (checkbox).

Solution
--------
Les éléments SELECT sont composés d'éléments OPTION. Un élément OPTION possède 
un attribut booléen _selected_. On peut lire cet attribut pour savoir si 
l'option est sélectionnée, ou lui donner une valeur `True` ou `False` pour la 
sélectionner ou la désélectionner.

Les éléments de type case à cocher (INPUT type="checkbox") possèdent un 
attribut booléen _checked_ qui peut être utilisé de la même façon, pour savoir
 si la case est sélectionnée, ou pour la cocher / décocher.

L'exemple ci-dessous sélectionne ou désélectionne les options en fonction du 
cochage des éléments de type "checkbox" ; inversement, un clic dans l'élément 
SELECT se traduit par le cochage / décochage des cases à cocher.

La fonction `show_selected()` montre comment obtenir la liste des éléments 
sélectionnés : `for option in sel` itère sur les éléments OPTION. Pour un 
élément SELECT avec choix unique (sans attribut _multiple_) on peut aussi 
récupérer le rang de l'option sélectionnée par `sel.selectedIndex`

```exec_on_load
from browser import doc, html, alert

def update_select(ev):
    # sélectionne / désélectionne les options dans l'élément SELECT
    # ev.target est la case à cocher sur laquelle on vient de cliquer
    rank = choices.index(ev.target.value)
    sel.options[rank].selected = ev.target.checked

def show_selected(ev):
    alert([option.value for option in sel if option.selected])

def update_checkboxes(ev):
    # met à jour les cases à cocher quand le SELECT a été modifié
    selected = [option.value for option in sel if option.selected]
    for elt in doc.get(selector='input[type="checkbox"]'):
        elt.checked = elt.value in selected
    
choices = ["un", "deux", "trois", "quatre", "cinq"]
sel = html.SELECT(size=5, multiple=True)
for item in choices:
    sel <= html.OPTION(item)
sel.bind("change", update_checkboxes)

for item in choices:
    chbox = html.INPUT(Type="checkbox", value=item)
    chbox.bind("click", update_select)
    doc["panel"] <= item + chbox

doc["panel"] <= sel

b_show = html.BUTTON("montrer la sélection")
b_show.bind("click", show_selected)
doc["panel"] <= b_show
```

<div id="panel"></div>

