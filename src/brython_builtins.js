var __BRYTHON__=__BRYTHON__ || {}  // global object with brython built-ins

;(function($B) {

if ($B.isa_web_worker==true) {
  // we need to emulate a window and document variables/functions for
  // web workers, since they don't exists. (this is much better than,
  // having a bunch of tests throughout code, making the code more complex) 

  window = {}
  window.XMLHttpRequest = XMLHttpRequest 
  window.navigator={}
  window.navigator.userLanguage=window.navigator.language="fixme"

  window.clearTimeout=function(timer) {clearTimeout(timer)}
}

// Python __builtins__
$B.builtins = {
    __repr__:function(){return "<module 'builtins>'"},
    __str__:function(){return "<module 'builtins'>"},    
}

$B.__getattr__ = function(attr){return this[attr]}
$B.__setattr__ = function(attr,value){
    // limited to some attributes
    if(['debug'].indexOf(attr)>-1){$B[attr]=value}
    else{throw $B.builtins.AttributeError('__BRYTHON__ object has no attribute '+attr)}
}

// system language ( _not_ the one set in browser settings)
// cf http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
$B.language = window.navigator.userLanguage || window.navigator.language

// document charset ; defaults to "utf-8"
$B.charset = document.characterSet || document.inputEncoding || "utf-8"

$B.date = function(){
    if(arguments.length===0) return $B.JSObject(new Date())
    if(arguments.length===1) return $B.JSObject(new Date(arguments[0]))
    if(arguments.length===7) return $B.JSObject(new Date(arguments[0],
        arguments[1]-1,arguments[2],arguments[3],
        arguments[4],arguments[5],arguments[6]))
}
$B.has_local_storage = typeof(Storage)!=="undefined"
if($B.has_local_storage){
   $B.local_storage = function(){
        // for some weird reason, typeof localStorage.getItem is 'object'
        // in IE8, not 'function' as in other browsers. So we have to
        // return a specific object...
        if(typeof localStorage.getItem==='function'){
            var res = $B.JSObject(localStorage)
            res.__repr__=res.__str__=function(){return "<object Storage>"}
            res.__item__ = function(rank){return localStorage.key(rank)}
            return res
        }
        var res = new Object()
        res.__getattr__ = function(attr){return this[attr]}
        res.getItem = function(key){return localStorage.getItem(str(key))}
        res.setItem = function(key,value){localStorage.setItem(str(key),str(value))}
        return res
   }
}

$B._indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
$B.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction
$B.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange

$B.has_indexedDB = typeof($B._indexedDB) !== "undefined"
if ($B.has_indexedDB) {
   $B.indexedDB = function() {return $B.JSObject($B._indexedDB)}
}

$B.re = function(pattern,flags){return $B.JSObject(new RegExp(pattern,flags))}
$B.has_json = typeof(JSON)!=="undefined"

$B.has_websocket = (function(){
    try{var x=window.WebSocket;return x!==undefined}
    catch(err){return false}
})

})(__BRYTHON__)
