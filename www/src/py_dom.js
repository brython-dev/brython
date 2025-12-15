"use strict";
(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    _window = globalThis


// Convert result of operations on DOMNodes to Brython types
// Same as jsobj2pyobj, except that `null` and `undefined` are
// converted to None
function convertDomValue(v){
    if(v === null || v === undefined){
        return _b_.None
    }
    return $B.jsobj2pyobj(v)
}

// Conversion of immutable types between Javascript and Python
var py_immutable_to_js = $B.py_immutable_to_js = function (pyobj){
    if($B.$isinstance(pyobj, _b_.float)){
        return pyobj.value
    }else if($B.$isinstance(pyobj, $B.long_int)){
        return $B.long_int.$to_js_number(pyobj)
    }
    return pyobj
}

function js_immutable_to_py(jsobj){
    if(typeof jsobj == "number"){
        if(Number.isSafeInteger(jsobj)){
            return jsobj
        }else if(Number.isInteger(jsobj)){
            return $B.fast_long_int(BigInt(jsobj + ''))
        }else{
            return $B.fast_float(jsobj)
        }
    }
    return jsobj
}

// cross-browser utility functions
function $getPosition(e){
    var left = 0,
        top  = 0,
        width = e.width || e.offsetWidth,
        height = e.height || e.offsetHeight

    while (e.offsetParent){
        left += e.offsetLeft
        top  += e.offsetTop
        e = e.offsetParent
    }

    left += e.offsetLeft || 0
    top  += e.offsetTop || 0

    if(e.parentElement){
        // eg SVG element inside an HTML element
        var parent_pos = $getPosition(e.parentElement)
        left += parent_pos.left
        top += parent_pos.top
    }

    return {left: left, top: top, width: width, height: height}
}

var $mouseCoords = $B.$mouseCoords = function(ev){
    if(ev.type.startsWith("touch")){
        let res = {}
        res.x = _b_.int.$factory(ev.touches[0].screenX)
        res.y = _b_.int.$factory(ev.touches[0].screenY)
        res.__getattr__ = function(attr){return this[attr]}
        res.ob_type = "MouseCoords"
        return res
    }
    var posx = 0,
        posy = 0
    if(!ev){
        ev = _window.event
    }
    if(ev.pageX || ev.pageY){
        posx = ev.pageX
        posy = ev.pageY
    }else if(ev.clientX || ev.clientY){
        posx = ev.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft
        posy = ev.clientY + document.body.scrollTop +
            document.documentElement.scrollTop
    }
    let res = {}
    res.x = _b_.int.$factory(posx)
    res.y = _b_.int.$factory(posy)
    res.__getattr__ = function(attr){return this[attr]}
    res.ob_type = "MouseCoords"
    return res
}

$B.$isNode = function(o){
    // copied from http://stackoverflow.com/questions/384286/
    // javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  return (
      typeof Node === "object" ? o instanceof Node :
      o && typeof o === "object" && typeof o.nodeType === "number" &&
      typeof o.nodeName === "string"
  )
}

$B.$isNodeList = function(nodes) {
    // copied from http://stackoverflow.com/questions/7238177/
    // detect-htmlcollection-nodelist-in-javascript
    try{
        var result = Object.prototype.toString.call(nodes)
        var re = new RegExp("^\\[object (HTMLCollection|NodeList)\\]$")
        return (typeof nodes === "object" &&
            re.exec(result) !== null &&
            nodes.length !== undefined &&
            (nodes.length == 0 ||
                (typeof nodes[0] === "object" && nodes[0].nodeType > 0))
        )
    }catch(err){
        return false
    }
}

var $DOMEventAttrs_W3C = ["NONE", "CAPTURING_PHASE", "AT_TARGET",
    "BUBBLING_PHASE", "type", "target", "currentTarget", "eventPhase",
    "bubbles", "cancelable", "timeStamp", "stopPropagation",
    "preventDefault", "initEvent"]

var $DOMEventAttrs_IE = ["altKey", "altLeft", "button", "cancelBubble",
    "clientX", "clientY", "contentOverflow", "ctrlKey", "ctrlLeft", "data",
    "dataFld", "dataTransfer", "fromElement", "keyCode", "nextPage",
    "offsetX", "offsetY", "origin", "propertyName", "reason", "recordset",
    "repeat", "screenX", "screenY", "shiftKey", "shiftLeft",
    "source", "srcElement", "srcFilter", "srcUrn", "toElement", "type",
    "url", "wheelDelta", "x", "y"]

$B.$isEvent = function(obj){
    var flag = true
    for(let attr of $DOMEventAttrs_W3C){
        if(obj[attr] === undefined){
            flag = false
            break
        }
    }
    if(flag){
        return true
    }
    for(let attr of $DOMEventAttrs_IE){
        if(obj[attr] === undefined){
            return false
        }
    }
    return true
}

// DOM node types
var $NodeTypes = {1:  "ELEMENT",
    2: "ATTRIBUTE",
    3: "TEXT",
    4: "CDATA_SECTION",
    5: "ENTITY_REFERENCE",
    6: "ENTITY",
    7: "PROCESSING_INSTRUCTION",
    8: "COMMENT",
    9: "DOCUMENT",
    10: "DOCUMENT_TYPE",
    11: "DOCUMENT_FRAGMENT",
    12: "NOTATION"
}

// Class for DOM attributes
var Attributes = $B.make_builtin_class("Attributes")
Attributes.$factory = function(elt){
    return{
        ob_type: Attributes,
        elt: elt
    }
}

Attributes.__contains__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, key:null},
        ["self", "key"], arguments, {}, null, null)
    if($.self.elt instanceof SVGElement){
        return $.self.elt.hasAttributeNS(null, $.key)
    }else if(typeof $.self.elt.hasAttribute == "function"){
        return $.self.elt.hasAttribute($.key)
    }
    return false
}

