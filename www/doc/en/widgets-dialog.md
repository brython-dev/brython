browser.widgets.dialog
----------------------

This module provides dialog boxes.

### Classes

`InfoDialog(title, message, *, top=None, left=None, default_css=True, remove_after=None, ok=False)`
> Displays a dialog box with an information message

- _title_ is the box title
- _message_ is the message to print
- if _top_ and _left_ are provided, they are the position of the box
  relatively to the top and left borders of the visible part of the
  document. By default, the box is centered
- _default_css_ specifies if the style sheet provided by the module should be
  used. If set to `False`, the styles defined in the HTML page are used (cf.
  "CSS Style" below)
- _remove_after_ is the number of seconds after which the box is
  automatically closed
- _ok_ specifies if an "Ok" button should be present. If the value passed is
  a string, it will be printed in the button; if is is `True`, the string "Ok"
  is printed

<blockquote>
```exec
from browser.widgets.dialog import InfoDialog

# Info box with customized "Ok" button
d1 = InfoDialog("Test", "Information message", ok="Got it")
```

```exec
from browser.widgets.dialog import InfoDialog

# Info box that disappears after 3 seconds
d1 = InfoDialog("Test", "Closing in 3 seconds", remove_after=3)
```
</blockquote>


`EntryDialog(title, message=None, *, top=None, left=None, default_css=True, ok=True)`
> Displays a dialog box with a prompt message and an entry zone.
> When the user hits the "Ok" button or the Entry key inside the entry zone,
> an event called "entry" is triggered on the `EntryDialog` instance.

- _title, top, left, default_css_ and _ok_ are the same as for `InfoDialog`
- _message_ is the optional prompt message to print at the left of the entry
  zone

> `EntryDialog` instances have an `value`, the string entered in the input
> zone. This value can used in the handler for event "entry".

<blockquote>
```exec
from browser import bind
from browser.widgets.dialog import InfoDialog, EntryDialog

d = EntryDialog("Test", "Name")

@bind(d, "entry")
def entry(ev):
  value = d.value
  d.close()
  InfoDialog("Test", f"Hello, {value} !")
```
</blockquote>


`Dialog(title, *, top=None, left=None, default_css=True, ok_cancel=False)`
> Displays a generic dialog box, that can be completed by adding elements to
> its attribute `panel`

- _title, top, left_ and _default_css_ are the same as above
- _ok_cancel_ specifies if buttons "Ok" and "Cancel" should be displayed. If
  the value passed is a 2-element list or tuple of strings, these stings will
  be printed in the buttons; if the value is `True`, strings "Ok" and "Cancel"
  are printed

`Dialog` instances have the following attributes:

- `panel` : the DIV element where additional elements can be inserted to build
  the dialog box
- `ok_button` : the "Ok" button, if present. An event handler should be
  defined for the "click" event

<blockquote>
```exec
from browser import bind, html
from browser.widgets.dialog import Dialog, EntryDialog, InfoDialog

translations = {'Français': 'Salut', 'Español': 'Hola', 'Italiano': 'Ciao'}

d = Dialog("Test", ok_cancel=True)

style = dict(textAlign="center", paddingBottom="1em")

d.panel <= html.DIV("Name " + html.INPUT(), style=style)
d.panel <= html.DIV("Language " +
                    html.SELECT(html.OPTION(k) for k in translations),
                      style=style)

# Event handler for "Ok" button
@bind(d.ok_button, "click")
def ok(ev):
  """InfoDialog with text depending on user entry, at the same position as the
  original box."""
  language = d.select_one("SELECT").value
  prompt = translations[language]
  name = d.select_one("INPUT").value
  left, top = d.scrolled_left, d.scrolled_top
  d.close()
  d3 = InfoDialog("Test", f"{prompt}, {name} !", left=left, top=top)
```
</blockquote>

### CSS Style

If the argument _default_css_ passed to the menu is `True`, the following
style sheet is inserted in the current HTML page:

<blockquote>
```css
:root {
    --brython-dialog-font-family: Arial;
    --brython-dialog-font-size: 100%;
    --brython-dialog-bgcolor: #fff;
    --brython-dialog-border-color: #000;
    --brython-dialog-title-bgcolor: CadetBlue;
    --brython-dialog-title-color: #fff;
    --brython-dialog-close-bgcolor: #fff;
    --brython-dialog-close-color: #000;
}

.brython-dialog-main {
    font-family: var(--brython-dialog-font-family);
    font-size: var(--brython-dialog-font-size);
    background-color: var(--brython-dialog-bgcolor);
    left: 10px;
    top: 10px;
    border-style: solid;
    border-color: var(--brython-dialog-border-color);
    border-width: 1px;
    z-index: 10;
}

.brython-dialog-title {
    background-color: var(--brython-dialog-title-bgcolor);
    color: var(--brython-dialog-title-color);
    border-style: solid;
    border-color: var(--brython-dialog-border-color);
    border-width: 0px 0px 1px 0px;
    padding: 0.4em;
    cursor: default;
}

.brython-dialog-close {
    float: right;
    background-color: var(--brython-dialog-close-bgcolor);
    color: var(--brython-dialog-close-color);
    cursor: default;
    padding: 0.1em;
}

.brython-dialog-panel {
    padding: 0.6em;
}

.brython-dialog-message {
    padding-right: 0.6em;
}

.brython-dialog-button {
    margin: 0.5em;
}
```
</blockquote>

To customize dialog boxes, set _default_css_ to `False` and redefine the
CSS classes. The most staightforward is to copy the stylesheet above and edit
it.

### Dialog box elements and CSS styles

The different elements of a dialog box have the following properties and CSS
classes:

<table cellpadding="3" border="1">

<tr>
<th>property</th>
<th>zone</th>
<th>default CSS class</th>
</tr>

<tr>
<td>`d`</td>
<td>the whole dialog box container</td>
<td>brython-dialog-main</td>
</tr>

<tr>
<td>`d.title_bar`</td>
<td>title bar</td>
<td>brython-dialog-title</td>
</tr>

<tr>
<td>`d.close_button`</td>
<td>close button, at the right of the title bar</td>
<td>brython-dialog-close</td>
</tr>

<tr>
<td>`d.panel`</td>
<td>zone below the title bar</td>
<td>brython-dialog-panel</td>
</tr>

<tr>
<td>`d.message`</td>
<td>message for `InfoDialog` or `EntryDialog`</td>
<td>brython-dialog-message</td>
</tr>

<tr>
<td>`d.ok_button`</td>
<td>"Ok" button</td>
<td>brython-dialog-button</td>
</tr>

<tr>
<td>`d.cancel_button`</td>
<td>"Cancel" button</td>
<td>brython-dialog-button</td>
</tr>

</table>
