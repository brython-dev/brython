from browser import aio, console, document, html, window

style_sheet = """
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
    box-sizing: border-box;
    padding:0.2em;
}

.brython-dialog-message {
    padding-right: 0.6em;
}

.brython-dialog-button {
    margin: 0.5em;
}
"""

class Dialog(html.DIV):
    """Basic, moveable dialog box with a title bar, optional
    "Ok" / "Cancel" buttons.
    The "Ok" button is the attribute "ok_button" of the dialog object.
    Supports drag and drop on the document.
    A dialog has an attribute "panel" that can contain elements.
    Method close() removes the dialog box.
    """

    def __init__(self, title="", *,
            top=None, left=None, ok_cancel=False, can_close=True,
            default_css=True):
        if default_css:
            for stylesheet in document.styleSheets:
                if stylesheet.ownerNode.id == "brython-dialog":
                    break
            else:
                document <= html.STYLE(style_sheet, id="brython-dialog")

        html.DIV.__init__(self, style=dict(position="absolute"),
            Class="brython-dialog-main")

        self.title_bar = html.DIV(html.SPAN(title), Class="brython-dialog-title")
        self <= self.title_bar
        if can_close:
            self.close_button = html.SPAN("&times;", Class="brython-dialog-close")
            self.title_bar <= self.close_button
            self.close_button.bind("click", self.close)

        self.panel = html.DIV(Class="brython-dialog-panel")
        self <= self.panel

        if ok_cancel:
            ok_cancel_zone = html.DIV(style={"text-align": "center"})
            ok, cancel = "Ok", "Cancel"
            if isinstance(ok_cancel, (list, tuple)):
                if not len(ok_cancel) == 2:
                    raise ValueError(
                        f"ok_cancel expects 2 elements, got {len(ok_cancel)}")
                ok, cancel = ok_cancel
            self.ok_button = html.BUTTON(ok, Class="brython-dialog-button")
            self.cancel_button = html.BUTTON(cancel,
                Class="brython-dialog-button")
            self.cancel_button.bind("click", self.close)
            ok_cancel_zone <= self.ok_button + self.cancel_button
            self <= ok_cancel_zone

        document <= self
        cstyle = window.getComputedStyle(self)

        # Center horizontally and vertically
        if left is None:
            width = round(float(cstyle.width[:-2]) + 0.5)
            left = int((window.innerWidth - width) / 2)
        self.left = left
        self.style.left = f'{left}px'
        if top is None:
            height = round(float(cstyle.height[:-2]) + 0.5)
            top = int((window.innerHeight - height) / 2)
        # top is relative to document scrollTop
        top += round(document.scrollingElement.scrollTop)
        self.top = top
        self.style.top = f'{top}px'

        self.title_bar.bind("mousedown", self.mousedown)
        self.title_bar.bind("touchstart", self.mousedown)
        self.title_bar.bind("mouseup", self.mouseup)
        self.title_bar.bind("touchend", self.mouseup)
        self.bind("leave", self.mouseup)
        self.is_moving = False

    def close(self, *args):
        ev = window.CustomEvent.new('dialog_close')
        ev.dialog = self
        document.dispatchEvent(ev)

        self.remove()

    def mousedown(self, event):
        document.bind("mousemove", self.mousemove)
        document.bind("touchmove", self.mousemove)
        self.is_moving = True
        self.initial = [self.left - event.x, self.top - event.y]
        self.mouse_start = [event.x, event.y]
        # prevent default behaviour to avoid selecting the moving element
        event.preventDefault()

        ev = window.CustomEvent.new('dialog_down')
        ev.x = event.x
        ev.y = event.y
        ev.dialog = self
        document.dispatchEvent(ev)

    def mousemove(self, event):
        if not self.is_moving:
            return

        # set new moving element coordinates
        self.left = self.initial[0] + event.x
        self.top = self.initial[1] + event.y

        ev = window.CustomEvent.new('dialog_move')
        ev.dx = event.x - self.mouse_start[0]
        ev.dy = event.y - self.mouse_start[1]
        ev.dialog = self
        document.dispatchEvent(ev)

    def mouseup(self, event):
        self.is_moving = False
        document.unbind("mousemove")
        document.unbind("touchmove")


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

    def __init__(self, title, message=None, *,
            top=None, left=None, default_css=True):
        Dialog.__init__(self, title,
                        top=top, left=left, ok_cancel=True,
                        default_css=default_css)
        self.message = html.SPAN(message or '', Class="brython-dialog-message") \
            or ""
        self.entry = html.INPUT()
        self.panel <= self.message + self.entry
        self.entry.focus()

        self.entry.bind("keypress", self.callback)
        self.ok_button.bind("click", self.callback)

    @property
    def value(self):
        return self.entry.value

    def callback(self, evt):
        if evt.target == self.entry and evt.key != "Enter":
            return
        self.dispatchEvent(window.Event.new("entry"))

async def Input(message=None):
    dialog = EntryDialog('Enter', message)
    event = await aio.event(dialog, 'entry')
    result = event.target.value
    dialog.close()
    return result

class InfoDialog(Dialog):
    """Dialog box with an information message and no "Ok / Cancel" button."""

    def __init__(self, title, message, *,
            top=None, left=None, default_css=True,
            remove_after=None, ok=False):
        """If remove_after is set, number of seconds after which the dialog is
        removed."""
        Dialog.__init__(self, title,
            top=top, left=left, default_css=default_css)
        self.panel <= html.DIV(message)
        if ok:
            ok = ok if isinstance(ok, str) else "Ok"
            self.ok_button = html.BUTTON(ok, Class="brython-dialog-button")
            self.panel <= html.P()
            self.panel <= html.DIV(self.ok_button,
                style={"text-align": "center"})
            self.ok_button.bind("click", lambda ev: self.remove())
        if remove_after:
            if not isinstance(remove_after, (int, float)):
                raise TypeError("remove_after should be a number, not " +
                    str(remove_after.__class__.__name__))
            window.setTimeout(self.close, remove_after * 1000)

def Info(message=None):
    InfoDialog('Information', str(message))