Attributes.__delitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, key:null},
        ["self", "key"], arguments, {}, null, null)
    if(!Attributes.__contains__($.self, $.key)){
        $B.RAISE(_b_.KeyError, $.key)
    }
    if($.self.elt instanceof SVGElement){
        $.self.elt.removeAttributeNS(null, $.key)
        return _b_.None
    }else if(typeof $.self.elt.hasAttribute == "function"){
        $.self.elt.removeAttribute($.key)
        return _b_.None
    }
}

Attributes.__getitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, key:null},
        ["self", "key"], arguments, {}, null, null)
    if($.self.elt instanceof SVGElement &&
            $.self.elt.hasAttributeNS(null, $.key)){
        return $.self.elt.getAttributeNS(null, $.key)
    }else if(typeof $.self.elt.hasAttribute == "function" &&
            $.self.elt.hasAttribute($.key)){
        return $.self.elt.getAttribute($.key)
    }
    $B.RAISE(_b_.KeyError, $.key)
}

Attributes.tp_iter = function(self){
    self.$counter = 0
    // Initialize list of key-value attribute pairs
    var attrs = self.elt.attributes,
        items = []
    for(var i = 0; i < attrs.length; i++){
        items.push(attrs[i].name)
    }
    self.$items = items
    return self
}

Attributes.tp_iternext = function(){
    var $ = $B.args("__next__", 1, {self: null},
        ["self"], arguments, {}, null, null)
    if($.self.$counter < $.self.$items.length){
        var res = $.self.$items[$.self.$counter]
        $.self.$counter++
        return res
    }else{
        $B.RAISE(_b_.StopIteration, "")
    }
}

Attributes.__setitem__ = function(){
    var $ = $B.args("__setitem__", 3, {self: null, key:null, value: null},
        ["self", "key", "value"], arguments, {}, null, null)
    if($.self.elt instanceof SVGElement &&
            typeof $.self.elt.setAttributeNS == "function"){
        $.self.elt.setAttributeNS(null, $.key, _b_.str.$factory($.value))
        return _b_.None
    }else if(typeof $.self.elt.setAttribute == "function"){
        $.self.elt.setAttribute($.key, _b_.str.$factory($.value))
        return _b_.None
    }
    $B.RAISE(_b_.TypeError, "Can't set attributes on element")
}

Attributes.tp_repr = function(self){
    var attrs = self.elt.attributes,
        items = []
    for(var i = 0; i < attrs.length; i++){
        items.push(attrs[i].name + ': "' +
            self.elt.getAttributeNS(null, attrs[i].name) + '"')
    }
    return '{' + items.join(", ") + '}'
}

Attributes.get = function(){
    var $ = $B.args("get", 3, {self: null, key:null, deflt: null},
        ["self", "key", "deflt"], arguments, {deflt:_b_.None}, null, null)
    try{
        return Attributes.__getitem__($.self, $.key)
    }catch(err){
        if($B.is_exc(err, _b_.KeyError)){
            return $.deflt
        }else{
            throw err
        }
    }
}

Attributes.keys = function(){
    return Attributes.tp_iter.apply(null, arguments)
}

Attributes.items = function(){
    var $ = $B.args("values", 1, {self: null},
        ["self"], arguments, {}, null, null),
        attrs = $.self.elt.attributes,
        values = []
    for(var i = 0; i < attrs.length; i++){
        values.push($B.$list([attrs[i].name, attrs[i].value]))
    }
    return _b_.list.tp_iter($B.$list(values))
}

Attributes.values = function(){
    var $ = $B.args("values", 1, {self: null},
        ["self"], arguments, {}, null, null),
        attrs = $.self.elt.attributes,
        values = []
    for(var i = 0; i < attrs.length; i++){
        values.push(attrs[i].value)
    }
    return _b_.list.tp_iter($B.$list(values))
}

$B.set_func_names(Attributes, "<dom>")

// Class for DOM events

var DOMEvent = $B.DOMEvent = $B.make_builtin_class("DOMEvent")
DOMEvent.$factory = function(evt_name){
    // Factory to create instances of DOMEvent, based on an event name
    return DOMEvent.tp_new(DOMEvent, evt_name)
}

DOMEvent.tp_new = function(cls, evt_name){
    var ev = new Event(evt_name)
    ev.ob_type = DOMEvent
    if(ev.preventDefault === undefined){
        ev.preventDefault = function(){ev.returnValue = false}
    }
    if(ev.stopPropagation === undefined){
        ev.stopPropagation = function(){ev.cancelBubble = true}
    }
    return ev
}

DOMEvent.tp_setattro = function(self, attr, value){
    self[attr] = value
}

function dom2svg(svg_elt, coords){
    // Used to compute the mouse position relatively to the upper left corner
    // of an SVG element, based on the coordinates coords.x, coords.y that are
    // relative to the browser screen.
    var pt = svg_elt.createSVGPoint()
    pt.x = coords.x
    pt.y = coords.y
    return pt.matrixTransform(svg_elt.getScreenCTM().inverse())
}

DOMEvent.tp_getattro = function(ev, attr){
    switch(attr) {
        case '__repr__':
        case '__str__':
            return function(){return '<DOMEvent object>'}
        case 'x':
            return $mouseCoords(ev).x
        case 'y':
            return $mouseCoords(ev).y
        case 'data':
            if(ev.dataTransfer !== null && ev.dataTransfer !== undefined){
                return Clipboard.$factory(ev.dataTransfer)
            }else if(typeof Worker !== 'undefined' && ev.target instanceof Worker){
                // main script receiving a MessageEvent from a worker
                return $B.structuredclone2pyobj(ev.data)
            }else if(typeof DedicatedWorkerGlobalScope !== 'undefined' &&
                    ev.target instanceof DedicatedWorkerGlobalScope){
                // web worker receiving a message from the main script
                return $B.structuredclone2pyobj(ev.data)
            }
            return convertDomValue(ev.data)
        case 'target':
            if(ev.target !== undefined){
                return DOMNode.$factory(ev.target)
            }
            break
        case 'char':
            return String.fromCharCode(ev.which)
        case 'svgX':
            if(ev.target instanceof SVGSVGElement){
                return Math.floor(dom2svg(ev.target, $mouseCoords(ev)).x)
            }
            $B.RAISE_ATTRIBUTE_ERROR("event target is not an SVG " +
                "element", ev, attr)
        case 'svgY':
            if(ev.target instanceof SVGSVGElement){
                return Math.floor(dom2svg(ev.target, $mouseCoords(self)).y)
            }
            $B.RAISE_ATTRIBUTE_ERROR("event target is not an SVG " +
                "element", ev, attr)
    }

    var res =  ev[attr]
    if(res !== undefined){
        if(typeof res == "function"){
            var func = function(){
                var args = []
                for(var i = 0; i < arguments.length; i++){
                    args.push($B.pyobj2jsobj(arguments[i]))
                }
                return res.apply(ev, arguments)
            }
            func.$infos = {
                __name__: res.name,
                __qualname__: res.name
            }
            return func
        }
        return convertDomValue(res)
    }
    throw $B.attr_error(attr, ev)
}

