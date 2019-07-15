importScripts("../src/brython.js");

self.myPost = function(val) {
  if (self.set && self.set.__class__) {
    throw new Error('set should not be defined 2');
  }
  self.postMessage(val);
}

brython({debug:1});

if (self.set && self.set.__class__) {
  throw new Error('set should not be defined 1');
}

var jsCode = __BRYTHON__.python_to_js("from browser import self");
eval(jsCode);

if (self.set && self.set.__class__) {
  throw new Error('set should not be defined 2');
}

var jsCode = __BRYTHON__.python_to_js("from browser import self\nd = dict({'x': 'world'})\nself.myPost(d['x'])\n");
eval(jsCode);
