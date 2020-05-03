from browser import console, document, html, window

color = "CadetBlue"

st1 = {
    "listStyleType": "none",
    "margin": 0,
    "padding": 0,
    "font-family": "sans-serif"
}

table = {
    "border-spacing": 0
}

li_style1 = {
    "backgroundColor": color,
    "color": "#fff",
    "padding": "0.5em 1em 0.5em 1em",
    "cursor": "default"
}

li_style2 = {
    "backgroundColor": "#fff",
    "color": color,
    "padding": "0.25em 1em 0.25em 1em",
    "cursor": "default"
}

div_style = {
    "position": "absolute",
    "borderStyle": "solid",
    "borderWidth": "1px",
    "borderColor": color
}

css = {}

class Menu:

    def __init__(self, container=document.body, parent=None, level=0):
        """Create a new menu, inserted inside the container. For the top level
        menu, parent is None, otherwise it is a SPAN item."""
        self.container = container
        self.level = level
        self.parent = parent
        self.submenus = []

        if parent:
            self.submenu = html.DIV(Class="sub")
            if "menu-submenu" in css:
                self.submenu.classList.add(css["menu-submenu"])
            self.submenu.style.position = "absolute"
            self.submenu.style.display = "none"
            self.container <= self.submenu

            parent.bind("click", self.unfold)

        if not hasattr(self.container, "bind_document"):
            document.bind("click", self.hide_menus)
            self.container.bind_document = True

    def add_item(self, name, callback=None):
        if self.parent is None:
            # First level
            item = html.SPAN(name)
            if "menu-item-top" in css:
                item.attrs["class"] = css["menu-item-top"]
            self.container <= item
            item.bind("click", self.hide_menus)
        else:
            # Next levels
            item = html.DIV(name)
            self.submenu <= item
            if "menu-item-sub" in css:
                item.attrs["class"] = css["menu-item-sub"]

        if callback is not None:
            item.bind("click", callback)

        return item

    def add_menu(self, name):
        """Add a new submenu in the current menu."""
        if self.parent is not None:
            name += "..."
        item = self.add_item(name)
        # create a DIV for the submenu
        span = html.SPAN(Class="sub")
        span.style.position = "absolute"
        if "submenu" in css:
            span.classList.add(css["submenu"])

        if self.parent is None:
            self.container <= span

        submenu = Menu(self.container, item, self.level + 1)
        self.submenus.append(submenu)
        submenu.parent_menu = self
        return submenu

    def hide_menus(self, *args):
        """When user clicks outside of open submenus, close them all."""
        for div in document.select(".sub"):
            div.style.display = "none"

    def unfold(self, ev):
        """Called when a label with a submenu is clicked."""
        parent = self.parent

        if self.level == 1:
            # Click on an item in the main menu bar
            self.submenu.style.left = f"{parent.abs_left}px"
        else:
            # remove other submenus of parent
            for menu in self.parent_menu.submenus:
                menu.submenu.style.display = "none"
            # set top and left
            self.submenu.style.top = f"{parent.abs_top}px"
            self.submenu.style.left = f"{parent.abs_left + parent.offsetWidth}px"

        # display menu
        self.submenu.style.display = "block"

        # stop propagation, otherwise "click" is triggered on document,
        # which removes all menus...
        ev.stopPropagation()