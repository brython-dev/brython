"""_warnings provides basic warning filtering support.
It is a helper module to speed up interpreter start-up."""


default_action = """default"""

filters = [('ignore', None, DeprecationWarning, None, 0), 
    ('ignore', None, PendingDeprecationWarning, None, 0), 
    ('ignore', None, ImportWarning, None, 0), 
    ('ignore', None, BytesWarning, None, 0)]

once_registry = {}

def warn(*args,**kw):
    """Issue a warning, or maybe ignore it or raise an exception."""
    pass

def warn_explicit(*args,**kw):
    """Low-level inferface to warnings functionality."""
    pass
