;(function($B){

//eval($B.InjectBuiltins())

var _b_ = $B.builtins;
var object = _b_.object
var JSObject = $B.JSObject
var _window = self;

// cross-browser utility functions
function $getMouseOffset(target, ev){
    ev = ev || _window.event;
    var docPos    = $getPosition(target);
    var mousePos  = $mouseCoords(ev);
    return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

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

function $mouseCoords(ev){
    var posx = 0,
        posy = 0
    if(!ev){var ev = _window.event}
    if(ev.pageX || ev.pageY){
        posx = ev.pageX
        posy = ev.pageY
    }else if(ev.clientX || ev.clientY){
        posx = ev.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft
        posy = ev.clientY + document.body.scrollTop +
            document.documentElement.scrollTop
    }
    var res = {}
    res.x = _b_.int.$factory(posx)
    res.y = _b_.int.$factory(posy)
    res.__getattr__ = function(attr){return this[attr]}
    res.__class__ = "MouseCoords"
    return res
}

var $DOMNodeAttrs = ["nodeName", "nodeValue", "nodeType", "parentNode",
    "childNodes", "firstChild", "lastChild", "previousSibling", "nextSibling",
    "attributes", "ownerDocument"]

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
    for(var i = 0; i < $DOMEventAttrs_W3C.length; i++){
        if(obj[$DOMEventAttrs_W3C[i]] === undefined){flag = false; break}
    }
    if(flag){return true}
    for(var i = 0; i < $DOMEventAttrs_IE.length; i++){
        if(obj[$DOMEventAttrs_IE[i]] === undefined){return false}
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
var Attributes = $B.make_class("Attributes",
    function(elt){
        return{
            __class__: Attributes,
            elt: elt
        }
    }
)

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
        throw _b_.KeyError.$factory($.key)
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
    throw _b_.KeyError.$factory($.key)
}

Attributes.__iter__ = function(self){
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

Attributes.__next__ = function(){
    var $ = $B.args("__next__", 1, {self: null},
        ["self"], arguments, {}, null, null)
    if($.self.$counter < $.self.$items.length){
        var res = $.self.$items[$.self.$counter]
        $.self.$counter++
        return res
    }else{
        throw _b_.StopIteration.$factory("")
    }
}

Attributes.__setitem__ = function(){
    var $ = $B.args("__setitem__", 3, {self: null, key:null, value: null},
        ["self", "key", "value"], arguments, {}, null, null)
    if($.self.elt instanceof SVGElement &&
            typeof $.self.elt.setAttributeNS == "function"){
        $.self.elt.setAttributeNS(null, $.key, $.value)
        return _b_.None
    }else if(typeof $.self.elt.setAttribute == "function"){
        $.self.elt.setAttribute($.key, $.value)
        return _b_.None
    }
    throw _b_.TypeError.$factory("Can't set attributes on element")
}

Attributes.get = function(){
    var $ = $B.args("get", 3, {self: null, key:null, deflt: null},
        ["self", "key", "deflt"], arguments, {deflt:_b_.None}, null, null)
    try{
        return Attributes.__getitem__($.self, $.key)
    }catch(err){
        if(err.__class__ === _b_.KeyError){
            return $B.deflt
        }else{
            throw err
        }
    }
}

Attributes.keys = function(){
    return Attributes.__iter__.apply(null, arguments)
}

Attributes.items = function(){
    var $ = $B.args("values", 1, {self: null},
        ["self"], arguments, {}, null, null),
        attrs = $.self.elt.attributes,
        values = []
    for(var i = 0; i < attrs.length; i++){
        values.push([attrs[i].name, attrs[i].value])
    }
    return _b_.list.__iter__(values)
}

Attributes.values = function(){
    var $ = $B.args("values", 1, {self: null},
        ["self"], arguments, {}, null, null),
        attrs = $.self.elt.attributes,
        values = []
    for(var i = 0; i < attrs.length; i++){
        values.push(attrs[i].value)
    }
    return _b_.list.__iter__(values)
}
$B.set_func_names(Attributes, "<dom>")

// Class for DOM events

var DOMEvent = $B.DOMEvent = {
    __class__: _b_.type,
    __mro__: [object],
    $infos:{
        __name__: "DOMEvent"
    }
}

DOMEvent.__new__ = function(cls, evt_name){
    var ev = new Event(evt_name)
    ev.__class__ = DOMEvent
    if(ev.preventDefault === undefined){
        ev.preventDefault = function(){ev.returnValue = false}
    }
    if(ev.stopPropagation === undefined){
        ev.stopPropagation = function(){ev.cancelBubble = true}
    }
    return ev
}

DOMEvent.__getattribute__ = function(self, attr){
    switch(attr) {
        case '__repr__':
        case '__str__':
            return function(){return '<DOMEvent object>'}
        case 'x':
            return $mouseCoords(self).x
        case 'y':
            return $mouseCoords(self).y
        case 'data':
            if(self.dataTransfer !== undefined){
                return Clipboard.$factory(self.dataTransfer)
            }
            return self['data']
        case 'target':
            if(self.target !== undefined){
                return DOMNode.$factory(self.target)
            }
        case 'char':
            return String.fromCharCode(self.which)
    }

    var res =  self[attr]
    if(res !== undefined){
        if(typeof res == "function"){
            var func = function(){
                var args = []
                for(var i = 0; i < arguments.length; i++){
                    args.push($B.pyobj2jsobj(arguments[i]))
                }
                return res.apply(self, arguments)
            }
            func.$infos = {
                __name__: res.toString().substr(9, res.toString().search("{"))
            }
            return func
        }
        return $B.$JS2Py(res)
    }
    throw _b_.AttributeError.$factory("object DOMEvent has no attribute '" +
        attr + "'")
}

DOMEvent.$factory = function(evt_name){
    // Factory to create instances of DOMEvent, based on an event name
    return DOMEvent.__new__(DOMEvent, evt_name)
}

// Function to transform a DOM event into an instance of DOMEvent
var $DOMEvent = $B.$DOMEvent = function(ev){
    ev.__class__ = DOMEvent
    if(ev.preventDefault === undefined){
        ev.preventDefault = function(){ev.returnValue = false}
    }
    if(ev.stopPropagation === undefined){
        ev.stopPropagation = function(){ev.cancelBubble = true}
    }
    return ev
}

$B.set_func_names(DOMEvent, "<dom>")

var Clipboard = {
    __class__: _b_.type,
    $infos: {
        __module__: "<pydom>",
        __name__: "Clipboard"
    }
}

Clipboard.__getitem__ = function(self, name){
    return self.data.getData(name)
}

Clipboard.__mro__ = [object]

Clipboard.__setitem__ = function(self, name, value){
    self.data.setData(name, value)
}

Clipboard.$factory = function(data){ // drag and drop dataTransfer
    return {
        __class__ : Clipboard,
        __dict__: _b_.dict.$factory(),
        data : data
    }
}

$B.set_func_names(Clipboard, "<dom>")

function $EventsList(elt, evt, arg){
    // handles a list of callback fuctions for the event evt of element elt
    // method .remove(callback) removes the callback from the list, and
    // removes the event listener
    this.elt = elt
    this.evt = evt
    if(isintance(arg, list)){this.callbacks = arg}
    else{this.callbacks = [arg]}
    this.remove = function(callback){
        var found = false
        for(var i = 0; i < this.callbacks.length; i++){
            if(this.callbacks[i] === callback){
                found = true
                this.callback.splice(i, 1)
                this.elt.removeEventListener(this.evt, callback, false)
                break
            }
        }
        if(! found){throw _b_.KeyError.$factory("not found")}
    }
}

var OpenFile = $B.OpenFile = {
    __class__: _b_.type,  // metaclass type
    __mro__: [object],
    $infos: {
        __module__: "<pydom>",
        __name__: "OpenFile"
    }
}

OpenFile.$factory = function(file, mode, encoding) {
    var res = {
        __class__: $OpenFileDict,
        file: file,
        reader: new FileReader()
    }
    if(mode === "r"){
        res.reader.readAsText(file, encoding)
    }else if(mode === "rb"){
        res.reader.readAsBinaryString(file)
    }
    return res
}

OpenFile.__getattr__ = function(self, attr) {
    if(self["get_" + attr] !== undefined){return self["get_" + attr]}
    return self.reader[attr]
}

OpenFile.__setattr__ = function(self, attr, value) {
    var obj = self.reader
    if(attr.substr(0,2) == "on"){ // event
        var callback = function(ev) { return value($DOMEvent(ev)) }
        obj.addEventListener(attr.substr(2), callback)
    }else if("set_" + attr in obj){
        return obj["set_" + attr](value)
    }else if(attr in obj){
        obj[attr] = value
    }else{
        setattr(obj, attr, value)
    }
}

$B.set_func_names(OpenFile, "<dom>")

var dom = {
    File : function(){},
    FileReader : function(){}
    }
dom.File.__class__ = _b_.type
dom.File.__str__ = function(){return "<class 'File'>"}
dom.FileReader.__class__ = _b_.type
dom.FileReader.__str__ = function(){return "<class 'FileReader'>"}

// Class for options in a select box

var Options = {
    __class__: _b_.type,
    __delitem__: function(self, arg){
        self.parent.options.remove(arg.elt)
    },
    __getitem__: function(self, key){
        return DOMNode.$factory(self.parent.options[key])
    },
    __len__: function(self){
        return self.parent.options.length
    },
    __mro__: [object],
    __setattr__: function(self, attr, value){
        self.parent.options[attr] = value
    },
    __setitem__: function(self, attr, value){
        self.parent.options[attr] = $B.$JS2Py(value)
    },
    __str__: function(self){
        return "<object Options wraps " + self.parent.options + ">"
    },
    append: function(self, element){
        self.parent.options.add(element.elt)
    },
    insert: function(self, index, element){
        if(index === undefined){self.parent.options.add(element.elt)}
        else{self.parent.options.add(element.elt, index)}
    },
    item: function(self, index){
        return self.parent.options.item(index)
    },
    namedItem: function(self, name){
        return self.parent.options.namedItem(name)
    },
    remove: function(self, arg){
        self.parent.options.remove(arg.elt)
    },
    $infos: {
        __module__: "<pydom>",
        __name__: "Options"
    }
}

Options.$factory = function(parent){
    return {
        __class__: Options,
        parent: parent
    }
}

$B.set_func_names(Options, "<dom>")

// Class for DOM nodes

var DOMNode = {
    __class__ : _b_.type,
    __mro__: [object],
    $infos: {
        __module__: "<pydom>",
        __name__: "DOMNode"
    }
}

DOMNode.$factory = function(elt, fromtag){
    if(elt.__class__ === DOMNode){return elt}
    if(typeof elt == "number" || typeof elt == "boolean" ||
        typeof elt == "string"){return elt}

    // if none of the above, fromtag determines if the call is made by
    // the tag factory or by any other call to DOMNode
    // if made by tag factory (fromtag will be defined, the value is not
    // important), the regular plain old behavior is retained. Only the
    // return value of a DOMNode is sought

    // In other cases (fromtag is undefined), DOMNode tries to return a "tag"
    // from the browser.html module by looking into "$tags" which is set
    // by the  browser.html module itself (external sources could override
    // it) and piggybacks on the tag factory by adding an "elt_wrap"
    // attribute to the class to let it know, that special behavior
    // is needed. i.e: don't create the element, use the one provided
    if(fromtag === undefined) {
        if(DOMNode.tags !== undefined) {  // tags is a python dictionary
            var tdict = DOMNode.tags.$string_dict
            if(tdict !== undefined) {
                var klass = tdict[elt.tagName]
                if(klass !== undefined) {
                    // all checks are good
                    klass.$elt_wrap = elt  // tell class to wrap element
                    return klass.$factory()  // and return what the factory wants
                }
            }
        }
        // all "else" ... default to old behavior of plain DOMNode wrapping
    }
    if(elt["$brython_id"] === undefined || elt.nodeType == 9){
        // add a unique id for comparisons
        elt.$brython_id = "DOM-" + $B.UUID()
    }

    return {
        __class__: DOMNode,
        elt: elt
    }
}


DOMNode.__add__ = function(self, other){
    // adding another element to self returns an instance of TagSum
    var res = TagSum.$factory()
    res.children = [self], pos = 1
    if(_b_.isinstance(other, TagSum)){
        res.children = res.children.concat(other.children)
    }else if(_b_.isinstance(other,[_b_.str, _b_.int, _b_.float, _b_.list,
                                _b_.dict, _b_.set, _b_.tuple])){
        res.children[pos++] = DOMNode.$factory(
            document.createTextNode(_b_.str.$factory(other)))
    }else if(_b_.isinstance(other, DOMNode)){
        res.children[pos++] = other
    }else{
        // If other is iterable, add all items
        try{res.children = res.children.concat(_b_.list.$factory(other))}
        catch(err){throw _b_.TypeError.$factory("can't add '" +
            $B.class_name(other) + "' object to DOMNode instance")
        }
    }
    return res
}

DOMNode.__bool__ = function(self){return true}

DOMNode.__contains__ = function(self, key){
    // For document, if key is a string, "key in document" tells if an element
    // with id "key" is in the document
    if(self.elt.nodeType == 9 && typeof key == "string"){
        return document.getElementById(key) !== null
    }
    key = key.elt !==undefined ? key.elt : key
    if(self.elt.length !== undefined && typeof self.elt.item == "function"){
        for(var i = 0, len = self.elt.length; i < len; i++){
            if(self.elt.item(i) === key){return true}
        }
    }
    return false
}

DOMNode.__del__ = function(self){
    // if element has a parent, calling __del__ removes object
    // from the parent's children
    if(!self.elt.parentNode){
        throw _b_.ValueError.$factory("can't delete " + _b_.str.$factory(self.elt))
    }
    self.elt.parentNode.removeChild(self.elt)
}

DOMNode.__delitem__ = function(self, key){
    if(self.elt.nodeType == 9){ // document : remove by id
        var res = self.elt.getElementById(key)
        if(res){res.parentNode.removeChild(res)}
        else{throw _b_.KeyError.$factory(key)}
    }else{ // other node : remove by rank in child nodes
        self.elt.parentNode.removeChild(self.elt)
    }
}

DOMNode.__dir__ = function(self){
    var res = []
    // generic DOM attributes
    for(var attr in self.elt){
        if(attr.charAt(0) != "$"){res.push(attr)}
    }
    // Brython-specific attributes
    for(var attr in DOMNode){
        if(attr.charAt(0) != "$" && res.indexOf(attr) == -1){res.push(attr)}
    }
    return res
}

DOMNode.__eq__ = function(self, other){
    return self.elt == other.elt
}

DOMNode.__getattribute__ = function(self, attr){

    if(attr.substr(0, 2) == "$$"){attr = attr.substr(2)}
    switch(attr) {
        case "attrs":
            return Attributes.$factory(self.elt)
        case "class_name":
        case "html":
        case "id":
        case "parent":
        case "query":
        case "text":
            return DOMNode[attr](self)

        case "height":
        case "left":
        case "top":
        case "width":
            // Special case for Canvas
            // http://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5
            if(self.elt.tagName == "CANVAS" && self.elt[attr]){
                return self.elt[attr]
            }

            if(self.elt instanceof SVGElement){
                return self.elt[attr].baseVal.value
            }
            if(self.elt.style[attr]){
                return parseInt(self.elt.style[attr])
            }else{
                throw _b_.AttributeError.$factory("style." + attr +
                    " is not set for " + _b_.str.$factory(self))
            }
        case "clear":
        case "closest":
            return function(){return DOMNode[attr](self, arguments[0])}
        case "headers":
          if(self.elt.nodeType == 9){
              // HTTP headers
              var req = new XMLHttpRequest();
              req.open("GET", document.location, false)
              req.send(null);
              var headers = req.getAllResponseHeaders()
              headers = headers.split("\r\n")
              var res = _b_.dict.$factory()
              for(var i = 0; i < headers.length; i++){
                  var header = headers[i]
                  if(header.strip().length == 0){continue}
                  var pos = header.search(":")
                  res.__setitem__(header.substr(0, pos),
                      header.substr(pos + 1).lstrip())
              }
              return res
          }
          break
        case "$$location":
            attr = "location"
            break
    }

    // Special case for attribute "select" of INPUT or TEXTAREA tags :
    // they have a "select" methods ; element.select() selects the
    // element text content.
    // Return a function that, if called without arguments, uses this
    // method ; otherwise, uses DOMNode.select
    if(attr == "select" && self.elt.nodeType == 1 &&
            ["INPUT", "TEXTAREA"].indexOf(self.elt.tagName.toUpperCase()) > -1){
        return function(selector){
            if(selector === undefined){self.elt.select(); return _b_.None}
            return DOMNode.select(self, selector)
        }
    }

    // Looking for property. If the attribute is in the forbidden
    // arena ... look for the aliased version
    var property = self.elt[attr]
    if(property === undefined && $B.aliased_names[attr]){
        property = self.elt["$$" + attr]
    }

    if(property === undefined){
        return object.__getattribute__(self, attr)
    }

    var res = property

    if(res !== undefined){
        if(res === null){return _b_.None}
        if(typeof res === "function"){
            var func = (function(f, elt){
                return function(){
                    var args = [], pos = 0
                    for(var i = 0; i < arguments.length; i++){
                        var arg = arguments[i]
                        if(typeof arg == "function"){
                            var f1 = function(dest_fn) { return function(){
                                try{return dest_fn.apply(null, arguments)}
                                catch(err){
                                    console.log(dest_fn, typeof dest_fn, err)
                                    if(err.__class__ !== undefined){
                                        var msg = $B.$getattr(err, 'info') +
                                            '\n' + $B.class_name(err)
                                        if(err.args){msg += ': ' + err.args[0]}
                                        try{$B.$getattr($B.stderr, "write")(msg)}
                                        catch(err){console.log(msg)}
                                    }else{
                                        try{$B.$getattr($B.stderr, "write")(err)}
                                        catch(err1){console.log(err)}
                                    }
                                    throw err
                                }
                            }}(arg)
                            args[pos++] = f1
                        }
                        else if(_b_.isinstance(arg, JSObject)){
                            args[pos++] = arg.js
                        }else if(_b_.isinstance(arg, DOMNode)){
                            args[pos++] = arg.elt
                        }else if(arg === _b_.None){
                            args[pos++] = null
                        }else{
                            args[pos++] = arg
                        }
                    }
                    var result = f.apply(elt, args)
                    return $B.$JS2Py(result)
                }
            })(res, self.elt)
            func.$infos = {__name__ : attr}
            func.$is_func = true
            return func
        }
        if(attr == 'options'){return Options.$factory(self.elt)}
        if(attr == 'style'){return $B.JSObject.$factory(self.elt[attr])}
        if(Array.isArray(res)){return res} // issue #619

        return $B.$JS2Py(res)
    }
    return object.__getattribute__(self, attr)
}

DOMNode.__getitem__ = function(self, key){
    if(self.elt.nodeType == 9){ // Document
        if(typeof key == "string"){
            var res = self.elt.getElementById(key)
            if(res){return DOMNode.$factory(res)}
            throw _b_.KeyError.$factory(key)
        }else{
            try{
                var elts = self.elt.getElementsByTagName(key.$infos.__name__),
                    res = []
                    for(var i = 0; i < elts.length; i++){
                        res.push(DOMNode.$factory(elts[i]))
                    }
                    return res
            }catch(err){
                throw _b_.KeyError.$factory(_b_.str.$factory(key))
            }
        }
    }else{
        if((typeof key == "number" || typeof key == "boolean") &&
            typeof self.elt.item == "function"){
                var key_to_int = _b_.int.$factory(key)
                if(key_to_int < 0){key_to_int += self.elt.length}
                var res = DOMNode.$factory(self.elt.item(key_to_int))
                if(res === undefined){throw _b_.KeyError.$factory(key)}
                return res
        }else if(typeof key == "string" &&
                 self.elt.attributes &&
                 typeof self.elt.attributes.getNamedItem == "function"){
             var attr = self.elt.attributes.getNamedItem(key)
             if(!!attr){return attr.value}
             throw _b_.KeyError.$factory(key)
        }
    }
}

DOMNode.__iter__ = function(self){
    // iteration on a Node
    if(self.elt.length !== undefined && typeof self.elt.item == "function"){
        var items = []
        for(var i = 0, len = self.elt.length; i < len; i++){
            items.push(DOMNode.$factory(self.elt.item(i)))
        }
    }else if(self.elt.childNodes !== undefined){
        var items = []
        for(var i = 0, len = self.elt.childNodes.length; i < len; i++){
            items.push(DOMNode.$factory(self.elt.childNodes[i]))
        }
    }
    return $B.$iter(items)
}

DOMNode.__le__ = function(self, other){
    // for document, append child to document.body
    var elt = self.elt
    if(self.elt.nodeType == 9){elt = self.elt.body}
    if(_b_.isinstance(other, TagSum)){
        for(var i = 0; i < other.children.length; i++){
            elt.appendChild(other.children[i].elt)
        }
    }else if(typeof other == "string" || typeof other == "number"){
        var $txt = document.createTextNode(other.toString())
        elt.appendChild($txt)
    }else if(_b_.isinstance(other, DOMNode)){
        // other is a DOMNode instance
        elt.appendChild(other.elt)
    }else{
        try{
            // If other is an iterable, add the items
            var items = _b_.list.$factory(other)
            items.forEach(function(item){
                DOMNode.__le__(self, item)
            })
        }catch(err){
            throw _b_.TypeError.$factory("can't add '" +
                $B.class_name(other) + "' object to DOMNode instance")
        }
    }
}

DOMNode.__len__ = function(self){return self.elt.length}

DOMNode.__mul__ = function(self,other){
    if(_b_.isinstance(other, _b_.int) && other.valueOf() > 0){
        var res = TagSum.$factory()
        var pos = res.children.length
        for(var i = 0; i < other.valueOf(); i++){
            res.children[pos++] = DOMNode.clone(self)()
        }
        return res
    }
    throw _b_.ValueError.$factory("can't multiply " + self.__class__ +
        "by " + other)
}

DOMNode.__ne__ = function(self, other){return ! DOMNode.__eq__(self, other)}

DOMNode.__next__ = function(self){
   self.$counter++
   if(self.$counter < self.elt.childNodes.length){
       return DOMNode.$factory(self.elt.childNodes[self.$counter])
   }
   throw _b_.StopIteration.$factory("StopIteration")
}

DOMNode.__radd__ = function(self, other){ // add to a string
    var res = TagSum.$factory()
    var txt = DOMNode.$factory(document.createTextNode(other))
    res.children = [txt, self]
    return res
}

DOMNode.__str__ = DOMNode.__repr__ = function(self){
    var proto = Object.getPrototypeOf(self.elt)
    if(proto){
        var name = proto.constructor.name
        if(name === undefined){ // IE
            var proto_str = proto.constructor.toString()
            name = proto_str.substring(8, proto_str.length - 1)
        }
        return "<" + name + " object>"
    }
    var res = "<DOMNode object type '"
    return res + $NodeTypes[self.elt.nodeType] + "' name '" +
        self.elt.nodeName + "'>"
}

DOMNode.__setattr__ = function(self, attr, value){
    // Sets the *property* attr of the underlying element (not its
    // *attribute*)

    if(attr.substr(0,2) == "on"){ // event
        if(!$B.$bool(value)){ // remove all callbacks attached to event
            DOMNode.unbind(self, attr.substr(2))
        }else{
            // value is a function taking an event as argument
            DOMNode.bind(self, attr.substr(2), value)
        }
    }else{
        switch(attr){
            case "left":
            case "top":
            case "width":
            case "height":
                if(_b_.isinstance(value, _b_.int) && self.elt.nodeType == 1){
                    self.elt.style[attr] = value + "px"
                    return _b_.None
                }else{
                    throw _b_.ValueError.$factory(attr + " value should be" +
                        " an integer, not " + $B.class_name(value))
                }
                break
        }
        if(DOMNode["set_" + attr] !== undefined) {
          return DOMNode["set_" + attr](self, value)
        }

        function warn(msg){
            console.log(msg)
            var frame = $B.last($B.frames_stack)
            if($B.debug > 0){
                var info = frame[1].$line_info.split(",")
                console.log("module", info[1], "line", info[0])
                if($B.$py_src.hasOwnProperty(info[1])){
                    var src = $B.$py_src[info[1]]
                    console.log(src.split("\n")[parseInt(info[0]) - 1])
                }
            }else{
                console.log("module", frame[2])
            }
        }

        // Warns if attr is a descriptor of the element's prototype
        // and it is not writable
        var proto = Object.getPrototypeOf(self.elt),
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
        if(self.elt.style && self.elt.style[attr] !== undefined){
            warn("Warning: '" + attr + "' is a property of element.style")
        }

        // Set the property
        self.elt[attr] = value

        return _b_.None
    }
}

DOMNode.__setitem__ = function(self, key, value){
    if(typeof key == "number"){
        self.elt.childNodes[key] = value
    }else if(typeof key == "string"){
        if(self.elt.attributes){
            if(self.elt instanceof SVGElement){
                self.elt.setAttributeNS(null, key, value)
            }else if(typeof self.elt.setAttribute == "function"){
                self.elt.setAttribute(key, value)
            }
        }
    }
}

DOMNode.abs_left = {
    __get__: function(self){
        return $getPosition(self.elt).left
    },
    __set__: function(){
        throw _b_.AttributeError.$factory("'DOMNode' objectattribute " +
            "'abs_left' is read-only")
    }
}

DOMNode.abs_top = {
    __get__: function(self){
        return $getPosition(self.elt).top
    },
    __set__: function(){
        throw _b_.AttributeError.$factory("'DOMNode' objectattribute " +
            "'abs_top' is read-only")
    }
}

DOMNode.bind = function(self, event){
    // bind functions to the event (event = "click", "mouseover" etc.)
    if(arguments.length == 2){
        // elt.bind(event) is a decorator for callback functions
        return (function(obj, evt){
            function f(callback){
                DOMNode.bind(obj, evt, callback)
                return callback
            }
            return f
        })(self, event)
    }

    for(var i = 2; i < arguments.length; i++){
        var func = arguments[i]
        var callback = (function(f){
            return function(ev){
                try{
                    return f($DOMEvent(ev))
                }catch(err){
                    if(err.__class__ !== undefined){
                        var msg = $B.$getattr(err, "info") +
                            "\n" + $B.class_name(err)
                        if(err.args){msg += ": " + err.args[0]}
                        try{$B.$getattr($B.stderr, "write")(msg)}
                        catch(err){console.log(msg)}
                    }else{
                        try{$B.$getattr($B.stderr, "write")(err)}
                        catch(err1){console.log(err)}
                    }
                }
            }}
        )(func)
        callback.$infos = func.$infos
        callback.$attrs = func.$attrs || {}
        callback.$func = func
        self.elt.addEventListener(event, callback, false)
        self.elt.$events = self.elt.$events || {}
        self.elt.$events[event] = self.elt.$events[event] || []
        self.elt.$events[event].push([func, callback])
    }
    return self
}

DOMNode.children = function(self){
    var res = [],
        elt = self.elt
    console.log(elt, elt.childNodes)
    if(elt.nodeType == 9){elt = elt.body}
    elt.childNodes.forEach(function(child){
        res.push(DOMNode.$factory(child))
    })
    return res
}

DOMNode.clear = function(self){
    // remove all children elements
    var elt = self.elt
    if(elt.nodeType == 9){elt = elt.body}
    while(elt.firstChild){
       elt.removeChild(elt.firstChild)
    }
}

DOMNode.Class = function(self){
    if(self.elt.className !== undefined){return self.elt.className}
    return _b_.None
}

DOMNode.class_name = function(self){return DOMNode.Class(self)}

DOMNode.clone = function(self){
    var res = DOMNode.$factory(self.elt.cloneNode(true))

    // bind events on clone to the same callbacks as self
    var events = self.elt.$events || {}
    for(var event in events){
        var evt_list = events[event]
        evt_list.forEach(function(evt){
            var func = evt[0]
            DOMNode.bind(res, event, func)
        })
    }
    return res
}

DOMNode.closest = function(self, tagName){
    // Returns the first parent of self with specified tagName
    // Raises KeyError if not found
    var res = self.elt,
        tagName = tagName.toLowerCase()
    while(res.tagName.toLowerCase() != tagName){
        res = res.parentNode
        if(res === undefined || res.tagName === undefined){
            throw _b_.KeyError.$factory("no parent of type " + tagName)
        }
    }
    return DOMNode.$factory(res)
}

DOMNode.events = function(self, event){
    self.elt.$events = self.elt.$events || {}
    var evt_list = self.elt.$events[event] = self.elt.$events[event] || [],
        callbacks = []
    evt_list.forEach(function(evt){
        callbacks.push(evt[1])
    })
    return callbacks
}

DOMNode.focus = function(self){
    return (function(obj){
        return function(){
            // focus() is not supported in IE
            setTimeout(function(){obj.focus()}, 10)
        }
    })(self.elt)
}

function make_list(node_list){
    var res = []
    for(var i = 0; i < node_list.length; i++){
        res.push(DOMNode.$factory(node_list[i]))
    }
    return res
}

DOMNode.get = function(self){
    // for document : doc.get(key1=value1[,key2=value2...]) returns a list of the elements
    // with specified keys/values
    // key can be 'id','name' or 'selector'
    var obj = self.elt,
        args = []
    for(var i = 1; i < arguments.length; i++){args.push(arguments[i])}
    var $ns = $B.args("get", 0, {}, [], args, {}, null, "kw"),
        $dict = {},
        items = _b_.list.$factory(_b_.dict.items($ns["kw"]))
    items.forEach(function(item){
        $dict[item[0]] = item[1]
    })
    if($dict["name"] !== undefined){
        if(obj.getElementsByName === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by name")
        }
        return make_list(obj.getElementsByName($dict['name']))
    }
    if($dict["tag"] !== undefined){
        if(obj.getElementsByTagName === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by tag name")
        }
        return make_list(obj.getElementsByTagName($dict["tag"]))
    }
    if($dict["classname"] !== undefined){
        if(obj.getElementsByClassName === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by class name")
        }
        return make_list(obj.getElementsByClassName($dict['classname']))
    }
    if($dict["id"] !== undefined){
        if(obj.getElementById === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by id")
        }
        var id_res = document.getElementById($dict['id'])
        if(! id_res){return []}
        return [DOMNode.$factory(id_res)]
    }
    if($dict["selector"] !== undefined){
        if(obj.querySelectorAll === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by selector")
        }
        return make_list(obj.querySelectorAll($dict['selector']))
    }
    return res
}

DOMNode.getContext = function(self){ // for CANVAS tag
    if(!("getContext" in self.elt)){
      throw _b_.AttributeError.$factory("object has no attribute 'getContext'")
    }
    var obj = self.elt
    return function(ctx){return JSObject.$factory(obj.getContext(ctx))}
}

DOMNode.getSelectionRange = function(self){ // for TEXTAREA
    if(self.elt["getSelectionRange"] !== undefined){
        return self.elt.getSelectionRange.apply(null, arguments)
    }
}

DOMNode.html = function(self){
    var res = self.elt.innerHTML
    if(res === undefined){
        if(self.elt.nodeType == 9){res = self.elt.body.innerHTML}
        else{res = _b_.None}
    }
    return res
}

DOMNode.id = function(self){
    if(self.elt.id !== undefined){return self.elt.id}
    return _b_.None
}

DOMNode.index = function(self, selector){
    var items
    if(selector === undefined){
        items = self.elt.parentElement.childNodes
    }else{
        items = self.elt.parentElement.querySelectorAll(selector)
    }
    var rank = -1
    for(var i = 0; i < items.length; i++){
        if(items[i] === self.elt){rank = i; break}
    }
    return rank
}

DOMNode.inside = function(self, other){
    // Test if a node is inside another node
    other = other.elt
    var elt = self.elt
    while(true){
        if(other === elt){return true}
        elt = elt.parentElement
        if(! elt){return false}
    }
}

DOMNode.options = function(self){ // for SELECT tag
    return new $OptionsClass(self.elt)
}

DOMNode.parent = function(self){
    if(self.elt.parentElement){
        return DOMNode.$factory(self.elt.parentElement)
    }
    return _b_.None
}

DOMNode.reset = function(self){ // for FORM
    return function(){self.elt.reset()}
}

DOMNode.select = function(self, selector){
    // alias for get(selector=...)
    if(self.elt.querySelectorAll === undefined){
        throw _b_.TypeError.$factory("DOMNode object doesn't support " +
            "selection by selector")
    }
    return make_list(self.elt.querySelectorAll(selector))
}

DOMNode.select_one = function(self, selector){
    // return the element matching selector, or None
    if(self.elt.querySelector === undefined){
        throw _b_.TypeError.$factory("DOMNode object doesn't support " +
            "selection by selector")
    }
    var res = self.elt.querySelector(selector)
    if(res === null) {
        return _b_.None
    }
    return DOMNode.$factory(res)
}

DOMNode.style = function(self){
    // set attribute "float" for cross-browser compatibility
    self.elt.style.float = self.elt.style.cssFloat || self.style.styleFloat
    return $B.JSObject.$factory(self.elt.style)
}

DOMNode.setSelectionRange = function(self){ // for TEXTAREA
    if(this["setSelectionRange"] !== undefined){
        return (function(obj){
            return function(){
                return obj.setSelectionRange.apply(obj, arguments)
            }})(this)
    }else if (this["createTextRange"] !== undefined){
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
    self.elt.setAttribute("class", arg)
}

DOMNode.set_html = function(self, value){
    var elt = self.elt
    if(elt.nodeType == 9){elt = elt.body}
    elt.innerHTML = _b_.str.$factory(value)
}

DOMNode.set_style = function(self, style){ // style is a dict
    if(!_b_.isinstance(style, _b_.dict)){
        throw _b_.TypeError.$factory("style must be dict, not " +
            $B.class_name(style))
    }
    var items = _b_.list.$factory(_b_.dict.items(style))
    for(var i = 0; i < items.length; i++){
        var key = items[i][0],
            value = items[i][1]
        if(key.toLowerCase() == "float"){
            self.elt.style.cssFloat = value
            self.elt.style.styleFloat = value
        }else{
            switch(key) {
                case "top":
                case "left":
                case "width":
                case "borderWidth":
                    if(_b_.isinstance(value,_b_.int)){value = value + "px"}
            }
            self.elt.style[key] = value
        }
    }
}

DOMNode.set_text = function(self,value){
    var elt = self.elt
    if(elt.nodeType == 9){elt = elt.body}
    elt.innerText = _b_.str.$factory(value)
    elt.textContent = _b_.str.$factory(value)
}

DOMNode.set_value = function(self, value){self.elt.value = _b_.str.$factory(value)}

DOMNode.submit = function(self){ // for FORM
    return function(){self.elt.submit()}
}

DOMNode.text = function(self){
    var elt = self.elt
    if(elt.nodeType == 9){elt = elt.body}
    var res = elt.innerText || elt.textContent
    if(res === null){
        res = _b_.None
    }
    return res
}

DOMNode.toString = function(self){
    if(self === undefined){return 'DOMNode'}
    return self.elt.nodeName
}

DOMNode.trigger = function (self, etype){
    // Artificially triggers the event type provided for this DOMNode
    if(self.elt.fireEvent){
      self.elt.fireEvent("on" + etype)
    }else{
      var evObj = document.createEvent("Events")
      evObj.initEvent(etype, true, false)
      self.elt.dispatchEvent(evObj)
    }
}

DOMNode.unbind = function(self, event){
    // unbind functions from the event (event = "click", "mouseover" etc.)
    // if no function is specified, remove all callback functions
    // If no event is specified, remove all callbacks for all events
    self.elt.$events = self.elt.$events || {}
    if(self.elt.$events === {}){return _b_.None}

    if(event === undefined){
        for(var event in self.elt.$events){
            DOMNode.unbind(self, event)
        }
        return _b_.None
    }

    if(self.elt.$events[event] === undefined ||
            self.elt.$events[event].length == 0){
        return _b_.None
    }

    var events = self.elt.$events[event]
    if(arguments.length == 2){
        // remove all callback functions
        for(var i = 0; i < events.length; i++){
            var callback = events[i][1]
            self.elt.removeEventListener(event, callback, false)
        }
        self.elt.$events[event] = []
        return _b_.None
    }

    for(var i = 2; i < arguments.length; i++){
        var callback = arguments[i],
            flag = false,
            func = callback.$func
        if(func === undefined){
            // If a callback is created by an assignment to an existing
            // function
            var found = false
            for(var j = 0; j < events.length; j++){
                if(events[j][0] === callback){
                    var func = callback,
                        found = true
                    break
                }
            }
            if(!found){
                throw _b_.TypeError.$factory("function is not an event callback")
            }
        }
        for(var j = 0; j < events.length; j++){
            if($B.$getattr(func, '__eq__')(events[j][0])){
                var callback = events[j][1]
                self.elt.removeEventListener(event, callback, false)
                events.splice(j, 1)
                flag = true
                break
            }
        }
        // The indicated func was not found, error is thrown
        if(!flag){
            throw _b_.KeyError.$factory('missing callback for event ' + event)
        }
    }
}

$B.set_func_names(DOMNode, "<dom>")

// return query string as an object with methods to access keys and values
// same interface as cgi.FieldStorage, with getvalue / getlist / getfirst
var Query = {
    __class__: _b_.type,
    $infos:{
        __name__: "query"
    }
}

Query.__contains__ = function(self, key){
    return self._keys.indexOf(key) > -1
}

Query.__getitem__ = function(self, key){
    // returns a single value or a list of values
    // associated with key, or raise KeyError
    var result = self._values[key]
    if(result === undefined){throw _b_.KeyError.$factory(key)}
    if(result.length == 1){return result[0]}
    return result
}

var Query_iterator = $B.$iterator_class("query string iterator")
Query.__iter__ = function(self){
    return $B.$iterator(self._keys, Query_iterator)
}

Query.__mro__ = [object]

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
    var result = self._values[key]
    if(result === undefined){return []}
    return result
}

Query.getvalue = function(self, key, _default){
    try{return Query.__getitem__(self, key)}
    catch(err){
        if(_default === undefined){return _b_.None}
        return _default
    }
}

Query.keys = function(self){return self._keys}

DOMNode.query = function(self){

    var res = {
        __class__: Query,
        _keys : [],
        _values : {}
    }
    var qs = location.search.substr(1).split('&')
    for(var i = 0; i < qs.length; i++){
        var pos = qs[i].search("="),
            elts = [qs[i].substr(0,pos),qs[i].substr(pos + 1)],
            key = decodeURIComponent(elts[0]),
            value = decodeURIComponent(elts[1])
        if(res._keys.indexOf(key) > -1){res._values[key].push(value)}
        else{
            res._keys.push(key)
            res._values[key] = [value]
        }
    }

    return res
}

// class used for tag sums
var TagSum = {
    __class__ : _b_.type,
    __mro__: [object],
    $infos: {
        __module__: "<pydom>",
        __name__: "TagSum"
    }
}

TagSum.appendChild = function(self, child){
    self.children.push(child)
}

TagSum.__add__ = function(self, other){
    if($B.get_class(other) === TagSum){
        self.children = self.children.concat(other.children)
    }else if(_b_.isinstance(other, [_b_.str, _b_.int, _b_.float,
                               _b_.dict, _b_.set, _b_.list])){
        self.children = self.children.concat(
            DOMNode.$factory(document.createTextNode(other)))
    }else{self.children.push(other)}
    return self
}

TagSum.__radd__ = function(self, other){
    var res = TagSum.$factory()
    res.children = self.children.concat(
        DOMNode.$factory(document.createTextNode(other)))
    return res
}

TagSum.__repr__ = function(self){
    var res = "<object TagSum> "
    for(var i = 0; i < self.children.length; i++){
        res += self.children[i]
        if(self.children[i].toString() == "[object Text]"){
            res += " [" + self.children[i].textContent + "]\n"
        }
    }
    return res
}

TagSum.__str__ = TagSum.toString = TagSum.__repr__

TagSum.clone = function(self){
    var res = TagSum.$factory()
    for(var i = 0; i < self.children.length; i++){
        res.children.push(self.children[i].cloneNode(true))
    }
    return res
}

TagSum.$factory = function(){
    return {
        __class__: TagSum,
        children: [],
        toString: function(){return "(TagSum)"}
    }
}

$B.set_func_names(TagSum, "<dom>")

$B.TagSum = TagSum // used in _html.js and _svg.js

var win = JSObject.$factory(_window) //{__class__:$WinDict}

win.get_postMessage = function(msg,targetOrigin){
    if(_b_.isinstance(msg, dict)){
        var temp = {__class__:"dict"},
            items = _b_.list.$factory(_b_.dict.items(msg))
        items.forEach(function(item){
            temp[item[0]] = item[1]
        })
        msg = temp
    }
    return _window.postMessage(msg, targetOrigin)
}

$B.DOMNode = DOMNode

$B.win = win
})(__BRYTHON__)
