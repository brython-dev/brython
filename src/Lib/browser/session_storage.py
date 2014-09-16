# session storage in browser
from .local_storage import LocalStorage

class SessionStorage(LocalStorage):
    storage_type = "session_storage"

    def __init__(self):
        if not __BRYTHON__.has_session_storage:
            raise NameError('session storage is not supported by the browser')
        self.store = __BRYTHON__.session_storage()

storage = SessionStorage()
