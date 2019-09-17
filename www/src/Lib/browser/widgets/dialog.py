from browser import console, document, html, window

styles = {
    "dialog": {
        "font-family": "arial",
        "position": "absolute",
        "width": "10%",
        "left": "10px",
        "top": "10px",
        "border-style": "solid",
        "border-color": "CadetBlue",
        "border-width": "0 1px 1px 1px",
        "z-index": 0
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
        "padding": "0.6em"
    }
}

class Dialog(html.DIV):
    """Basic, moveable dialog box with a title bar, optional
    "Ok" / "Cancel" buttons.
    The "Ok" button is the attribute "ok_button" of the dialog object.
    Supports drag and drop on the document.
    A dialog has an attribute "panel" that can contain elements.
    Method close() removes the dialog box.
    """

    def __init__(self, title="", style={}, top=0, left=0, ok_cancel=False):
        for key in style:
            for item in styles:
                styles[item][key] = style[key]
        html.DIV.__init__(self, style=styles["dialog"])
        self.left = left
        self.top = top
        self._title = html.DIV(html.SPAN(title), style=styles["title"])
        self <= self._title
        btn = html.SPAN("&times;", style=styles["close"])
        self._title <= btn
        btn.bind("click", self.close)
        self.panel = html.DIV(style=styles["panel"])
        self <= self.panel

        if ok_cancel:
            ok_cancel_zone = html.DIV(style={"text-align": "center"})
            self.ok_button = html.BUTTON("Ok")
            self.cancel_button = html.BUTTON("Cancel")
            self.cancel_button.bind("click", self.close)
            ok_cancel_zone <= self.ok_button + self.cancel_button
            self <= ok_cancel_zone

        document <= self
        self._title.bind("mousedown", self.mousedown)
        document.bind("mousemove", self.mousemove)
        self._title.bind("mouseup", self.mouseup)
        self.bind("leave", self.mouseup)
        self.is_moving = False

    def close(self, *args):
        self.remove()

    def mousedown(self, event):
        self.is_moving = True
        self.offset = [self.left - event.x, self.top - event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

    def mousemove(self, event):
        if not self.is_moving:
            return

        # set new moving element coordinates
        self.left = self.offset[0] + event.x
        self.top = self.offset[1] + event.y

    def mouseup(self, event):
        self.is_moving = False

class EntryDialog(Dialog):
    """Dialog box with "Ok / Cancel" buttons and an INPUT element.
    When the user clicks on "Ok" or hits the Enter key, an event called
    "entry" is triggered on the element.

    Usage:
        box = EntryDialog()

        @bind(box, "entry")
        def entry(evt):
            ...
    """

    def __init__(self, title="", message=None, style={}, top=0, left=0):
        Dialog.__init__(self, title, style, top, left, ok_cancel=True)
        if message is not None:
            self.panel <= message
        self.entry = html.INPUT()
        self.panel <= self.entry
        self.entry.focus()

        self.entry.bind("keypress", self.callback)
        self.ok_button.bind("click", self.callback)

    @property
    def value(self):
        return self.entry.value

    def callback(self, evt):
        if evt.target == self.entry and evt.keyCode != 13:
            return
        self.dispatchEvent(window.Event.new("entry"))

class InfoDialog(Dialog):
    """Dialog box with an information message and no "Ok / Cancel" button."""

    def __init__(self, title="", message="", style={}, top=0, left=0):
        Dialog.__init__(self, title, style, top, left)
        self.panel <= message