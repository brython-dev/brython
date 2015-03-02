import os
from browser import doc
import urllib.request

## this module is able to download modules that are external to
## localhost/src
## so we could download from any URL

class ModuleFinder:
    def __init__(self, path_entry):
        print("external_import here..")
        #print(path_entry)
        self._module=None
        if path_entry.startswith('http://'):
           self.path_entry=path_entry
        else:
            raise ImportError()
        
    def __str__(self):
        return '<%s for "%s">' % (self.__class__.__name__, self.path_entry)
        
    def find_module(self, fullname, path=None):
        path = path or self.path_entry
        #print('looking for "%s" in %s ...' % (fullname, path))
        for _ext in ['js', 'pyj', 'py']:
            _fp,_url,_headers=urllib.request.urlopen(path + '/' + '%s.%s' % (fullname, _ext))
            self._module=_fp.read()
            _fp.close()
            if self._module is not None:
               print("module found at %s:%s" % (path, fullname))
               return ModuleLoader(path, fullname, self._module)

        print('module %s not found' % fullname)
        raise ImportError()
        return None

class ModuleLoader:
    """Load source for modules"""
    
    def __init__(self, filepath, name, module_source):
        self._filepath=filepath
        self._name=name
        self._module_source=module_source
        
    def get_source(self):
        return self._module_source

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
           mod.__path__ = [ self._filepath ]
        else:
            print('imported as regular module')
        
        print('creating a new module object for "%s"' % self._name)
        sys.modules.setdefault(self._name, mod)
        JSObject(__BRYTHON__.imported)[self._name]=mod

        return mod
