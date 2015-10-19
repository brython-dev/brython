from javascript import JSObject
from browser import window
import urllib.request

class TempMod:
  def __init__(self, name):
      self.name=name

#define my custom import hook (just to see if it get called etc).
class BaseHook:
  def __init__(self, fullname=None, path=None):
      self._fullname=fullname
      self._path=path    # we don't are about this...
      self._modpath=''
      self._module=''

  def find_module(self, name=None, path=None):
      if name is None:
         name=self._fullname

      for _i in ('libs/%s.js' % name, 'Lib/%s.py' % name, 
                 'Lib/%s/__init__.py' % name):
          _path="%s%s" % (__BRYTHON__.brython_path, _i)
          try:
            _fp,_,_headers=urllib.request.urlopen(_path)
            if _headers['status'] != 200:
               continue 
            self._module=_fp.read()
            self._modpath=_path
            return self
          except urllib.error.HTTPError as e:
            self._modpath=''
            self._module=''
            
      raise ImportError

  def is_package(self):
      return '.' in self._fullname

  def load_module(self, name):
      if name is None:
         name=self._fullname
      window.eval('__BRYTHON__.imported["%s"]={}' % name)
      return JSObject(__BRYTHON__.run_py)(self._module,
                                          self._modpath, TempMod(name))