// Function to transform a DOM event into an instance of DOMEvent
var $DOMEvent = $B.$DOMEvent = function(ev){
    ev.ob_type = DOMEvent
    ev.$no_dict = true
    if(ev.preventDefault === undefined){
        ev.preventDefault = function(){ev.returnValue = false}
    }
    if(ev.stopPropagation === undefined){
        ev.stopPropagation = function(){ev.cancelBubble = true}
    }
    return ev
}

$B.set_func_names(DOMEvent, "browser")

var Clipboard = $B.make_builtin_class('Clipboard')
Clipboard.$factory = function(data){
    return {
        ob_type : Clipboard,
        dict: $B.empty_dict(),
        data : data
    }
}

Clipboard.__getitem__ = function(self, name){
    return self.data.getData(name)
}

Clipboard.__setitem__ = function(self, name, value){
    self.data.setData(name, value)
}

$B.set_func_names(Clipboard, "<dom>")


// Class for DOM nodes
var DOMNode = $B.make_builtin_class('DOMNode')
DOMNode.$factory = (elt) => elt

DOMNode.__add__ = function(self, other){
    // adding another element to self returns an instance of TagSum
    var res = TagSum.$factory()
    res.children = [self]
    var pos = 1
    if($B.$isinstance(other, TagSum)){
        res.children = res.children.concat(other.children)
    }else if($B.$isinstance(other,[_b_.str, _b_.int, _b_.float, _b_.list,
                                _b_.dict, _b_.set, _b_.tuple])){
        res.children[pos++] = DOMNode.$factory(
            document.createTextNode(_b_.str.$factory(other)))
    }else if($B.$isinstance(other, DOMNode)){
        res.children[pos++] = other
    }else{
        // If other is iterable, add all items
        try{
            res.children = res.children.concat(_b_.list.$factory(other))
        }catch(err){$B.RAISE(_b_.TypeError, "can't add '" +
            $B.class_name(other) + "' object to DOMNode instance")
        }
    }
    return res
}

DOMNode.__bool__ = function(){
    return true
}

DOMNode.__contains__ = function(self, key){
    // For document, if key is a string, "key in document" tells if an element
    // with id "key" is in the document
    if(self.nodeType == Node.DOCUMENT_NODE && typeof key == "string"){
        return document.getElementById(key) !== null
    }
    if(self.length !== undefined && typeof self.item == "function"){
        for(var i = 0, len = self.length; i < len; i++){
            if(self.item(i) === key){return true}
        }
    }
    return false
}

DOMNode.__del__ = function(self){
    // if element has a parent, calling __del__ removes object
    // from the parent's children
    if(self.parentNode){
        self.parentNode.removeChild(self)
    }
}

DOMNode.__delattr__ = function(self, attr){
    if(self[attr] === undefined){
        $B.RAISE_ATTRIBUTE_ERROR(`cannot delete DOMNode attribute '${attr}'`,
            self, attr)
    }
    delete self[attr]
    return _b_.None
}

DOMNode.__delitem__ = function(self, key){
    if(self.nodeType == Node.DOCUMENT_NODE){ // document : remove by id
        var res = self.getElementById(key)
        if(res){res.parentNode.removeChild(res)}
        else{$B.RAISE(_b_.KeyError, key)}
    }else{ // other node : remove by rank in child nodes
        self.parentNode.removeChild(self)
    }
}

DOMNode.__dir__ = function(self){
    var res = []
    // generic DOM attributes
    for(let attr in self){
        if(attr.charAt(0) != "$"){res.push(attr)}
    }
    for(let attr in DOMNode){
        if(res.indexOf(attr) == -1){
            res.push(attr)
        }
    }
    res.sort()
    return $B.$list(res)
}

DOMNode.__eq__ = function(self, other){
    return self == other
}

