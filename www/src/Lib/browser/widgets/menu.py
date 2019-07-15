from browser import document, html
print("browser.menu")
color = "CadetBlue"

st1 = {
    "listStyleType": "none",
    "margin": 0,
    "padding": 0,
    "font-family": "sans-serif"
}

li_style1 = {
    "backgroundColor": color,
    "color": "#fff",
    "float": "left",
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

class Menu:

    def __init__(self, container=None, parent=None):
        self.container = container
        self.parent = parent
        self.panel = html.UL(style=st1)
        self.container <= self.panel

        document.bind("click", self.hide_menus)

    def add_item(self, name, callback=None):
        if self.parent is None:
            # First level
            li = html.LI(name, style=li_style1, Class="top")
        else:
            # Next levels
            li = html.LI(name, style=li_style2, Class="sub")
        self.panel <= li
        if callback is not None:
            def f(ev):
                for div in document.select(".submenu"):
                    div.style.display = "none"
                ev.stopPropagation()
                ev.preventDefault()
                return callback(ev)
            li.bind("click", f)
        return li

    def add_menu(self, name):
        """Add a new submenu in the current menu."""
        if self.parent is not None:
            name += "..."
        li = self.add_item(name)
        # create a DIV for the submenu
        div = html.DIV(style=div_style, Class="submenu")
        if self.parent is None:
            div.style.left = f"{li.abs_left}px"
            div.style.top = f"{li.abs_top + li.offsetHeight}px"
        else:
            left = self.container.abs_left + self.container.offsetWidth
            div.style.left = f"{left}px"
            div.style.top = f"{li.abs_top}px"
        div.style.fontSize = self.container.style.fontSize
        print("font size", div.style.fontSize)
        div.style.display = "none"
        document <= div
        li.bind("click", lambda ev: self.unfold(ev, div))
        return Menu(div, self)

    def hide_menus(self, ev):
        """When user clicks outside of open submenus, close them all."""
        for div in document.select(".submenu"):
            div.style.display = "none"

    def unfold(self, event, element):
        """Called when a label with a submenu is clicked."""
        print("unfold", event.target.class_name)
        if event.target.class_name != "sub":
            self.hide_menus(event)

        element.style.display = "block"
        if event.target.class_name == "sub":
            # compute position of element
            container = event.target.closest("DIV")
            left = container.abs_left + container.offsetWidth
            element.style.left = f"{left}px"
            element.style.top = f"{event.target.abs_top}px"
        else:
            print(event.target.abs_left, event.target.offsetHeight)
            element.style.left = f"{event.target.abs_left}px"
            top = event.target.abs_top + event.target.offsetHeight
            element.style.top = f"{top}px"
        event.stopPropagation() # to avoid calling hide_menus() again