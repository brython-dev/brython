import javascript

from _browser import *

from .local_storage import LocalStorage
from .session_storage import SessionStorage
from .object_storage import ObjectStorage

WebSocket = javascript.JSConstructor(window.WebSocket)