# session storage in browser
import sys
from browser import window
from .local_storage import LocalStorage

has_session_storage = hasattr(window, 'sessionStorage')

class SessionStorage(LocalStorage):

    storage_type = "session_storage"

    def __init__(self):
        if not has_session_storage:
            raise EnvironmentError("SessionStorage not available")
        self.store = window.sessionStorage

if has_session_storage:
    storage = SessionStorage()
