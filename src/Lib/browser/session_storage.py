# session storage in browser
from javascript import JSObject
from .local_storage import LocalStorage

class SessionStorage(LocalStorage):

    storage_type = "session_storage"

    def __init__(self):
        self.store = JSObject(__BRYTHON__.session_storage)

storage = SessionStorage()
