# -*- coding: utf-8 -*-
## execute this file via node.js
# $> nodejs node_bridge.js compile.py
#
# Author: Billy Earney
# Date: 04/19/2013
# License: MIT
#
# This file can be used to compile python code to javascript code
# which can be used with brython.


# fixme  os.path.join doesn't work (ie, import posixpath as path, does not work)
def os_path_join(a, b):
    return "%s/%s" % (a, b)


class FileIO:

    def __init__(self, filename, mode):
        self._filename, self._mode, = filename, mode
        self._fs = JSObject(fs)  # lint:ok

    def read(self):
        return self._fs.readFileSync(self._filename, 'utf8')

    def write(self, data):
        return self._fs.writeFileSync(self._filename, data, 'utf8')

    def close(self):
        pass


def compile_file(root, _filename):
    print(("compiling %s" % os_path_join(root, _filename)))
    _fp = FileIO(os_path_join(root, _filename), 'r')
    _src = _fp.read()
    _fp.close()
    _js = __BRYTHON__.compile_python(_src, _filename)  # lint:ok
    if _js is not None:
        _fp1 = FileIO(os_path_join(root, _filename.replace('.py', '.pyj')), 'w')
        _fp1.write(_js)
        _fp1.close()
    else:
        print(("error compiling %s" % os_path_join(root, _filename)))


# fixme, todo: modify to os.walk once scope issue is fixed.
# for _root, _dirs, _files in os.walk('./src'):
_files = ['errno.py', 'local_storage.py', 'keyword.py', 'os.py', 'datetime.py',
          'sys.py', 'traceback.py', 'string.py', 'dis.py', 'pydom.py']
_files += ['_random.py', 'random.py', 'heapq.py', 'collections.py']
# _files += ['_sre.py', 're.py', 'sre_compile.py', 'sre_constants.py']
_root = "../src/Lib"


for _file in _files:
    compile_file(_root, _file)