DOMNode.tp_getattro = function(self, attr){
    switch(attr) {
        case "attrs":
            return Attributes.$factory(self)
        case "children":
        case "child_nodes":
        case "class_name":
        case "html":
        case "parent":
        case "text":
            return DOMNode[attr](self)

        case "height":
        case "left":
        case "top":
        case "width":
            // Special case for Canvas
            // http://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5
            if(self.tagName == "CANVAS" && self[attr]){
                return self[attr]
            }

            if(self instanceof SVGElement){
                return self[attr].baseVal.value
            }
            var computed = window.getComputedStyle(self).
                                  getPropertyValue(attr)
            if(computed !== undefined){
                if(computed == ''){
                    if(self.style[attr] !== undefined){
                        return parseInt(self.style[attr])
                    }else{
                        return 0
                    }
                }
                let prop = Math.floor(parseFloat(computed) + 0.5)
                return isNaN(prop) ? 0 : prop
            }else if(self.style[attr]){
                return parseInt(self.style[attr])
            }else{
                $B.RAISE_ATTRIBUTE_ERROR("style." + attr +
                    " is not set for " + _b_.str.$factory(self), self, attr)
            }
        case "x":
        case "y":
            if(! (self instanceof SVGElement)){
                let pos = $getPosition(self)
                return attr == "x" ? pos.left : pos.top
            }
            break
        case "closest":
            if(! self[attr]){
                throw $B.attr_error(self, attr)
            }
            return function(){
                return DOMNode[attr].call(null, self, ...arguments)
            }
        case "headers":
          if(self.nodeType == Node.DOCUMENT_NODE){
              // HTTP headers
              let req = new XMLHttpRequest();
              req.open("GET", document.location, false)
              req.send(null);
              var headers = req.getAllResponseHeaders()
              headers = headers.split("\r\n")
              let res = $B.empty_dict()
              for(let header of headers){
                  if(header.strip().length == 0){
                      continue
                  }
                  let pos = header.search(":")
                  res.__setitem__(header.substr(0, pos),
                      header.substr(pos + 1).lstrip())
              }
              return res
          }
          break
        case "location":
            attr = "location"
            break
    }

    // Special case for attribute "select" of INPUT or TEXTAREA tags :
    // they have a "select" methods ; element.select() selects the
    // element text content.
    // Return a function that, if called without arguments, uses this
    // method ; otherwise, uses DOMNode.select
    if(attr == "select" && self.nodeType == 1 &&
            ["INPUT", "TEXTAREA"].indexOf(self.tagName.toUpperCase()) > -1){
        return function(selector){
            if(selector === undefined){
                self.select()
                return _b_.None
            }
            return DOMNode.select(self, selector)
        }
    }
    if(attr == "query" && self.nodeType == Node.DOCUMENT_NODE){
        // document.query is a instance of class Query, representing the
        // Query String
        let res = {
            ob_type: Query,
            _keys : $B.$list([]),
            _values : {}
        }
        let qs = location.search.substr(1).split('&')
        if(location.search != ""){
            for(let i = 0; i < qs.length; i++){
                let pos = qs[i].search("="),
                    elts = [qs[i].substr(0, pos), qs[i].substr(pos + 1)],
                    key = decodeURIComponent(elts[0]),
                    value = decodeURIComponent(elts[1])
                if(res._keys.indexOf(key) > -1){
                    res._values[key].push(value)
                }else{
                    res._keys.push(key)
                    res._values[key] = [value]
                }
            }
        }
        return res
    }

    var klass = $B.get_class(self)

    var property = self[attr]

    if(property !== undefined && self.ob_type &&
            klass.__module__ != "browser.html" &&
            klass.__module__ != "browser.svg" &&
            ! klass.$webcomponent){
        var from_class = $B.$getattr(klass, attr, null)
        if(from_class !== null){
            property = from_class
            if(typeof from_class === 'function'){
                return property.bind(self, self)
            }
        }else{

            // cf. issue #1543 : if an element has the attribute "attr" set and
            // its class has an attribute of the same name, show a warning that
            // the class attribute is ignored
            var bases = $B.get_class(self).tp_bases
            var show_message = true
            for(var base of bases){
                if(base.__module__ == "browser.html"){
                    show_message = false
                    break
                }
            }
            if(show_message){
                from_class = $B.$getattr($B.get_class(self), attr, _b_.None)
                if(from_class !== _b_.None){
                    var frame = $B.frame_obj.frame,
                        line = frame.$lineno
                    console.info("Warning: line " + line + ", " + self.tagName +
                        " element has instance attribute '" + attr + "' set." +
                        " Attribute of class " + $B.class_name(self) +
                        " is ignored.")
                }
            }
        }
    }

    if(property === undefined){
        // If custom element, search in the associated class
        if(self.tagName){
            var ce = customElements.get(self.tagName.toLowerCase())
            if(ce !== undefined && ce.$cls !== undefined){
                // Temporarily set self.__class_ to the WebComponent class
                var save_class = $B.get_class(self)
                self.ob_type = ce.$cls
                try{
                    let res = _b_.object.tp_getattro(self, attr)
                    self.ob_type = save_class
                    return res
                }catch(err){
                    self.ob_type = save_class
                    if(! $B.is_exc(err, [_b_.AttributeError])){
                        throw err
                    }
                }
            }
        }else{
            return object.tp_getattro(self, attr)
        }
    }

    var res = property

    if(res !== undefined){
        if(res === null){
            return res
        }
        if(typeof res === "function"){
            if(self.ob_type && self.ob_type.$webcomponent){
                var method = $B.$getattr($B.get_class(self), attr, null)
                if(method !== null){
                    // element is a web component, function is a method of the
                    // webcomp class: call it with Python arguments, bind to
                    // self. Cf. issue #2190
                    return res.bind(self)
                }
            }
            if(res.$function_infos){
                // If the attribute was set in __setattr__ (elt.foo = func),
                // then getattr(elt, "foo") must be "func"
                return res
            }
            // If elt[attr] is a function, it is converted in another function
            // that produces a Python error message in case of failure.
            var func = (function(f, elt){
                return function(){
                    var args = []
                    for(var i = 0; i < arguments.length; i++){
                        var arg = arguments[i]
                        if(typeof arg == "function"){
                            // Conversion of function arguments into functions
                            // that handle exceptions. The converted function
                            // is cached, so that for instance in this code :
                            //
                            // element.addEventListener("click", f)
                            // element.removeEventListener("click", f)
                            //
                            // it is the same function "f" that is added and
                            // then removed (cf. issue #1157)
                            var f1
                            if(arg.$cache){
                                f1 = arg.$cache
                            }else{
                                f1 = function(dest_fn){
                                    return function(){
                                        try{
                                            return dest_fn.apply(null, arguments)
                                        }catch(err){
                                            $B.handle_error(err)
                                        }
                                    }
                                }(arg)
                                arg.$cache = f1
                            }
                            args.push(f1)
                        }else{
                            args.push($B.pyobj2jsobj(arg))
                        }
                    }
                    var result = f.apply(elt, args)
                    return convertDomValue(result)
                }
            })(res, self)
            func.$infos = {__name__ : attr, __qualname__: attr}
            func.$is_func = true
            func.$python_function = res
            return func
        }
        if(attr == 'style'){
            return $B.jsobj2pyobj(self[attr])
        }
        if(Array.isArray(res)){ // issue #619
            return res
        }
        return js_immutable_to_py(res)
    }
    return object.tp_getattro(self, attr)
}

