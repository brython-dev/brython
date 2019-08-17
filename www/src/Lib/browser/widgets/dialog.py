from browser import document, html

styles = {
    "dialog": {
        "position": "absolute",
        "width": "10%",
        "left": "10px",
        "top": "10px",
        "z-index": 99
    },
    "title": {
        "background-color": "CadetBlue",
        "color": "#fff",
        "padding": "0.4em",
        "cursor": "default"
    },
    "close": {
        "float": "right",
        "background-color": "#fff",
        "color": "#000",
        "cursor": "default",
        "padding": "0.1em"
    },
    "panel": {
        "background-color": "#fff",
        "color": "#000",
        "height": "20%",
        "border-style": "solid",
        "border-color": "CadetBlue",
        "border-width": "0 1px 1px 1px",
        "padding": "0.6em"
    }
}

class Dialog:

    def __init__(self, title="", style={}, top=0, left=0, ok_cancel=False):
        for key in style:
            for item in styles:
                styles[item][key] = style[key]
        self.div = html.DIV(style=styles["dialog"])
        self.div.left = left
        self.div.top = top
        self.title = html.DIV(html.SPAN(title), style=styles["title"])
        self.div <= self.title
        btn = html.SPAN("&times;", style=styles["close"])
        self.title <= btn
        btn.bind("click", self.close)
        self.panel = html.DIV(style=styles["panel"])
        self.content = html.DIV()
        self.panel <= self.content
        self.div <= self.panel

        if ok_cancel:
            ok_cancel_zone = html.DIV(style={"text-align": "center"})
            self.ok_button = html.BUTTON("Ok")
            self.cancel_button = html.BUTTON("Cancel")
            self.cancel_button.bind("click", self.close)
            ok_cancel_zone <= self.ok_button + self.cancel_button
            self.panel <= ok_cancel_zone

        document <= self.div
        self.title.bind("mousedown", self.mousedown)
        document.bind("mousemove", self.mousemove)
        self.title.bind("mouseup", self.mouseup)
        self.div.bind("leave", self.mouseup)
        self.is_moving = False

    def close(self, *args):
        self.div.remove()

    def mousedown(self, event):
        self.is_moving = True
        self.offset = [self.div.left - event.x, self.div.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def mousemove(self, event):
        if not self.is_moving:
            return

        # set new moving element coordinates
        self.div.left = self.offset[0] + event.x
        self.div.top = self.offset[1] + event.y

    def mouseup(self, event):
        self.is_moving = False
