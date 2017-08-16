from json import load, loads
from json import dumps as _dumps

HIGHEST_PROTOCOL=1

def dumps(obj, *args, **kw):
    """Returns bytes, not strings like json.dumps."""
    return _dumps(obj).encode('utf-8')