DOMNode.__getitem__ = function(self, key){
    if(self.nodeType == Node.DOCUMENT_NODE){ // Document
        if(typeof key.valueOf() == "string"){
            let res = self.getElementById(key)
            if(res){
                return DOMNode.$factory(res)
            }
            $B.RAISE(_b_.KeyError, key)
        }else{
            try{
                let elts = self.getElementsByTagName(key.__name__),
                    res = []
                    for(let i = 0; i < elts.length; i++){
                        res.push(DOMNode.$factory(elts[i]))
                    }
                    return res
            }catch(err){
                $B.RAISE(_b_.KeyError, _b_.str.$factory(key))
            }
        }
    }else{
        if((typeof key == "number" || typeof key == "boolean") &&
            typeof self.item == "function"){
                var key_to_int = _b_.int.$factory(key)
                if(key_to_int < 0){
                    key_to_int += self.length
                }
                let res = DOMNode.$factory(self.item(key_to_int))
                if(res === undefined){
                    $B.RAISE(_b_.KeyError, key)
                }
                return res
        }else if(typeof key == "string" &&
                 self.attributes &&
                 typeof self.attributes.getNamedItem == "function"){
             let attr = self.attributes.getNamedItem(key)
             if(attr !== null){
                 return attr.value
             }
             $B.RAISE(_b_.KeyError, key)
        }
    }
}

DOMNode.__hash__ = function(self){
    return self.__hashvalue__ === undefined ?
        (self.__hashvalue__ = $B.$py_next_hash--) :
        self.__hashvalue__
}

DOMNode.tp_iter = function(self){
    // iteration on a Node
    var items = []
    if(self.length !== undefined && typeof self.item == "function"){
        for(let i = 0, len = self.length; i < len; i++){
            items.push(DOMNode.$factory(self.item(i)))
        }
    }else if(self.childNodes !== undefined){
        for(let child of self.childNodes){
            items.push(DOMNode.$factory(child))
        }
    }
    return $B.$iter(items)
}

DOMNode.__le__ = function(self, other){
    // for document, append child to document.body
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    if($B.$isinstance(other, TagSum)){
        for(var i = 0; i < other.children.length; i++){
            self.appendChild(other.children[i])
        }
    }else if(typeof other == "string" || typeof other == "number"){
        var txt = document.createTextNode(other.toString())
        self.appendChild(txt)
    }else if(other instanceof Node){
        self.appendChild(other)
    }else{
        try{
            // If other is an iterable, add the items
            var items = _b_.list.$factory(other)
            items.forEach(function(item){
                DOMNode.__le__(self, item)
            })
        }catch(err){
            $B.RAISE(_b_.TypeError, "can't add '" +
                $B.class_name(other) + "' object to DOMNode instance")
        }
    }
    return self // to allow chained appends
}

DOMNode.sq_length = function(self){
    return self.length
}

DOMNode.__mul__ = function(self,other){
    if($B.$isinstance(other, _b_.int) && other.valueOf() > 0){
        var res = TagSum.$factory()
        var pos = res.children.length
        for(var i = 0; i < other.valueOf(); i++){
            res.children[pos++] = DOMNode.clone(self)
        }
        return res
    }
    $B.RAISE(_b_.ValueError, "can't multiply " + $B.class_name(self) +
        "by " + $B.class_name(other))
}

DOMNode.__ne__ = function(self, other){
    return ! DOMNode.__eq__(self, other)
}

DOMNode.tp_iternext = function(self){
   self.$counter++
   if(self.$counter < self.childNodes.length){
       return DOMNode.$factory(self.childNodes[self.$counter])
   }
   $B.RAISE(_b_.StopIteration, "StopIteration")
}

DOMNode.__radd__ = function(self, other){ // add to a string
    var res = TagSum.$factory()
    var txt = DOMNode.$factory(document.createTextNode(other))
    res.children = [txt, self]
    return res
}

DOMNode.tp_repr = function(self){
    var attrs = self.attributes,
        attrs_str = "",
        items = []
    if(attrs !== undefined){
        for(let attr of attrs){
            items.push(attr.name + '="' +
                self.getAttributeNS(null, attr.name) + '"')
        }
    }

    var proto = Object.getPrototypeOf(self)
    if(proto){
        var name = proto.constructor.name
        if(name === undefined){ // IE
            var proto_str = proto.constructor.toString()
            name = proto_str.substring(8, proto_str.length - 1)
        }
        items.splice(0, 0, name)
        return "<" + items.join(" ") + ">"
    }
    var res = "<DOMNode object type '"
    return res + $NodeTypes[self.nodeType] + "' name '" +
        self.nodeName + "'" + attrs_str + ">"
}

