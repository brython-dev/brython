Problem
-------
Handle the selection of options in a SELECT element and in checkboxes.

Solution
--------
SELECT elements are composed of OPTION elements. An OPTION element has a
boolean attribute _selected_. This attribute can be read to see if the option
is selected ; setting it to `True` or `False` selects or deselects the option.

Checkbox elements (INPUT type="checkbox") have a boolean attribute _checked_
that can be used in the same way : to know if the box is checked, or to
check/uncheck it.

The example below selects or deselects options according to the state
(checked/unchecked) of the checkbox elements ; conversely, a click in the
SELECT element triggers checking/unckecking of the matching checkboxes.

The function `show_selected()` shows how to get the list of selected elements;
`for option in sel` iterates on the option elements. For a SELECT element with
a single choice (no attribute _multiple_) the rank of the selected option is 
also given by `sel.selectedIndex`.

```exec_on_load
from browser import document as doc
from browser import html, alert

def update_select(ev):
    # selects / deselects options in the SELECT box
    # ev.target is the checkbox we just clicked
    rank = choices.index(ev.target.value)
    sel.options[rank].selected = ev.target.checked

def show_selected(ev):
    alert([option.value for option in sel if option.selected])

def update_checkboxes(ev):
    # updates checkboxes when the selection has changed
    selected = [option.value for option in sel if option.selected]
    for elt in doc.get(selector='input[type="checkbox"]'):
        elt.checked = elt.value in selected

choices = ["one","two","three","four","five"]
sel = html.SELECT(size=5, multiple=True)
for item in choices:
    sel <= html.OPTION(item)
sel.bind("change", update_checkboxes)

for item in choices:
    chbox = html.INPUT(Type="checkbox", value=item)
    chbox.bind("click", update_select)
    doc["panel"] <= item + chbox

doc["panel"] <= sel

b_show = html.BUTTON("show selected")
b_show.bind("click", show_selected)
doc["panel"] <= b_show
```

<div id="panel"></div>

