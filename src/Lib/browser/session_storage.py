# session storage in browser
import sys
from javascript import JSObject
from .local_storage import LocalStorage

class SessionStorage(LocalStorage):

    storage_type = "session_storage"

    def __init__(self):
        if not sys.has_session_storage:
            raise EnvironmentError("SessionStorage not available")
        self.store = JSObject(__BRYTHON__.session_storage)

if sys.has_session_storage:
    storage = SessionStorage()
