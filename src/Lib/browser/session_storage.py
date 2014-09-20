# session storage in browser
from javascript import JSObject
from .local_storage import Local_Storage

class Session_Storage(Local_Storage):

    storage_type = "session_storage"
    
    def __init__(self):
        self.store = JSObject(__BRYTHON__.session_storage)

storage = Session_Storage()