DOMNode.tp_setattro = function(self, attr, value){
    // Sets the *property* attr of the underlying element (not its
    // *attribute*)
    switch(attr){
        case "left":
        case "top":
        case "width":
        case "height":
            if($B.$isinstance(value, [_b_.int, _b_.float]) && self.nodeType == 1){
                self.style[attr] = value + "px"
                return _b_.None
            }else{
                $B.RAISE(_b_.ValueError, attr + " value should be" +
                    " an integer or float, not " + $B.class_name(value))
            }
    }
    if(DOMNode["set_" + attr] !== undefined) {
      return DOMNode["set_" + attr](self, value)
    }

    function warn(msg){
        console.log(msg)
        var frame = $B.frame_obj.frame
        if(! frame){
            return
        }
        if($B.get_option('debug') > 0){
            var file = frame.__file__,
                lineno = frame.$lineno
            console.log("module", frame[2], "line", lineno)
            if($B.file_cache.hasOwnProperty(file)){
                var src = $B.file_cache[file]
                console.log(src.split("\n")[lineno - 1])
            }
        }else{
            console.log("module", frame[2])
        }
    }

    // Warns if attr is a descriptor of the element's prototype
    // and it is not writable
    var proto = Object.getPrototypeOf(self),
        nb = 0
    while(!!proto && proto !== Object.prototype && nb++ < 10){
        var descriptors = Object.getOwnPropertyDescriptors(proto)
        if(!!descriptors &&
                typeof descriptors.hasOwnProperty == "function"){
            if(descriptors.hasOwnProperty(attr)){
                if(!descriptors[attr].writable &&
                        descriptors[attr].set === undefined){
                    warn("Warning: property '" + attr +
                        "' is not writable. Use element.attrs['" +
                        attr +"'] instead.")
                }
                break
            }
        }else{
            break
        }
        proto = Object.getPrototypeOf(proto)
    }

    // Warns if attribute is a property of style
    if(self.style && self.style[attr] !== undefined &&
            attr != 'src' // set by Chrome
            ){
        warn("Warning: '" + attr + "' is a property of element.style")
    }

    // Set the property
    self[attr] = py_immutable_to_js(value)

    return _b_.None

}

DOMNode.__setitem__ = function(self, key, value){
    if(typeof key == "number"){
        self.childNodes[key] = value
    }else if(typeof key == "string"){
        if(self.attributes){
            if(self instanceof SVGElement){
                self.setAttributeNS(null, key, value)
            }else if(typeof self.setAttribute == "function"){
                self.setAttribute(key, value)
            }
        }
    }
}

DOMNode.abs_left = {
    __get__: function(self){
        return $getPosition(self).left
    },
    __set__: function(self, value){
        $B.RAISE_ATTRIBUTE_ERROR("'DOMNode' objectattribute " +
            "'abs_left' is read-only", self, 'abs_left')
    }
}

DOMNode.abs_top = {
    __get__: function(self){
        return $getPosition(self).top
    },
    __set__: function(self, value){
        $B.RAISE_ATTRIBUTE_ERROR("'DOMNode' objectattribute " +
            "'abs_top' is read-only", self, 'abs_top')
    }
}

DOMNode.attach = DOMNode.__le__ // For allergics to syntax elt <= child

DOMNode.bind = function(){
    // bind functions to the event (event = "click", "mouseover" etc.)
    var $ = $B.args("bind", 4,
            {self: null, event: null, func: null, options: null},
            ["self", "event", "func", "options"], arguments,
            {func: _b_.None, options: _b_.None}, null, null),
            self = $.self,
            event = $.event,
            func = $.func,
            options = $.options

    if(func === _b_.None){
        // Returns a function to decorate the callback
        return function(f){
            return DOMNode.bind(self, event, f)
        }
    }
    var callback = (function(f){
        return function(ev){
            try{
                return $B.$call(f)($DOMEvent(ev))
            }catch(err){
                if(err.ob_type !== undefined){
                    $B.handle_error(err)
                }else{
                    try{
                        $B.$getattr($B.get_stderr(), "write")(err)
                    }catch(err1){
                        console.log(err)
                    }
                }
            }
        }}
    )(func)
    callback.$infos = func.$infos
    callback.$attrs = func.$attrs || {}
    callback.$func = func
    if(typeof options == "boolean"){
        self.addEventListener(event, callback, options)
    }else if($B.exact_type(options, _b_.dict)){
        self.addEventListener(event, callback, _b_.dict.$to_obj(options))
    }else if(options === _b_.None){
        self.addEventListener(event, callback, false)
    }
    self.$events = self.$events || {}
    self.$events[event] = self.$events[event] || []
    self.$events[event].push([func, callback])
    return self
}

DOMNode.children = function(self){
    var res = []
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    for(var child of self.children){
        res.push(DOMNode.$factory(child))
    }
    return $B.$list(res)
}


DOMNode.child_nodes = function(self){
    var res = []
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    for(var child of self.childNodes){
        res.push(DOMNode.$factory(child))
    }
    return $B.$list(res)
}

DOMNode.clear = function(){
    // remove all children elements
    var $ = $B.args("clear", 1, {self: null}, ["self"], arguments, {},
                null, null),
        self = $.self
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    while(self.firstChild){
       self.removeChild(self.firstChild)
    }
}

DOMNode.Class = function(self){
    if(self.className !== undefined){
        return self.className
    }
    return _b_.None
}

DOMNode.class_name = function(self){
    return DOMNode.Class(self)
}

DOMNode.clone = function(self){
    var res = DOMNode.$factory(self.cloneNode(true))

    // bind events on clone to the same callbacks as self
    var events = self.$events || {}
    for(var event in events){
        var evt_list = events[event]
        evt_list.forEach(function(evt){
            var func = evt[0]
            DOMNode.bind(res, event, func)
        })
    }
    return res
}

DOMNode.closest = function(){
    // Returns the first parent of self with specified CSS selector
    // Raises KeyError if not found
    var $ = $B.args("closest", 2, {self: null, selector: null},
                ["self", "selector"], arguments, {}, null, null),
        self = $.self,
        selector = $.selector
    if(self.closest === undefined){
        $B.RAISE_ATTRIBUTE_ERROR(_b_.str.$factory(self) +
            " has no attribute 'closest'", self, 'closest')
    }
    var res = self.closest(selector)
    if(res === null){
        $B.RAISE(_b_.KeyError, "no parent with selector " + selector)
    }
    return DOMNode.$factory(res)
}

DOMNode.bindings = function(self){
    // Return a dictionary mapping events defined on self to the associated
    // callback functions
    var res = $B.empty_dict()
    for(var key in self.$events){
        _b_.dict.$setitem(res, key, self.$events[key].map(x => x[1]))
    }
    return res
}

