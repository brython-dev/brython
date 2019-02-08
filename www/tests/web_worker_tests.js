importScripts("../src/brython.js");

self.myPost = function(val) {
  self.postMessage(val);
}

brython({debug:1});

var jsCode = __BRYTHON__.python_to_js("from browser import window\nd = dict({'x': 'world'})\nwindow.myPost(d['x'])\n");
eval(jsCode);
