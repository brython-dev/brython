class EventListener:
  def __init__(self, events=[]):
      self._events=events

  def append(self, event):
      self._events.append(event)

  def fire(self, e):
      for _event in self._events:
          _event(e)

class IndexedDB:
  def __init__(self):
      if not __BRYTHON__.has_indexedDB:
         raise NotImplementedError("Your browser doesn't support indexedDB")
         return

      self._indexedDB=__BRYTHON__.indexedDB()
      self._db=None
      self._version=None

  def _onsuccess(self, event):
      self._db=event.target.result

  def open(self, name, onsuccess, version=1.0, onerror=None, 
           onupgradeneeded=None):
      self._version=version
      _result=self._indexedDB.open(name, version)
      _success=EventListener([self._onsuccess, onsuccess])
      _result.onsuccess=_success.fire
      _result.onupgradeneeded=onupgradeneeded

      #if onerror is None:
      def onerror(e):
          print("onerror: %s:%s" %  (e.type, e.target.result))

      def onblocked(e):
          print("blocked: %s:%s" %  (e.type, e.result))

      _result.onerror=onerror
      _result.onblocked=onblocked

  def transaction(self, entities, mode='read'):
      return Transaction(self._db.transaction(entities, mode))

class Transaction:

  def __init__(self, transaction):
      self._transaction=transaction

  def objectStore(self, name):
      return ObjectStore(self._transaction.objectStore(name))

class ObjectStore:

  def __init__(self, objectStore):
      self._objectStore=objectStore
      self._data=[]

  def clear(self, onsuccess=None, onerror=None):
      _result=self._objectStore.clear()

      if onsuccess is not None:
         _result.onsuccess=onsuccess

      if onerror is not None:
         _result.onerror=onerror

  def _helper(self, func, object, onsuccess=None, onerror=None):
      _result=func(object)

      if onsuccess is not None:
         _result.onsuccess=onsuccess

      if onerror is not None:
         _result.onerror=onerror

  def put(self, obj, key=None, onsuccess=None, onerror=None):
      _r = self._objectStore.put(obj, key)
      _r.onsuccess = onsuccess
      _r.onerror = onerror

  def add(self, obj, key, onsuccess=None, onerror=None):
      _r = self._objectStore.add(obj, key)
      _r.onsuccess = onsuccess
      _r.onerror = onerror
      #self._helper(self._objectStore.add, object, onsuccess, onerror)

  def delete(self, index, onsuccess=None, onerror=None): 
      self._helper(self._objectStore.delete, index, onsuccess, onerror)
     
  def query(self, *args):
      self._data=[]
      def onsuccess(event):
          cursor=event.target.result
          if cursor is not None:
             self._data.append(cursor.value)
             getattr(cursor,"continue")() # cursor.continue() is illegal

      self._objectStore.openCursor(args).onsuccess=onsuccess

  def fetchall(self):
      yield self._data

  def get(self, key, onsuccess=None, onerror=None):
      self._helper(self._objectStore.get, key, onsuccess, onerror)
