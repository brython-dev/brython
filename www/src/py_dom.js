;(function($B){

//eval($B.InjectBuiltins())

var _b_ = $B.builtins,
    object = _b_.object,
    _window = self

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
        height = e.height || e.offsetHeight,
        scroll = document.scrollingElement.scrollTop

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

function trace(msg){
    var elt = document.getElementById("trace")
    if(elt){
        elt.innerText += msg
    }
}

function $mouseCoords(ev){
    if(ev.type.startsWith("touch")){
        var res = {}
        res.x = _b_.int.$factory(ev.touches[0].screenX)
        res.y = _b_.int.$factory(ev.touches[0].screenY)
        res.__getattr__ = function(attr){return this[attr]}
        res.__class__ = "MouseCoords"
        return res
    }
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

Attributes.__repr__ = Attributes.__str__ = function(self){
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
        if(err.__class__ === _b_.KeyError){
            return $.deflt
        }else{
            throw err
        }
    }
}

Attributes.$$keys = function(){
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

function dom2svg(svg_elt, coords){
    // Used to compute the mouse position relatively to the upper left corner
    // of an SVG element, based on the coordinates coords.x, coords.y that are
    // relative to the browser screen.
    var pt = svg_elt.createSVGPoint()
    pt.x = coords.x
    pt.y = coords.y
    return pt.matrixTransform(svg_elt.getScreenCTM().inverse())
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
            if(self.dataTransfer !== null){
                return Clipboard.$factory(self.dataTransfer)
            }
            return $B.$JS2Py(self['data'])
        case 'target':
            if(self.target !== undefined){
                return DOMNode.$factory(self.target)
            }
        case 'char':
            return String.fromCharCode(self.which)
        case 'svgX':
            if(self.target instanceof SVGSVGElement){
                return Math.floor(dom2svg(self.target, $mouseCoords(self)).x)
            }
            throw _b_.AttributeError.$factory("event target is not an SVG " +
                "element")
        case 'svgY':
            if(self.target instanceof SVGSVGElement){
                return Math.floor(dom2svg(self.target, $mouseCoords(self)).y)
            }
            throw _b_.AttributeError.$factory("event target is not an SVG " +
                "element")
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
                __name__: res.name,
                __qualname__: res.name
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

var Clipboard = {
    __class__: _b_.type,
    $infos: {
        __module__: "browser",
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
        __dict__: $B.empty_dict(),
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
        __module__: "browser",
        __name__: "DOMNode"
    }
}

DOMNode.$factory = function(elt, fromtag){
    if(elt.__class__ === DOMNode){
        return elt
    }
    if(typeof elt == "number" || typeof elt == "boolean" ||
            typeof elt == "string"){
        return elt
    }

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
    if(elt.__class__ === undefined && fromtag === undefined) {
        if(DOMNode.tags !== undefined) {  // tags is a python dictionary
            var tdict = DOMNode.tags.$string_dict
            if(tdict !== undefined && tdict.hasOwnProperty(elt.tagName)) {
                try{
                    var klass = tdict[elt.tagName][0]
                }catch(err){
                    console.log("tdict", tdict, "tag name", elt.tagName)
                    throw err
                }
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
    return elt
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
    if(self.nodeType == 9 && typeof key == "string"){
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
    if(!self.parentNode){
        throw _b_.ValueError.$factory("can't delete " + _b_.str.$factory(self))
    }
    self.parentNode.removeChild(self)
}

DOMNode.__delattr__ = function(self, attr){
    if(self[attr] === undefined){
        throw _b_.AttributeError.$factory(
            `cannot delete DOMNode attribute '${attr}'`)
    }
    delete self[attr]
    return _b_.None
}

DOMNode.__delitem__ = function(self, key){
    if(self.nodeType == 9){ // document : remove by id
        var res = self.getElementById(key)
        if(res){res.parentNode.removeChild(res)}
        else{throw _b_.KeyError.$factory(key)}
    }else{ // other node : remove by rank in child nodes
        self.parentNode.removeChild(self)
    }
}

DOMNode.__dir__ = function(self){
    var res = []
    // generic DOM attributes
    for(var attr in self){
        if(attr.charAt(0) != "$"){res.push(attr)}
    }
    res.sort()
    return res
}

DOMNode.__eq__ = function(self, other){
    return self == other
}

DOMNode.__getattribute__ = function(self, attr){
    if(attr.substr(0, 2) == "$$"){attr = attr.substr(2)}
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
            if(self.style[attr]){
                return parseInt(self.style[attr])
            }else{
                var computed = window.getComputedStyle(self).
                                      getPropertyValue(attr)
                if(computed !== undefined){
                    var prop = Math.floor(parseFloat(computed) + 0.5)
                    return isNaN(prop) ? computed : prop
                }
                throw _b_.AttributeError.$factory("style." + attr +
                    " is not set for " + _b_.str.$factory(self))
            }
        case "x":
        case "y":
            if(! (self instanceof SVGElement)){
                var pos = $getPosition(self)
                return attr == "x" ? pos.left : pos.top
            }
        case "clear":
        case "closest":
            return function(){
                return DOMNode[attr].call(null, self, ...arguments)
            }
        case "headers":
          if(self.nodeType == 9){
              // HTTP headers
              var req = new XMLHttpRequest();
              req.open("GET", document.location, false)
              req.send(null);
              var headers = req.getAllResponseHeaders()
              headers = headers.split("\r\n")
              var res = $B.empty_dict()
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
    if(attr == "select" && self.nodeType == 1 &&
            ["INPUT", "TEXTAREA"].indexOf(self.tagName.toUpperCase()) > -1){
        return function(selector){
            if(selector === undefined){self.select(); return _b_.None}
            return DOMNode.select(self, selector)
        }
    }
    if(attr == "query" && self.nodeType == 9){
        // document.query is a instance of class Query, representing the
        // Query String
        var res = {
            __class__: Query,
            _keys : [],
            _values : {}
        }
        var qs = location.search.substr(1).split('&')
        if(location.search != ""){
            for(var i = 0; i < qs.length; i++){
                var pos = qs[i].search("="),
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

    // Looking for property. If the attribute is in the forbidden
    // arena ... look for the aliased version
    var property = self[attr]

    if(property === undefined && $B.aliased_names[attr]){
        property = self["$$" + attr]
    }
    if(property !== undefined && self.__class__ &&
            self.__class__.__module__ != "browser.html"){
        // cf. issue #1543
        var from_class = $B.$getattr(self.__class__, attr, _b_.None)
        if(from_class !== _b_.None){
            var frame = $B.last($B.frames_stack),
                line_info = frame[1].$line_info,
                line = line_info.split(',')[0]
            console.info("Warning: line " + line + ", " + self.tagName +
                " element has instance attribute '" + attr + "' set." +
                " Attribute of class " + $B.class_name(self) +
                " is ignored.")
        }
    }

    if(property === undefined){
        // If custom element, search in the associated class
        if(self.tagName){
            var ce = customElements.get(self.tagName.toLowerCase())
            if(ce !== undefined && ce.$cls !== undefined){
                // Temporarily set self.__class_ to the WebComponent class
                var save_class = self.__class__
                self.__class__ = ce.$cls
                try{
                    var res = _b_.object.__getattribute__(self, attr)
                    self.__class__ = save_class
                    return res
                }catch(err){
                    self.__class__ = save_class
                    if(! $B.is_exc(err, [_b_.AttributeError])){
                        throw err
                    }
                }
            }
        }
        return object.__getattribute__(self, attr)
    }

    var res = property

    if(res !== undefined){
        if(res === null){return _b_.None}
        if(typeof res === "function"){
            // If elt[attr] is a function, it is converted in another function
            // that produces a Python error message in case of failure.
            var func = (function(f, elt){
                return function(){
                    var args = [], pos = 0
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
                            if(arg.$cache){
                                var f1 = arg.$cache
                            }else{
                                var f1 = function(dest_fn){
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
                            args[pos++] = f1
                        }else if(_b_.isinstance(arg, DOMNode)){
                            args[pos++] = arg
                        }else if(arg === _b_.None){
                            args[pos++] = null
                        }else if(arg.__class__ == _b_.dict){
                            args[pos++] = _b_.dict.$to_obj(arg)
                        }else{
                            args[pos++] = arg
                        }
                    }
                    var result = f.apply(elt, args)
                    return $B.$JS2Py(result)
                }
            })(res, self)
            func.$infos = {__name__ : attr, __qualname__: attr}
            func.$is_func = true
            return func
        }
        if(attr == 'options'){return Options.$factory(self)}
        if(attr == 'style'){return $B.JSObj.$factory(self[attr])}
        if(Array.isArray(res)){return res} // issue #619
        return $B.$JS2Py(res)
    }
    return object.__getattribute__(self, attr)
}

DOMNode.__getitem__ = function(self, key){
    if(self.nodeType == 9){ // Document
        if(typeof key == "string"){
            var res = self.getElementById(key)
            if(res){return DOMNode.$factory(res)}
            throw _b_.KeyError.$factory(key)
        }else{
            try{
                var elts = self.getElementsByTagName(key.$infos.__name__),
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
            typeof self.item == "function"){
                var key_to_int = _b_.int.$factory(key)
                if(key_to_int < 0){key_to_int += self.length}
                var res = DOMNode.$factory(self.item(key_to_int))
                if(res === undefined){throw _b_.KeyError.$factory(key)}
                return res
        }else if(typeof key == "string" &&
                 self.attributes &&
                 typeof self.attributes.getNamedItem == "function"){
             var attr = self.attributes.getNamedItem(key)
             if(!!attr){return attr.value}
             throw _b_.KeyError.$factory(key)
        }
    }
}

DOMNode.__hash__ = function(self){
    return self.__hashvalue__ === undefined ?
        (self.__hashvalue__ = $B.$py_next_hash--) :
        self.__hashvalue__
}

DOMNode.__iter__ = function(self){
    // iteration on a Node
    if(self.length !== undefined && typeof self.item == "function"){
        var items = []
        for(var i = 0, len = self.length; i < len; i++){
            items.push(DOMNode.$factory(self.item(i)))
        }
    }else if(self.childNodes !== undefined){
        var items = []
        for(var i = 0, len = self.childNodes.length; i < len; i++){
            items.push(DOMNode.$factory(self.childNodes[i]))
        }
    }
    return $B.$iter(items)
}

DOMNode.__le__ = function(self, other){
    // for document, append child to document.body
    if(self.nodeType == 9){self = self.body}
    if(_b_.isinstance(other, TagSum)){
        for(var i = 0; i < other.children.length; i++){
            self.appendChild(other.children[i])
        }
    }else if(typeof other == "string" || typeof other == "number"){
        var $txt = document.createTextNode(other.toString())
        self.appendChild($txt)
    }else if(_b_.isinstance(other, DOMNode)){
        // other is a DOMNode instance
        self.appendChild(other)
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
    return self // to allow chained appends
}

DOMNode.__len__ = function(self){return self.length}

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
   if(self.$counter < self.childNodes.length){
       return DOMNode.$factory(self.childNodes[self.$counter])
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
    var attrs = self.attributes,
        attrs_str = "",
        items = []
    if(attrs !== undefined){
        var items = []
        for(var i = 0; i < attrs.length; i++){
            items.push(attrs[i].name + '="' +
                self.getAttributeNS(null, attrs[i].name) + '"')
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

DOMNode.__setattr__ = function(self, attr, value){
    // Sets the *property* attr of the underlying element (not its
    // *attribute*)

    if(attr.substr(0,2) == "on" && attr.length > 2){ // event
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
                if(_b_.isinstance(value, _b_.int) && self.nodeType == 1){
                    self.style[attr] = value + "px"
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
        if(self.style && self.style[attr] !== undefined){
            warn("Warning: '" + attr + "' is a property of element.style")
        }

        // Set the property
        self[attr] = value

        return _b_.None
    }
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
    __set__: function(){
        throw _b_.AttributeError.$factory("'DOMNode' objectattribute " +
            "'abs_left' is read-only")
    }
}

DOMNode.abs_top = {
    __get__: function(self){
        return $getPosition(self).top
    },
    __set__: function(){
        throw _b_.AttributeError.$factory("'DOMNode' objectattribute " +
            "'abs_top' is read-only")
    }
}

DOMNode.attach = DOMNode.__le__ // For allergics to syntax elt <= child

DOMNode.bind = function(self, event){
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
                return f($DOMEvent(ev))
            }catch(err){
                if(err.__class__ !== undefined){
                    $B.handle_error(err)
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
    if(typeof options == "boolean"){
        self.addEventListener(event, callback, options)
    }else if(options.__class__ === _b_.dict){
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
    if(self.nodeType == 9){self = self.body}
    for(var child of self.children){
        res.push(DOMNode.$factory(child))
    }
    return res
}


DOMNode.child_nodes = function(self){
    var res = []
    if(self.nodeType == 9){self = self.body}
    for(child of self.childNodes){
        res.push(DOMNode.$factory(child))
    }
    return res
}

DOMNode.clear = function(self){
    // remove all children elements
    var $ = $B.args("clear", 1, {self: null}, ["self"], arguments, {},
                null, null)
    if(self.nodeType == 9){self = self.body}
    while(self.firstChild){
       self.removeChild(self.firstChild)
    }
}

DOMNode.Class = function(self){
    if(self.className !== undefined){return self.className}
    return _b_.None
}

DOMNode.class_name = function(self){return DOMNode.Class(self)}

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

DOMNode.closest = function(self, selector){
    // Returns the first parent of self with specified CSS selector
    // Raises KeyError if not found
    var $ = $B.args("closest", 2, {self: null, selector: null},
                ["self", "selector"], arguments, {}, null, null)
    var res = self.closest(selector)
    if(res === null){
        throw _b_.KeyError.$factory("no parent with selector " + selector)
    }
    return DOMNode.$factory(res)
}

DOMNode.events = function(self, event){
    self.$events = self.$events || {}
    var evt_list = self.$events[event] = self.$events[event] || [],
        callbacks = []
    evt_list.forEach(function(evt){
        callbacks.push(evt[1])
    })
    return callbacks
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
    var args = []
    for(var i = 1; i < arguments.length; i++){args.push(arguments[i])}
    var $ns = $B.args("get", 0, {}, [], args, {}, null, "kw"),
        $dict = {},
        items = _b_.list.$factory(_b_.dict.items($ns["kw"]))
    items.forEach(function(item){
        $dict[item[0]] = item[1]
    })

    if($dict["name"] !== undefined){
        if(self.getElementsByName === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by name")
        }
        return make_list(self.getElementsByName($dict['name']))
    }
    if($dict["tag"] !== undefined){
        if(self.getElementsByTagName === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by tag name")
        }
        return make_list(self.getElementsByTagName($dict["tag"]))
    }
    if($dict["classname"] !== undefined){
        if(self.getElementsByClassName === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by class name")
        }
        return make_list(self.getElementsByClassName($dict['classname']))
    }
    if($dict["id"] !== undefined){
        if(self.getElementById === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by id")
        }
        var id_res = document.getElementById($dict['id'])
        if(! id_res){return []}
        return [DOMNode.$factory(id_res)]
    }
    if($dict["selector"] !== undefined){
        if(self.querySelectorAll === undefined){
            throw _b_.TypeError.$factory("DOMNode object doesn't support " +
                "selection by selector")
        }
        return make_list(self.querySelectorAll($dict['selector']))
    }
    return res
}

DOMNode.getContext = function(self){ // for CANVAS tag
    if(!("getContext" in self)){
      throw _b_.AttributeError.$factory("object has no attribute 'getContext'")
    }
    return function(ctx){
        return $B.JSObj.$factory(self.getContext(ctx))
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
        if(self.nodeType == 9){res = self.body.innerHTML}
        else{res = _b_.None}
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

DOMNode.options = function(self){ // for SELECT tag
    return new $OptionsClass(self)
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
    __set__: function(){
        throw _b_.AttributeError.$factory("'DOMNode' objectattribute " +
            "'scrolled_left' is read-only")
    }
}

DOMNode.scrolled_top = {
    __get__: function(self){
        return $getPosition(self).top -
            document.scrollingElement.scrollTop
    },
    __set__: function(){
        throw _b_.AttributeError.$factory("'DOMNode' objectattribute " +
            "'scrolled_top' is read-only")
    }
}

DOMNode.select = function(self, selector){
    // alias for get(selector=...)
    if(self.querySelectorAll === undefined){
        throw _b_.TypeError.$factory("DOMNode object doesn't support " +
            "selection by selector")
    }
    return make_list(self.querySelectorAll(selector))
}

DOMNode.select_one = function(self, selector){
    // return the element matching selector, or None
    if(self.querySelector === undefined){
        throw _b_.TypeError.$factory("DOMNode object doesn't support " +
            "selection by selector")
    }
    var res = self.querySelector(selector)
    if(res === null) {
        return _b_.None
    }
    return DOMNode.$factory(res)
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
    self.setAttribute("class", arg)
}

DOMNode.set_html = function(self, value){
    if(self.nodeType == 9){self = self.body}
    self.innerHTML = _b_.str.$factory(value)
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
            self.style.cssFloat = value
            self.style.styleFloat = value
        }else{
            switch(key) {
                case "top":
                case "left":
                case "width":
                case "height":
                case "borderWidth":
                    if(_b_.isinstance(value,_b_.int)){value = value + "px"}
            }
            self.style[key] = value
        }
    }
}

DOMNode.set_text = function(self,value){
    if(self.nodeType == 9){self = self.body}
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
    if(self.nodeType == 9){self = self.body}
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
    self.$events = self.$events || {}
    if(self.$events === {}){return _b_.None}

    if(event === undefined){
        for(var event in self.$events){
            DOMNode.unbind(self, event)
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
        for(var i = 0; i < events.length; i++){
            var callback = events[i][1]
            self.removeEventListener(event, callback, false)
        }
        self.$events[event] = []
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
                self.removeEventListener(event, callback, false)
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

$B.set_func_names(DOMNode, "browser")

// return query string as an object with methods to access keys and values
// same interface as cgi.FieldStorage, with getvalue / getlist / getfirst
var Query = {
    __class__: _b_.type,
    __mro__: [_b_.object],
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
    if(result === undefined){
        throw _b_.KeyError.$factory(key)
    }else if(result.length == 1){
        return result[0]
    }
    return result
}

var Query_iterator = $B.make_iterator_class("query string iterator")
Query.__iter__ = function(self){
    return Query_iterator.$factory(self._keys)
}

Query.__setitem__ = function(self, key, value){
    self._values[key] = [value]
    return _b_.None
}

Query.__str__ = Query.__repr__ = function(self){
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

Query.keys = function(self){
    return self._keys
}

$B.set_func_names(Query, "<dom>")

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

var win = $B.JSObj.$factory(_window)

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
