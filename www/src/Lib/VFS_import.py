import os
import sys
from browser import doc

#_scripts=doc.createElement('script')
#_scripts.src="/src/py_VFS.js"
#_scripts.type="text/javascript"
#doc.get(tag='head')[0].appendChild(_scripts)

VFS=dict(JSObject(__BRYTHON__.py_VFS))
class VFSModuleFinder:
    def __init__(self, path_entry):
        print("in VFSModuleFinder")
        if path_entry.startswith('/libs') or path_entry.startswith('/Lib'):
           self.path_entry=path_entry
        else:
            raise ImportError()
        
    def __str__(self):
        return '<%s for "%s">' % (self.__class__.__name__, self.path_entry)
        
    def find_module(self, fullname, path=None):
        path = path or self.path_entry
        #print('looking for "%s" in %s ...' % (fullname, path))
        for _ext in ['js', 'pyj', 'py']:
            _filepath=os.path.join(self.path_entry, '%s.%s' % (fullname, _ext))
            if _filepath in VFS:
               print("module found at %s:%s" % (_filepath, fullname))
               return VFSModuleLoader(_filepath, fullname)

        print('module %s not found' % fullname)
        raise ImportError()
        return None

class VFSModuleLoader:
    """Load source for modules"""
    
    def __init__(self, filepath, name):
        self._filepath=filepath
        self._name=name
        
    def get_source(self):
        if self._filepath in VFS:
           return JSObject(readFromVFS(self._filepath))

        raise ImportError('could not find source for %s' % fullname)

    def is_package(self):
        return '.' in self._name
            
    def load_module(self):
        if self._name in sys.modules:
           #print('reusing existing module from previous import of "%s"' % fullname)
           mod = sys.modules[self._name]
           return mod
        
        _src=self.get_source()
        if self._filepath.endswith('.js'):
           mod=JSObject(import_js_module(_src, self._filepath, self._name))
        elif self._filepath.endswith('.py'):
           mod=JSObject(import_py_module(_src, self._filepath, self._name))
        elif self._filepath.endswith('.pyj'):
           mod=JSObject(import_pyj_module(_src, self._filepath, self._name))
        else:
           raise ImportError('Invalid Module: %s' % self._filepath)

        # Set a few properties required by PEP 302
        mod.__file__ = self._filepath
        mod.__name__ = self._name
        mod.__path__ = os.path.abspath(self._filepath)
        mod.__loader__ = self
        mod.__package__ = '.'.join(self._name.split('.')[:-1])
        
        if self.is_package():
           print('adding path for package')
           # Set __path__ for packages
           # so we can find the sub-modules.
           mod.__path__ = [ self.path_entry ]
        else:
            print('imported as regular module')
        
        print('creating a new module object for "%s"' % self._name)
        sys.modules.setdefault(self._name, mod)
        JSObject(__BRYTHON__.imported)[self._name]=mod

        return mod

JSObject(__BRYTHON__.path_hooks.insert(0, VFSModuleFinder))
