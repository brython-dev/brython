from browser import console, document, html, window, alert

style_sheet = """
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

/* Item in the main horizontal navigation bar */
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

/* Table for a submenu, opened by a click on an item */
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

/* TR for a submenu item row */
.brython-menu-submenu-row:hover {
    color: var(--brython-menu-color);
    background-color: var(--brython-menu-submenu-bgcolor-selected);
}

.brython-menu-submenu-row-selected {
    color: var(--brython-menu-color);
    background-color: var(--brython-menu-submenu-bgcolor-selected);
}

/*
   TD for a cell in a submenu row
   Each row has two cells, one for the item label, the other one
   filled with a > if the item has a submenu
*/
.brython-menu-submenu-item {
    font-family: var(--brython-menu-font-family);
    padding: 0.3em 0.3em 0.3em 1em;
    cursor: default;
}

/* end of browser.widgets.menu classes */

"""


class Menu:

    def __init__(self, container=document.body, parent=None, default_css=True):
        """Create a new menu, inserted inside the container. For the top level
        menu, parent is None, otherwise it is a SPAN element (top menu) or a
        TR element (submenu)."""
        self.container = container
        self.parent = parent

        if default_css:
            # Insert default CSS stylesheet if not already loaded
            for stylesheet in document.styleSheets:
                if stylesheet.ownerNode.id == "brython-menu":
                    break
            else:
                document <= html.STYLE(style_sheet, id="brython-menu")

        self.default_css = default_css

        if parent:
            parent.submenu = html.TABLE(Class="brython-menu-submenu")
            parent.submenu.style.position = "absolute"
            parent.submenu.style.display = "none"
            self.container <= parent.submenu

            parent.bind("click", self.unfold)

        if not hasattr(self.container, "bind_document"):
            # Click on the document outside of the menu removes all submenus
            document.bind("click", self.hide_menus)
            self.container.bind_document = True

    def add_item(self, label, callback=None, menu=False):
        if self.parent is None:
            # First level
            item = html.SPAN(label, Class="brython-menu-navbar-item")
            self.container <= item
            item.bind("click", self.hide_menus)
        else:
            # Next levels
            item = html.TR(Class="brython-menu-submenu-row")
            self.parent.submenu <= item
            item <= html.TD(label, Class="brython-menu-submenu-item")
            item <= html.TD(">" if menu else "&nbsp;",
                Class="brython-menu-submenu-item",
                paddingLeft="2em")

        if callback is not None:
            item.bind("click", callback)

        return item

    def add_link(self, label, href):
        """Add a link to the specified address."""
        if self.parent is None:
            # First level
            item = html.A(label, Class="brython-menu-navbar-link", href=href)
            self.container <= item
        else:
            # Next levels
            item = html.TR(Class="brython-menu-submenu-row")
            self.parent.submenu <= item
            item <= html.TD(html.A(label, Class="brython-menu-submenu-link", 
                href=href))

        return item

    def add_menu(self, label):
        """Add a new submenu in the current menu."""
        # add an item
        item = self.add_item(label, menu=True)

        if self.parent is None:
            # create a SPAN for the submenu
            span = html.SPAN(Class="brython-menu-submenu")
            span.style.position = "absolute"

        return Menu(self.container, item, default_css=self.default_css)

    def hide_menus(self, *args):
        """When user clicks outside of open submenus, close them all."""
        for css in [".brython-menu-navbar-item-selected",
                    ".brython-menu-submenu-row-selected"]:
            for item in document.select(css):
                item.classList.remove(css[1:])
        for div in document.select(".brython-menu-submenu"):
            if div.style.display != "none":
                div.style.display = "none"

    def hide_submenus(self, table):
        """Hide all submenus of specified table."""
        for row in table.select("TR"):
            if hasattr(row, "submenu"):
                row.submenu.style.display = "none"
                self.hide_submenus(row.submenu)

    def unfold(self, ev):
        """Called when a label with a submenu is clicked."""
        target = ev.target
        if target.nodeName == "SPAN":
            # click on a navbar item
            selected = document.select(".brython-menu-navbar-item-selected")

            if selected:
                self.hide_menus()

            for item in selected:
                item.classList.remove("brython-menu-navbar-item-selected")

            submenu = target.submenu

            target.classList.add("brython-menu-navbar-item-selected")
            submenu.style.left = f"{target.abs_left}px"
            submenu.style.top = f"{target.abs_top + target.offsetHeight}px"

            # Once an item has been selected, mouseenter on the other items
            # unfolds them
            if not selected:
                for item in document.select(".brython-menu-navbar-item"):
                    item.bind("mouseenter", self.unfold)

            # Display menu
            submenu.style.display = "block"

        else:
            target = target.closest("TR")

            # Remove other submenus
            table = target.closest("TABLE")
            self.hide_submenus(table)

            # If another item in the table was selected, unselect it
            selected = table.select(".brython-menu-submenu-row-selected")
            for row in selected:
                row.classList.remove("brython-menu-submenu-row-selected")

            # Mark target as selected
            target.classList.add("brython-menu-submenu-row-selected")

            if hasattr(target, "submenu"):
                # Set top and left of submenu and display it
                target.submenu.style.top = f"{target.abs_top}px"
                target.submenu.style.left = \
                    f"{target.abs_left + target.offsetWidth}px"
                target.submenu.style.display = "block"

            if not selected:
                # Once an item has been selected, mouseenter on the other
                # items unfolds them
                for row in table.select("TR"):
                    row.bind("mouseenter", self.unfold)


        # stop propagation, otherwise "click" is triggered on document,
        # which removes all menus...
        ev.stopPropagation()