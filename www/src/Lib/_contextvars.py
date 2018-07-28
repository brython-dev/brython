"""Context Variables"""


class Context(object):

    __contains__ = "<slot wrapper '__contains__' of 'Context' objects>"

    copy = "<method 'copy' of 'Context' objects>"

    def get(self, *args):
        pass

    items = "<method 'items' of 'Context' objects>"

    keys = "<method 'keys' of 'Context' objects>"

    run = "<method 'run' of 'Context' objects>"

    values = "<method 'values' of 'Context' objects>"

class ContextVar:

    def __init__(self, name, **kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        self.name = name
        if "default" in kw:
            self.default = kw["default"]

    def get(self, *args):
        if hasattr(self, "value"):
            return self.value
        elif len(args) == 1:
            return args[0]
        elif hasattr(self, "default"):
            return self.default
        raise LookupError(self.name)

    def reset(self, token):
        if token.old_value == Token.MISSING:
            del self.value
        else:
            self.value = token.old_value

    def set(self, value):
        self.value = value
        return Token(self)

class Token(object):

    MISSING = "<Token.MISSING>"

    def __init__(self, contextvar):
        self.var = contextvar
        try:
            self.old_value = contextvar.get()
        except LookupError:
            self.old_value = Token.MISSING

def copy_context(*args,**kw):
    pass
