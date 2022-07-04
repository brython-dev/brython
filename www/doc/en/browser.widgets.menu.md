browser.widgets.menu
----------------------

This module is made to build a menu, made of an horizontal navigation bar and
drop-down submenus.

It defines a single class:

`Menu(container=document.body, default_css=True)`
> return a menu object

- _container_ is the element the navigation bar is inserted into
- _default_css_ specifies if the default style sheet provided by the module
  should be used (cf. "CSS styling" below)

Instances of class `Menu` have the following methods:

`Menu.add_item(label, callback=None)`

> add an item to the menu and returns it

- _label_ is the element text
- if _callback_ is provided, it is the function called when the item is
  clicked on. This function takes a single argument, an object of type
  [event](events.html)

`Menu.add_link(label, href)`

> add a link (HTML tag `<A>`) to the menu and return this element

- _label_ is the link text
- _href_ is the address associated with the link

`Menu.add_menu(label)`

> add a submenu to the current menu and returns it; the submenu is also an
> instance of the class `Menu`, so that other items and submenus can be
> added with the same methods

- _label_ is the name of the submenu, printed in the current menu

### Example

<table>
<tr>
<td>
```exec
from browser import document, html
from browser.widgets.menu import Menu

zone = document["zone"]
menu = Menu(zone)
file_menu = menu.add_menu("File")

save_menu = file_menu.add_menu("Save")
choice1 = save_menu.add_menu("choice 1")
choice1.add_item("sub-choice 1")
choice1.add_item("sub-choice 2")
save_menu.add_item("choice 2")

file_menu.add_item("Open")
save_menu = file_menu.add_menu("Properties")
save_menu.add_item("size")
save_menu.add_item("security")

file_menu.add_item("Print")

edit_menu = menu.add_menu("Edition")
edit_menu.add_item("Search")
```

</td>
<td valign="top">
  <div id="zone"></div>
</td>
</tr>
</table>

### CSS styling

If the argument _default_css_ passed to `Menu()` is `True` (default value),
the following style sheet is inserted in the current HTML page:

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

To customize the menu, the argument `default_css` is set to `False` and the
menu classes must be redefined. The most straightforward is to copy the
stylesheet above and edit it.