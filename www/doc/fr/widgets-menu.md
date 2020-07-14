browser.widgets.menu
----------------------

Ce module permet de construire un menu constitué d'une barre de navigation
horizontale et de sous-menus disposés sous forme de menus déroulants.

Il définit une classe unique

`Menu(container=document.body, default_css=True)`
> retourne un objet menu auquel on peut attacher des éléments ou des
> sous-menus

- _container_ est l'élément dans lequel la barre de navigation horizontale
  du menu est insérée
- _default_css_ indique s'il faut utiliser la feuille de style par défaut
  fournie par le module (voir "Style CSS" ci-dessous)

Les instances de la classe `Menu` possèdents les méthodes suivantes:

`Menu.add_item(label, callback=None)`

> ajoute un élément au menu et renvoie cet élément

- _label_ est le texte de l'élément
- si _callback_ est fourni, c'est la fonction appelée quand on clique sur
  l'élément. Cette fonction doit prendre un seul argument, un objet de
  type [événement](events.html)

`Menu.add_link(label, href)`

> ajoute un lien (balise HTML `<A>`) au menu et renvoie cet élément

- _label_ est le texte du lien
- _href_ est l'adresse associée au lien

`Menu.add_menu(label)`

> ajoute un sous-menu au menu courant et renvoie ce sous-menu, qui est aussi
> une instance de la classe `Menu` à laquelle on peut donc aussi ajouter des
> éléments et des sous-menus

- _label_ est le nom du sous-menu, affiché dans le menu courant

### Exemple

<table>
<tr>
<td>
```exec
from browser import document, html
from browser.widgets.menu import Menu

zone = document["zone"]
menu = Menu(zone)
file_menu = menu.add_menu("Fichier")

save_menu = file_menu.add_menu("Enregistrer")
choix1 = save_menu.add_menu("choix 1")
choix1.add_item("sous choix 1")
choix1.add_item("sous choix 2")
save_menu.add_item("choix 2")

file_menu.add_item("Ouvrir")
save_menu = file_menu.add_menu("Propriétés")
save_menu.add_item("taille")
save_menu.add_item("sécurité")
file_menu.add_item("Imprimer")

edit_menu = menu.add_menu("Edition")
edit_menu.add_item("Rechercher")
```

</td>
<td valign="top">
  <div id="zone"></div>
</td>
</tr>
</table>

### Style CSS

Si l'argument _default_css_ passé au menu vaut `True` (valeur par défaut), la
feuille de style suivante est insérée dans le document courant:

<blockquote>
```css
/* Classes for brython.widgets.menu */

:root {
  --brython-menu-font-family: Arial;
  --brython-menu-font-size: 100%;
  --brython-menu-navbar-bgcolor: CadetBlue;
  --brython-menu-navbar-bgcolor-selected: SkyBlue;
  --brython-menu-navbar-color: #fff;
  --brython-menu-color: #000;
  --brython-menu-submenu-bgcolor: #fff;
  --brython-menu-submenu-bgcolor-selected: SkyBlue;
}

/* Items in the main horizontal navigation bar */
.brython-menu-navbar-item {
    font-family: var(--brython-menu-font-family);
    font-size: var(--brython-menu-font-size);
    background-color: var(--brython-menu-navbar-bgcolor);
    color: var(--brython-menu-navbar-color);
    padding: 0.5em 1em 0.5em 1em;
    cursor: default;
}

.brython-menu-navbar-item:hover {
    background-color: var(--brython-menu-navbar-bgcolor-selected);
}

.brython-menu-navbar-item-selected {
    background-color: var(--brython-menu-navbar-bgcolor-selected);
}

/* submenu, opened by a click on an item */
.brython-menu-submenu {
    font-family: var(--brython-menu-font-family);
    font-size: var(--brython-menu-font-size);
    background-color: var(--brython-menu-submenu-bgcolor);
    position: absolute;
    border-style: solid;
    border-width: 1px;
    border-color: var(--brython-menu-color);
    border-spacing: 0;
}

/* submenu row */
.brython-menu-submenu-row:hover {
    color: var(--brython-menu-color);
    background-color: var(--brython-menu-submenu-bgcolor-selected);
}

.brython-menu-submenu-row-selected {
    color: var(--brython-menu-color);
    background-color: var(--brython-menu-submenu-bgcolor-selected);
}

/*
   cell in a submenu row. Each row has two cells, one for the item label, the
   other one filled with a > if the item has a submenu
*/
.brython-menu-submenu-item {
    font-family: var(--brython-menu-font-family);
    padding: 0.3em 0.3em 0.3em 1em;
    cursor: default;
}

/* end of browser.widgets.menu classes */
```
</blockquote>

Pour personnaliser l'apparence du menu, il faut passer comme argument
`default_css=False` et redéfinir les classes CSS. Le plus simple est de
copier-coller la feuille de style ci-dessus et de l'éditer.
