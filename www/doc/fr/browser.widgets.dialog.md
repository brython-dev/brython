browser.widgets.dialog
----------------------

Ce module fournit des boites de dialogue.

### Classes

`InfoDialog(title, message, *, top=None, left=None, default_css=True, remove_after=None, ok=False)`
> Affiche une boite de dialogue avec un message d'information

- _title_ est le titre de la boite
- _message_ est le message à afficher
- si _top_ et _left_ sont fournis ils indiquent la position de la
  boite par rapport au haut et à la gauche de la partie affichée de la page.
  Par défaut la boite est affichée au milieu de la page
- _default_css_ indique s'il faut utiliser la feuille de style fournie par le
  module. Si la valeur est `False`, les styles définis dans la page HTML sont
  utilisés (voir "Style CSS" ci-dessous)
- _remove_after_ est le nombre de secondes après lequel la fenêtre est
  automatiquement fermée
- _ok_ indique s'il faut afficher un bouton "Ok". Si la valeur passée est
  une chaine de caractère, elle est affichée dans le bouton, si c'est la
  valeur `True` la chaine "Ok" est affichée

<blockquote>
```exec
from browser.widgets.dialog import InfoDialog

# Boite d'information avec bouton "Ok" personnalisé
d1 = InfoDialog("Test", "Message d'information", ok="Compris")
```

```exec
from browser.widgets.dialog import InfoDialog

# Boite d'information qui disparait après 3 secondes
d1 = InfoDialog("Test", "Je ferme dans 3 secondes", remove_after=3)
```
</blockquote>


`EntryDialog(title, message=None, *, top=None, left=None, default_css=True, ok=True)`
> Affiche une boite de dialogue avec un message d'information et une zone de
> saisie.
> Quand l'utilisateur clique sur le bouton "Ok", ou tape sur la touche Entrée
> dans la zone de saisie, un événement nommé "entry" est déclenché sur
> sur l'instance de `EntryDialog`.

- _title, top, left, default_css_ et _ok_ ont la même signification que pour 
  `InfoDialog`
- _message_ est le texte optionnel à afficher à gauche de la zone d'entrée

> Les instances de `EntryDialog` possèdent l'attribut `value`, qui contient la
> chaine de caractère entrée dans la zone de saisie. Cette value peut être
> utilisée dans le gestionnaire de l'événement "entry".

<blockquote>
```exec
from browser import bind
from browser.widgets.dialog import InfoDialog, EntryDialog

d = EntryDialog("Test", "Nom")

@bind(d, "entry")
def entry(ev):
  value = d.value
  d.close()
  InfoDialog("Test", f"Bonjour, {value} !")
```
</blockquote>


`Dialog(title, *, top=None, left=None, default_css=True, ok_cancel=False)`
> Affiche une boite de dialogue générique, qu'on peut compléter en ajoutant
> des élements à son attribut `panel`

- _title, top, left_ et _default_css_ ont la même signification que ci-dessus
- _ok_cancel_ indique s'il faut afficher les boutons "Ok" et "Annuler". Si la
  valeur passée est une liste ou un tuple de 2 chaines de caractères, ces
  chaines sont affichées dans les boutons; si la value est `True`, les chaines
  "Ok" et "Cancel" sont affichées

Les instances de `Dialog` possèdent les attributs suivants:

- `title_bar` : l'élément DIV qui contient la barre de titre
- `panel` : l'élément DIV auquel on peut ajouter des éléments pour construire la
  boite de dialogue
- `ok_button` et `cancel_button` : les boutons "Ok" et "Annuler". On peut leur
  attacher des gestionnaires d'événement pour l'événement "click"

<blockquote>
```exec
from browser import bind, html
from browser.widgets.dialog import Dialog, EntryDialog, InfoDialog

translations = {'Français': 'Salut', 'Español': 'Hola', 'Italiano': 'Ciao'}

d = Dialog("Test", ok_cancel=True)

style = dict(textAlign="center", paddingBottom="1em")

d.panel <= html.DIV("Nom " + html.INPUT(), style=style)
d.panel <= html.DIV("Langue " +
                    html.SELECT(html.OPTION(k) for k in translations),
                      style=style)

# Gestionnaire d'événement pour le bouton "Ok"
@bind(d.ok_button, "click")
def ok(ev):
  """Boite de dialogue avec message, positionnée à la place de la boite
  d'origine."""
  language = d.select_one("SELECT").value
  prompt = translations[language]
  name = d.select_one("INPUT").value
  left, top = d.scrolled_left, d.scrolled_top
  d.close()
  d3 = InfoDialog("Test", f"{prompt}, {name} !", left=left, top=top)
```
</blockquote>

### Style CSS

Si l'argument _default_css_ passé au menu vaut `True` (valeur par défaut), la
feuille de style suivante est insérée dans le document courant:

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

Pour personnaliser l'apparence des boites, il faut passer comme argument
`default_css=False` et redéfinir les classes CSS. Le plus simple est de
copier-coller la feuille de style ci-dessus et de l'éditer.

### Zones d'une boite de dialogue et classes CSS

Les différentes zones de la boite possèdent les propriétés et les classes CSS
suivantes:

<table cellpadding="3" border="1">

<tr>
<th>propriété</th>
<th>zone</th>
<th>classe CSS par défaut</th>
</tr>

<tr>
<td>`d`</td>
<td>boite de dialogue entière</td>
<td>brython-dialog-main</td>
</tr>

<tr>
<td>`d.title_bar`</td>
<td>barre de titre</td>
<td>brython-dialog-title</td>
</tr>

<tr>
<td>`d.close_button`</td>
<td>bouton de fermeture, à droite de la barre de titre</td>
<td>brython-dialog-close</td>
</tr>

<tr>
<td>`d.panel`</td>
<td>zone située sous la barre de titre</td>
<td>brython-dialog-panel</td>
</tr>

<tr>
<td>`d.message`</td>
<td>message pour `InfoDialog` ou `EntryDialog`</td>
<td>brython-dialog-message</td>
</tr>

<tr>
<td>`d.ok_button`</td>
<td>bouton "Ok"</td>
<td>brython-dialog-button</td>
</tr>

<tr>
<td>`d.cancel_button`</td>
<td>bouton "Annuler"</td>
<td>brython-dialog-button</td>
</tr>

</table>