DOMNode.events = function(self, event){
    self.$events = self.$events || {}
    var evt_list = self.$events[event] = self.$events[event] || [],
        funcs = evt_list.map(x => x[0])
    return $B.$list(funcs)
}

function make_list(node_list){
    var res = []
    for(var i = 0; i < node_list.length; i++){
        res.push(DOMNode.$factory(node_list[i]))
    }
    return $B.$list(res)
}

DOMNode.get = function(self){
    // for document : doc.get(key1=value1[,key2=value2...]) returns a list of the elements
    // with specified keys/values
    // key can be 'id','name' or 'selector'
    var args = []
    for(var i = 1; i < arguments.length; i++){
        args.push(arguments[i])
    }
    var $ns = $B.args("get", 0, {}, [], args, {}, null, "kw"),
        $dict = _b_.dict.$to_obj($ns.kw)

    if($dict["name"] !== undefined){
        if(self.getElementsByName === undefined){
            $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
                "selection by name")
        }
        return make_list(self.getElementsByName($dict['name']))
    }
    if($dict["tag"] !== undefined){
        if(self.getElementsByTagName === undefined){
            $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
                "selection by tag name")
        }
        return make_list(self.getElementsByTagName($dict["tag"]))
    }
    if($dict["classname"] !== undefined){
        if(self.getElementsByClassName === undefined){
            $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
                "selection by class name")
        }
        return make_list(self.getElementsByClassName($dict['classname']))
    }
    if($dict["id"] !== undefined){
        if(self.getElementById === undefined){
            $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
                "selection by id")
        }
        var id_res = document.getElementById($dict['id'])
        if(! id_res){return []}
        return $B.$list([DOMNode.$factory(id_res)])
    }
    if($dict["selector"] !== undefined){
        if(self.querySelectorAll === undefined){
            $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
                "selection by selector")
        }
        return make_list(self.querySelectorAll($dict['selector']))
    }
    return $B.$list([])
}

DOMNode.getContext = function(self){ // for CANVAS tag
    if(!("getContext" in self)){
      $B.RAISE_ATTRIBUTE_ERROR("object has no attribute 'getContext'", self,
          'getContext')
    }
    return function(ctx){
        return $B.jsobj2pyobj(self.getContext(ctx))
    }
}

DOMNode.getSelectionRange = function(self){ // for TEXTAREA
    if(self["getSelectionRange"] !== undefined){
        return self.getSelectionRange.apply(null, arguments)
    }
}

DOMNode.html = function(self){
    var res = self.innerHTML
    if(res === undefined){
        if(self.nodeType == Node.DOCUMENT_NODE && self.body){
            res = self.body.innerHTML
        }else{
            res = _b_.None
        }
    }
    return res
}

DOMNode.index = function(self, selector){
    var items
    if(selector === undefined){
        items = self.parentElement.childNodes
    }else{
        items = self.parentElement.querySelectorAll(selector)
    }
    var rank = -1
    for(var i = 0; i < items.length; i++){
        if(items[i] === self){rank = i; break}
    }
    return rank
}

DOMNode.inside = function(self, other){
    // Test if a node is inside another node
    var elt = self
    while(true){
        if(other === elt){return true}
        elt = elt.parentNode
        if(! elt){return false}
    }
}

DOMNode.parent = function(self){
    if(self.parentElement){
        return DOMNode.$factory(self.parentElement)
    }
    return _b_.None
}

DOMNode.reset = function(self){ // for FORM
    return function(){self.reset()}
}

DOMNode.scrolled_left = {
    __get__: function(self){
        return $getPosition(self).left -
            document.scrollingElement.scrollLeft
    },
    __set__: function(self, value){
        $B.RAISE_ATTRIBUTE_ERROR("'DOMNode' objectattribute " +
            "'scrolled_left' is read-only", self, 'scrolled_left')
    }
}

DOMNode.scrolled_top = {
    __get__: function(self){
        return $getPosition(self).top -
            document.scrollingElement.scrollTop
    },
    __set__: function(self, value){
        $B.RAISE_ATTRIBUTE_ERROR("'DOMNode' objectattribute " +
            "'scrolled_top' is read-only", self, 'scrolled_top')
    }
}

DOMNode.select = function(self, selector){
    // alias for get(selector=...)
    if(self.querySelectorAll === undefined){
        $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
            "selection by selector")
    }
    return make_list(self.querySelectorAll(selector))
}

DOMNode.select_one = function(self, selector){
    // return the element matching selector, or None
    if(self.querySelector === undefined){
        $B.RAISE(_b_.TypeError, "DOMNode object doesn't support " +
            "selection by selector")
    }
    var res = self.querySelector(selector)
    if(res === null) {
        return _b_.None
    }
    return DOMNode.$factory(res)
}

DOMNode.setSelectionRange = function(){ // for TEXTAREA
    if(this["setSelectionRange"] !== undefined){
        return (function(obj){
            return function(){
                return obj.setSelectionRange.apply(obj, arguments)
            }})(this)
    }else if(this["createTextRange"] !== undefined){
        return (function(obj){
            return function(start_pos, end_pos){
                if(end_pos == undefined){end_pos = start_pos}
            var range = obj.createTextRange()
            range.collapse(true)
            range.moveEnd("character", start_pos)
            range.moveStart("character", end_pos)
            range.select()
                }
        })(this)
    }
}

DOMNode.set_class_name = function(self, arg){
    self.setAttribute("class", arg)
}

DOMNode.set_html = function(self, value){
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    self.innerHTML = _b_.str.$factory(value)
}

DOMNode.set_style = function(self, style){ // style is a dict
    if(typeof style === 'string'){
        self.style = style
        return
    }else if(!$B.$isinstance(style, _b_.dict)){
        $B.RAISE(_b_.TypeError, "style must be str or dict, not " +
            $B.class_name(style))
    }
    var items = _b_.list.$factory(_b_.dict.items(style))
    for(var i = 0; i < items.length; i++){
        var key = items[i][0],
            value = items[i][1]
        if(key.toLowerCase() == "float"){
            self.style.cssFloat = value
            self.style.styleFloat = value
        }else{
            switch(key) {
                case "top":
                case "left":
                case "width":
                case "height":
                case "borderWidth":
                    if($B.$isinstance(value,_b_.int)){value = value + "px"}
            }
            self.style[key] = value
        }
    }
}

