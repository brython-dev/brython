/*
Author: Billy Earney
Date: 04/19/2013
License: MIT

Description: This file can work as a "bridge" between nodejs and brython
 so that client side brython code can be executed on the server side.
Will brython replace Cython one day?  Only time will tell.
:)

*/

var fs = require('fs');

document={};
document.getElementsByTagName = () => [{src: ''}];
window={};
window.location = {href: ''};
window.navigator={}
window.confirm = () => true;
window.console = console;
document.$py_src = {}
document.$debug = 0

self=window;

require('../www/src/brython.js')
$B = window.__BRYTHON__

function execute_python_script(filename, moduleName, outFilename) {
  _py_src = fs.readFileSync(filename, 'utf8')
  if (moduleName === undefined) {
    moduleName = '__main__'
  }
  var root = $B.py2js(_py_src, moduleName, moduleName, $B.builtins_scope)
  var js = root.to_js()
  if (outFilename !== undefined) {
    fs.writeFileSync(outFilename, js)
    console.log('Compiled script written to ' + outFilename)
  }
  var __BRYTHON__ = $B;
  eval(js);
}

if (process.argv.length < 3) {
  console.log('Usage: node node_bridge.js pyFilename [ jsOutputFilename [ pyModuleName ] ]')
  return;
}

var filename=process.argv[2];
var outFilename = process.argv[3];
var moduleName = process.argv[4];

execute_python_script(filename, moduleName, outFilename)
