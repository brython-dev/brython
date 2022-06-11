"""Documentation string of module simple."""

class Simple:
    def __init__(self):
        self.info = "SimpleClass"

text = "text in simple"


def __getattr__(name):
    if name == "strange":
        return "a strange name"

def __dir__():
    return ["Simple", "text", "strange", "unknown"]