DOMNode.set_text = function(self,value){
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    self.innerText = _b_.str.$factory(value)
    self.textContent = _b_.str.$factory(value)
}

DOMNode.set_value = function(self, value){
    self.value = _b_.str.$factory(value)
}

DOMNode.submit = function(self){ // for FORM
    return function(){self.submit()}
}

DOMNode.text = function(self){
    if(self.nodeType == Node.DOCUMENT_NODE){
        self = self.body
    }
    var res = self.innerText || self.textContent
    if(res === null){
        res = _b_.None
    }
    return res
}

DOMNode.toString = function(self){
    if(self === undefined){return 'DOMNode'}
    return self.nodeName
}

DOMNode.trigger = function (self, etype){
    // Artificially triggers the event type provided for this DOMNode
    if(self.fireEvent){
      self.fireEvent("on" + etype)
    }else{
      var evObj = document.createEvent("Events")
      evObj.initEvent(etype, true, false)
      self.dispatchEvent(evObj)
    }
}

DOMNode.unbind = function(self, event){
    // unbind functions from the event (event = "click", "mouseover" etc.)
    // if no function is specified, remove all callback functions
    // If no event is specified, remove all callbacks for all events
    if(! self.$events){
        return _b_.None
    }

    if(event === undefined){
        for(let evt in self.$events){
            DOMNode.unbind(self, evt)
        }
        return _b_.None
    }

    if(self.$events[event] === undefined ||
            self.$events[event].length == 0){
        return _b_.None
    }

    var events = self.$events[event]
    if(arguments.length == 2){
        // remove all callback functions
        for(let evt of events){
            var callback = evt[1]
            self.removeEventListener(event, callback, false)
        }
        self.$events[event] = []
        return _b_.None
    }

    for(let i = 2; i < arguments.length; i++){
        let func = arguments[i],
            flag = false
        for(let j = 0, len = events.length; j < len; j++){
            if($B.is_or_equals(func, events[j][0])){
                let _callback = events[j][1]
                self.removeEventListener(event, _callback, false)
                events.splice(j, 1)
                flag = true
                break
            }
        }
        // The indicated func was not found, error is thrown
        if(! flag){
            $B.RAISE(_b_.KeyError, 'missing callback for event ' + event)
        }
    }
}

$B.set_func_names(DOMNode, "builtins")

// return query string as an object with methods to access keys and values
// same interface as cgi.FieldStorage, with getvalue / getlist / getfirst
var Query = $B.make_builtin_class("query")

Query.__contains__ = function(self, key){
    return self._keys.indexOf(key) > -1
}

Query.__getitem__ = function(self, key){
    // returns a single value or a list of values
    // associated with key, or raise KeyError
    var result = self._values[key]
    if(result === undefined){
        $B.RAISE(_b_.KeyError, key)
    }else if(result.length == 1){
        return result[0]
    }
    return result
}

var Query_iterator = $B.make_iterator_class("query string iterator")

Query.tp_iter = function(self){
    return Query_iterator.$factory(self._keys)
}

Query.__setitem__ = function(self, key, value){
    self._values[key] = [value]
    return _b_.None
}

Query.tp_repr = function(self){
    // build query string from keys/values
    var elts = []
    for(var key in self._values){
        for(const val of self._values[key]){
            elts.push(encodeURIComponent(key) + "=" + encodeURIComponent(val))
        }
    }
    if(elts.length == 0){
        return ""
    }else{
        return "?" + elts.join("&")
    }
}

Query.getfirst = function(self, key, _default){
    // returns the first value associated with key
    var result = self._values[key]
    if(result === undefined){
       if(_default === undefined){return _b_.None}
       return _default
    }
    return result[0]
}

Query.getlist = function(self, key){
    // always return a list
    return $B.$list(self._values[key] ?? [])
}

Query.getvalue = function(self, key, _default){
    try{
        return Query.__getitem__(self, key)
    }catch(err){
        if(_default === undefined){
            return _b_.None
        }
        return _default
    }
}

Query.keys = function(self){
    return self._keys
}

$B.set_func_names(Query, "<dom>")

// class used for tag sums
var TagSum = $B.make_builtin_class("TagSum")

TagSum.$factory = function(){
    return {
        ob_type: TagSum,
        children: [],
        toString: function(){return "(TagSum)"}
    }
}

TagSum.appendChild = function(self, child){
    self.children.push(child)
}

TagSum.__add__ = function(self, other){
    if($B.get_class(other) === TagSum){
        self.children = self.children.concat(other.children)
    }else if($B.$isinstance(other, [_b_.str, _b_.int, _b_.float,
                               _b_.dict, _b_.set, _b_.list])){
        self.children = self.children.concat(
            DOMNode.$factory(document.createTextNode(other)))
    }else{
        self.children.push(other)
    }
    return self
}

TagSum.__radd__ = function(self, other){
    var res = TagSum.$factory()
    res.children = self.children.slice()
    res.children.splice(0, 0, DOMNode.$factory(document.createTextNode(other)))
    return res
}

TagSum.tp_repr = function(self){
    var res = "<object TagSum> "
    for(var i = 0; i < self.children.length; i++){
        res += self.children[i]
        if(self.children[i].toString() == "[object Text]"){
            res += " [" + self.children[i].textContent + "]\n"
        }
    }
    return res
}

TagSum.clone = function(self){
    var res = TagSum.$factory()
    for(var i = 0; i < self.children.length; i++){
        res.children.push(self.children[i].cloneNode(true))
    }
    return res
}

$B.set_func_names(TagSum, "<dom>")

$B.TagSum = TagSum // used in _html.js and _svg.js

$B.DOMNode = DOMNode


})(__BRYTHON__);
