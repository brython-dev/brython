from .local_storage import LocalStorage as LocalStorage
from _typeshed import Incomplete
from browser import window as window

has_session_storage: Incomplete

class SessionStorage(LocalStorage):
    storage_type: str
    store: Incomplete
    def __init__(self) -> None: ...

storage: Incomplete
