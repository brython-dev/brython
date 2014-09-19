# session storage in browser
from .local_storage import Local_Storage

class Session_Storage(Local_Storage):
    storage_type = "session_storage"

    def __init__(self):
        self.store = __BRYTHON__.session_storage()

storage = Session_Storage()
