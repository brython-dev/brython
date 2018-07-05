importScripts("../src/unicode.min.js");
importScripts("../src/brython_builtins.js");
importScripts("../src/version_info.js");
importScripts("../src/py2js.js");
importScripts("../src/py_object.js");
importScripts("../src/py_type.js");
importScripts("../src/py_utils.js");
importScripts("../src/py_sort.js");
importScripts("../src/py_builtin_functions.js");
importScripts("../src/py_exceptions.js");
importScripts("../src/py_range_slice.js");
importScripts("../src/py_bytes.js");
importScripts("../src/py_set.js");
importScripts("../src/js_objects.js");
importScripts("../src/stdlib_paths.js");
importScripts("../src/py_import.js");
importScripts("../src/py_string.js");
importScripts("../src/py_int.js");
importScripts("../src/py_long_int.js");
importScripts("../src/py_float.js");
importScripts("../src/py_complex.js");
importScripts("../src/py_dict.js");
importScripts("../src/py_list.js");
importScripts("../src/py_generator.js");
importScripts("../src/py_dom.js");
importScripts("../src/builtin_modules.js");
importScripts("../src/py_import_hooks.js");
importScripts("../src/async.js");


self.myPost = function(val) {
  self.postMessage(val);
}

brython({debug:1});

var jsRoot = __BRYTHON__.py2js("from browser import window\nd = dict({'x': 'world'})\nwindow.myPost(d['x'])\n", '__main__', '__main__');
var jsCode = jsRoot.to_js();
eval(jsCode);
