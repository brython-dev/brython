;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict
var JSObject = $B.JSObject
var _window = window //self;

// Maps $brython_id of DOM elements to events
$B.events = _b_.dict()

// cross-browser utility functions
function $getMouseOffset(target, ev){
    ev = ev || _window.event;
    var docPos    = $getPosition(target);
    var mousePos  = $mouseCoords(ev);
    return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

function $getPosition(e){
    var left = 0;
    var top  = 0;
    var width = e.width || e.offsetWidth;
    var height = e.height || e.offsetHeight;

    while (e.offsetParent){
        left += e.offsetLeft;
        top  += e.offsetTop;
        e     = e.offsetParent;
    }

    left += e.offsetLeft;
    top  += e.offsetTop;

    return {left:left, top:top, width:width, height:height};
}

function $mouseCoords(ev){
    var posx = 0;
    var posy = 0;
    if (!ev) var ev = _window.event;
    if (ev.pageX || ev.pageY){
        posx = ev.pageX;
        posy = ev.pageY;
    } else if (ev.clientX || ev.clientY){
        posx = ev.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = ev.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    var res = {}
    res.x = _b_.int(posx)
    res.y = _b_.int(posy)
    res.__getattr__ = function(attr){return this[attr]}
    res.__class__ = "MouseCoords"
    return res
}

var $DOMNodeAttrs = ['nodeName','nodeValue','nodeType','parentNode',
    'childNodes','firstChild','lastChild','previousSibling','nextSibling',
    'attributes','ownerDocument']

$B.$isNode = function(o){
    // copied from http://stackoverflow.com/questions/384286/
    // javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  return (
    typeof Node === "object" ? o instanceof Node :
    o && typeof o === "object" && typeof o.nodeType === "number" &&
    typeof o.nodeName==="string"
  );
}

$B.$isNodeList = function(nodes) {
    // copied from http://stackoverflow.com/questions/7238177/
    // detect-htmlcollection-nodelist-in-javascript
    try{
        var result = Object.prototype.toString.call(nodes);
        var re = new RegExp("^\\[object (HTMLCollection|NodeList)\\]$")
        return (typeof nodes === 'object'
            && re.exec(result)!==null
            && nodes.length!==undefined
            && (nodes.length == 0 ||
                (typeof nodes[0] === "object" && nodes[0].nodeType > 0))
        )
    }catch(err){
        return false
    }
}

var $DOMEventAttrs_W3C = ['NONE','CAPTURING_PHASE','AT_TARGET','BUBBLING_PHASE',
    'type','target','currentTarget','eventPhase','bubbles','cancelable','timeStamp',
    'stopPropagation','preventDefault','initEvent']

var $DOMEventAttrs_IE = ['altKey','altLeft','button','cancelBubble',
    'clientX','clientY','contentOverflow','ctrlKey','ctrlLeft','data',
    'dataFld','dataTransfer','fromElement','keyCode','nextPage',
    'offsetX','offsetY','origin','propertyName','reason','recordset',
    'repeat','screenX','screenY','shiftKey','shiftLeft',
    'source','srcElement','srcFilter','srcUrn','toElement','type',
    'url','wheelDelta','x','y']

$B.$isEvent = function(obj){
    var flag = true
    for(var i=0;i<$DOMEventAttrs_W3C.length;i++){
        if(obj[$DOMEventAttrs_W3C[i]]===undefined){flag=false;break}
    }
    if(flag) return true
    for(var i=0;i<$DOMEventAttrs_IE.length;i++){
        if(obj[$DOMEventAttrs_IE[i]]===undefined) return false
    }
    return true
}

// DOM node types
var $NodeTypes = {1:"ELEMENT",
    2:"ATTRIBUTE",
    3:"TEXT",
    4:"CDATA_SECTION",
    5:"ENTITY_REFERENCE",
    6:"ENTITY",
    7:"PROCESSING_INSTRUCTION",
    8:"COMMENT",
    9:"DOCUMENT",
    10:"DOCUMENT_TYPE",
    11:"DOCUMENT_FRAGMENT",
    12:"NOTATION"
}

var $DOMEventDict = {__class__:$B.$type,__name__:'DOMEvent'}

$DOMEventDict.__mro__ = [$ObjectDict]

$DOMEventDict.__getattribute__ = function(self,attr){
    switch(attr) {
      case 'x':
        return $mouseCoords(self).x
      case 'y':
        return $mouseCoords(self).y
      case 'data':
        if(self.dataTransfer!==undefined) return $Clipboard(self.dataTransfer)
        return self['data']
      case 'target':
        if(self.target===undefined) return DOMNode(self.target)
        return DOMNode(self.target)
      case 'char':
        return String.fromCharCode(self.which)
    }

    var res =  self[attr]
    if(res!==undefined){
        if(typeof res=='function'){
            var func = function(){return res.apply(self,arguments)}
            func.$infos = {__name__:res.toString().substr(9, res.toString().search('{'))}
            return func
        }
        return $B.$JS2Py(res)
    }
    throw _b_.AttributeError("object DOMEvent has no attribute '"+attr+"'")
}


// Function to transform a DOM event into an instance of DOMEvent
function $DOMEvent(ev){
    ev.__class__ = $DOMEventDict
    if(ev.preventDefault===undefined){ev.preventDefault = function(){ev.returnValue=false}}
    if(ev.stopPropagation===undefined){ev.stopPropagation = function(){ev.cancelBubble=true}}
    ev.__repr__ = function(){return '<DOMEvent object>'}
    ev.toString = ev.__str__ = ev.__repr__
    return ev
}

$B.$DOMEvent = $DOMEvent

$B.DOMEvent = function(evt_name){
    // Factory to create instances of DOMEvent, based on an event name
    return $DOMEvent(new Event(evt_name))
}

$B.DOMEvent.__class__ = $B.$factory
$B.DOMEvent.$dict = $DOMEventDict
$DOMEventDict.$factory = $B.DOMEvent

var $ClipboardDict = {__class__:$B.$type,__name__:'Clipboard'}

$ClipboardDict.__getitem__=function(self,name){return self.data.getData(name)}

$ClipboardDict.__mro__ = [$ObjectDict]

$ClipboardDict.__setitem__=function(self,name,value){self.data.setData(name,value)}

function $Clipboard(data){ // drag and drop dataTransfer
    return {
        data : data,
        __class__ : $ClipboardDict,
    }
}

function $EventsList(elt,evt,arg){
    // handles a list of callback fuctions for the event evt of element elt
    // method .remove(callback) removes the callback from the list, and
    // removes the event listener
    this.elt = elt
    this.evt = evt
    if(isintance(arg,list)){this.callbacks = arg}
    else{this.callbacks = [arg]}
    this.remove = function(callback){
        var found = false
        for(var i=0;i<this.callbacks.length;i++){
            if(this.callbacks[i]===callback){
                found = true
                this.callback.splice(i,1)
                this.elt.removeEventListener(this.evt,callback,false)
                break
            }
        }
        if(!found){throw KeyError("not found")}
    }
}

function $OpenFile(file,mode,encoding){
    this.reader = new FileReader()
    if(mode==='r'){this.reader.readAsText(file,encoding)}
    else if(mode==='rb'){this.reader.readAsBinaryString(file)}

    this.file = file
    this.__class__ = dom.FileReader
    this.__getattr__ = function(attr){
        if(this['get_'+attr]!==undefined) return this['get_'+attr]
        return this.reader[attr]
    }
    this.__setattr__ = (function(obj){
        return function(attr,value){
            if(attr.substr(0,2)=='on'){ // event
                var callback = function(ev){return value($DOMEvent(ev))}
                obj.addEventListener(attr.substr(2),callback)
            }else if('set_'+attr in obj){return obj['set_'+attr](value)}
            else if(attr in obj){obj[attr]=value}
            else{setattr(obj,attr,value)}
        }
    })(this.reader)
}


var dom = { File : function(){},
    FileReader : function(){}
    }
dom.File.__class__ = $B.$type
dom.File.__str__ = function(){return "<class 'File'>"}
dom.FileReader.__class__ = $B.$type
dom.FileReader.__str__ = function(){return "<class 'FileReader'>"}

function $Options(parent){
    return {
        __class__:$OptionsDict,
        parent:parent
    }
}
var $OptionsDict = {__class__:$B.$type,__name__:'Options'}

$OptionsDict.__delitem__ = function(self,arg){
    self.parent.options.remove(arg.elt)
}

$OptionsDict.__getitem__ = function(self,key){
    return DOMNode(self.parent.options[key])
}

$OptionsDict.__len__ = function(self) {return self.parent.options.length}

$OptionsDict.__mro__ = [$ObjectDict]

$OptionsDict.__setattr__ = function(self,attr,value){
    self.parent.options[attr]=value
}

$OptionsDict.__setitem__ = function(self,attr,value){
    self.parent.options[attr]= $B.$JS2Py(value)
}

$OptionsDict.__str__ = function(self){
    return "<object Options wraps "+self.parent.options+">"
}

$OptionsDict.append = function(self,element){
    self.parent.options.add(element.elt)
}

$OptionsDict.insert = function(self,index,element){
    if(index===undefined){self.parent.options.add(element.elt)}
    else{self.parent.options.add(element.elt,index)}
}

$OptionsDict.item = function(self,index){
    return self.parent.options.item(index)
}

$OptionsDict.namedItem = function(self,name){
    return self.parent.options.namedItem(name)
}

$OptionsDict.remove = function(self,arg){self.parent.options.remove(arg.elt)}

//$OptionsDict.toString = $OptionsDict.__str__

var $StyleDict = {__class__:$B.$type,__name__:'CSSProperty'}

$StyleDict.__mro__ = [$ObjectDict]

$StyleDict.__getattr__ = function(self,attr){
    return $ObjectDict.__getattribute__(self.js,attr)
}

$StyleDict.__setattr__ = function(self,attr,value){
    if(attr.toLowerCase()==='float'){
        self.js.cssFloat = value
        self.js.styleFloat = value
    }else{
        switch(attr) {
          case 'top':
          case 'left':
          case 'height':
          case 'width':
          case 'borderWidth':
            if (isinstance(value,_b_.int)) value = value+'px'
        }
        self.js[attr] = value
    }
}

function $Style(style){
    // property "style"
    return {__class__:$StyleDict,js:style}
}
$Style.__class__ = $B.$factory
$Style.$dict = $StyleDict
$StyleDict.$factory = $Style

var DOMNode = $B.DOMNode = function(elt, fromtag){
    if(elt.__class__===DOMNodeDict){return elt}
    if(typeof elt=="number" || typeof elt=="boolean" ||
        typeof elt=="string"){return elt}

    // if none of the above, fromtag determines if the call is made by
    // the tag factory or by any other call to DOMNode
    // if made by tag factory (fromtag will be defined, the value is not
    // important), the regular plain old behavior is retained. Only the
    // return value of a DOMNode is sought

    // In other cases (fromtag is undefined), DOMNode tries to return a "tag"
    // from the browser.html module by looking into "$tags" which is set
    // by the  browser.html module itself (external sources could override
    // it) and piggybacks on the tag factory by adding an "elt_wrap"
    // attribute to the factory to let it know, that special behavior
    // is needed. i.e: don't create the element, use the one provided
    if(fromtag === undefined) {
        if(DOMNodeDict.tags !== undefined) {  // tags is a python dictionary
            var tdict = DOMNodeDict.tags.$string_dict
            if(tdict !== undefined) {
                var factory = tdict[elt.tagName]
                if(factory !== undefined) {
                    // all checks are good
                    factory.$dict.$elt_wrap = elt  // tell factory to wrap element
                    return factory()  // and return what the factory wants
                }
            }
        }
        // all "else" ... default to old behavior of plain DOMNode wrapping
    }

    // returns the element, enriched with an attribute $brython_id for
    // equality testing and with all the attributes of Node
    var res = {}
    res.$dict = {} // used in getattr
    res.elt = elt // DOM element
    if(elt['$brython_id']===undefined||elt.nodeType===9){
        // add a unique id for comparisons
        elt.$brython_id='DOM-'+$B.UUID()
    }
    res.__class__ = DOMNodeDict
    return res
}

DOMNodeDict = {__class__ : $B.$type,
    __name__ : 'DOMNode'
}
DOMNode.__class__ = $B.$factory
DOMNode.$dict = DOMNodeDict // for isinstance
DOMNodeDict.$factory = DOMNode

DOMNodeDict.__mro__ = [_b_.object.$dict]


DOMNodeDict.__add__ = function(self,other){
    // adding another element to self returns an instance of $TagSum
    var res = $TagSum()
    res.children = [self], pos=1
    if(isinstance(other,$TagSum)){
        res.children = res.children.concat(other.children)
    } else if(isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.list,
                                _b_.dict,_b_.set,_b_.tuple])){
        res.children[pos++]=DOMNode(document.createTextNode(_b_.str(other)))
    }else if(isinstance(other, DOMNode)){
        res.children[pos++] = other
    }else{
        // If other is iterable, add all items
        try{res.children=res.children.concat(_b_.list(other))}
        catch(err){throw _b_.TypeError("can't add '"+
            $B.get_class(other).__name__+"' object to DOMNode instance")
        }
    }
    return res
}

DOMNodeDict.__bool__ = function(self){return true}

DOMNodeDict.__class__ = $B.$type

DOMNodeDict.__contains__ = function(self,key){
    // For document, if key is a string, "key in document" tells if an element
    // with id "key" is in the document
    if(self.elt.nodeType==9 && typeof key=="string"){
        return document.getElementById(key)!==null
    }
    key = key.elt !==undefined ? key.elt : key
    if(self.elt.length!==undefined && typeof self.elt.item == "function"){
        for(var i=0,len=self.elt.length;i<len;i++){
            if(self.elt.item(i)===key){return true}
        }
    }
    return false
}

DOMNodeDict.__del__ = function(self){
    // if element has a parent, calling __del__ removes object
    // from the parent's children
    if(!self.elt.parentNode){
        throw _b_.ValueError("can't delete "+str(self.elt))
    }
    self.elt.parentNode.removeChild(self.elt)
}

DOMNodeDict.__delitem__ = function(self,key){
    if(self.elt.nodeType===9){ // document : remove by id
        var res = self.elt.getElementById(key)
        if(res){res.parentNode.removeChild(res)}
        else{throw KeyError(key)}
    }else{ // other node : remove by rank in child nodes
        self.elt.parentNode.removeChild(self.elt)
    }
}

DOMNodeDict.__dir__ = function(self){
    var res = []
    // generic DOM attributes
    for(var attr in self.elt){
        if(attr.charAt(0)!='$'){res.push(attr)}
    }
    // Brython-specific attributes
    for(var attr in DOMNodeDict){
        if(attr.charAt(0)!='$' && res.indexOf(attr)==-1){res.push(attr)}
    }
    return res
}

DOMNodeDict.__eq__ = function(self, other){
    return self.elt==other.elt
}

DOMNodeDict.__getattribute__ = function(self,attr){

    if(attr.substr(0,2)=='$$'){attr = attr.substr(2)}
    switch(attr) {
      case 'class_name':
      case 'html':
      case 'id':
      case 'parent':
      case 'query':
      case 'text':
        return DOMNodeDict[attr](self)

      case 'height':
      case 'left':
      case 'top':
      case 'width':
        if(self.elt instanceof SVGElement){
            return self.elt.getAttributeNS(null, attr)
        }
        return DOMNodeDict[attr].__get__(self)
      case 'clear':
      case 'closest':
        return function(){return DOMNodeDict[attr](self,arguments[0])}
      case 'headers':
        if(self.elt.nodeType==9){
          // HTTP headers
          var req = new XMLHttpRequest();
          req.open('GET', document.location, false);
          req.send(null);
          var headers = req.getAllResponseHeaders();
          headers = headers.split('\r\n')
          var res = _b_.dict()
          for(var i=0;i<headers.length;i++){
              var header = headers[i]
              if(header.strip().length==0){continue}
              var pos = header.search(':')
              res.__setitem__(header.substr(0,pos),header.substr(pos+1).lstrip())
          }
          return res;
        }
        break
      case '$$location':
        attr='location'
        break
    }//switch

    if(self.elt.getAttribute!==undefined){
        res = self.elt.getAttribute(attr)
        // IE returns the properties of a DOMNode (eg parentElement)
        // as "attribute", so we must check that this[attr] is not
        // defined
        if(res!==undefined && res!==null && self.elt[attr]===undefined){
            // now we're sure it's an attribute
            return res
        }
    }

    if(self.elt.getAttributeNS!==undefined){
        res = self.elt.getAttributeNS(null, attr)
        // If attribute is not set, modern browsers return undefined or null
        // but old versions of Android browser return the empty string !!!
        if(res!==undefined && res!==null && res!="" &&
            self.elt[attr]===undefined){
            // now we're sure it's an attribute
            return res
        }
    }

    var res = self.elt[attr]

    if(res!==undefined){
        if(res===null){return _b_.None}
        if(typeof res==="function"){
            var func = (function(f,elt){
                return function(){
                    var args = [], pos=0
                    for(var i=0;i<arguments.length;i++){
                        var arg=arguments[i]
                        if(typeof arg=="function"){
                            var f1 = (function(x){
                                return function(){
                                    try{return x.apply(null, arguments)}
                                    catch(err){
                                        console.log(x, typeof x, err)
                                        if(err.__class__!==undefined){
                                            var msg = _b_.getattr(err, 'info')+
                                                '\n'+err.__class__.__name__
                                            if(err.args){msg += ': '+err.args[0]}
                                            try{getattr($B.stderr,"write")(msg)}
                                            catch(err){console.log(msg)}
                                        }else{
                                            try{getattr($B.stderr,"write")(err)}
                                            catch(err1){console.log(err)}
                                        }
                                        throw err
                                    }
                                }
                            })(arg)
                            args[pos++] = f1
                        }
                        else if(isinstance(arg,JSObject)){
                            args[pos++]=arg.js
                        }else if(isinstance(arg,DOMNode)){
                            args[pos++]=arg.elt
                        }else if(arg===_b_.None){
                            args[pos++]=null
                        }else{
                            args[pos++]=arg
                        }
                    }
                    var result = f.apply(elt,args)
                    return $B.$JS2Py(result)
                }
            })(res,self.elt)
            func.$infos = {__name__ : attr}
            func.$is_func = true
            return func
        }
        if(attr=='options') return $Options(self.elt)
        if(attr=='style') return $Style(self.elt[attr])
        if(Array.isArray(res)){return res} // issue #619

        return $B.$JS2Py(res)
    }
    return $ObjectDict.__getattribute__(self,attr)
}

DOMNodeDict.__getitem__ = function(self, key){
    if(self.elt.nodeType===9){ // Document
        if(typeof key==="string"){
            var res = self.elt.getElementById(key)
            if(res) return DOMNode(res)
            throw KeyError(key)
        }else{
            try{
                var elts=self.elt.getElementsByTagName(key.$dict.__name__),res=[],pos=0
                for(var $i=0;$i<elts.length;$i++) res[pos++]=DOMNode(elts[$i])
                return res
            }catch(err){
                throw KeyError(str(key))
            }
        }
    }else{
        if(typeof self.elt.length=='number'){
            if((typeof key=="number" || typeof key=="boolean") &&
                typeof self.elt.item=='function'){
                    var key_to_int = _b_.int(key)
                    if(key_to_int<0){key_to_int+=self.elt.length}
                    var res = DOMNode(self.elt.item(key_to_int))
                    if(res===undefined){throw _b_.KeyError(key)}
                    return res
            }else if(typeof key=="string" &&
                typeof self.elt.getNamedItem=='function'){
                 var res = DOMNode(self.elt.getNamedItem(key))
                 if(res===undefined){throw _b_.keyError(key)}
                 return res
            }
        }
        throw _b_.TypeError('DOMNode object is not subscriptable')
    }
}

DOMNodeDict.__iter__ = function(self){
    // iteration on a Node
    if(self.elt.length!==undefined && typeof self.elt.item=="function"){
        var items = []
        for(var i=0, len=self.elt.length; i<len; i++){
            items.push(DOMNode(self.elt.item(i)))
        }
    }else if(self.elt.childNodes!==undefined){
        var items = []
        for(var i=0, len=self.elt.childNodes.length; i<len; i++){
            items.push(DOMNode(self.elt.childNodes[i]))
        }
    }
    return $B.$iter(items)
}

DOMNodeDict.__le__ = function(self,other){
    // for document, append child to document.body
    var elt = self.elt
    if(self.elt.nodeType===9){elt = self.elt.body}
    if(isinstance(other,$TagSum)){
        var $i=0
        for($i=0;$i<other.children.length;$i++){
            elt.appendChild(other.children[$i].elt)
        }
    }else if(typeof other==="string" || typeof other==="number"){
        var $txt = document.createTextNode(other.toString())
        elt.appendChild($txt)
    }else if(isinstance(other, DOMNode)){
        // other is a DOMNode instance
        elt.appendChild(other.elt)
    }else{
        try{
            // If other is an iterable, add the items
            var items = _b_.list(other)
            for(var i=0; i<items.length; i++){
                DOMNodeDict.__le__(self, items[i])
            }
        }catch(err){
            throw _b_.TypeError("can't add '"+
                $B.get_class(other).__name__+
                "' object to DOMNode instance")
        }
    }
}

DOMNodeDict.__len__ = function(self){return self.elt.length}

DOMNodeDict.__mul__ = function(self,other){
    if(isinstance(other,_b_.int) && other.valueOf()>0){
        var res = $TagSum()
        var pos=res.children.length
        for(var i=0;i<other.valueOf();i++){
            res.children[pos++]= DOMNodeDict.clone(self)()
        }
        return res
    }
    throw _b_.ValueError("can't multiply "+self.__class__+"by "+other)
}

DOMNodeDict.__ne__ = function(self,other){return !DOMNodeDict.__eq__(self,other)}

DOMNodeDict.__next__ = function(self){
   self.$counter++
   if(self.$counter<self.elt.childNodes.length){
       return DOMNode(self.elt.childNodes[self.$counter])
   }
   throw _b_.StopIteration('StopIteration')
}

DOMNodeDict.__radd__ = function(self,other){ // add to a string
    var res = $TagSum()
    var txt = DOMNode(document.createTextNode(other))
    res.children = [txt,self]
    return res
}

DOMNodeDict.__str__ = DOMNodeDict.__repr__ = function(self){
    var proto = Object.getPrototypeOf(self.elt)
    if(proto){
        var name = proto.constructor.name
        if(name===undefined){ // IE
            var proto_str = proto.constructor.toString()
            name = proto_str.substring(8, proto_str.length-1)
        }
        return "<"+name+" object>"
    }
    var res = "<DOMNode object type '"
    return res+$NodeTypes[self.elt.nodeType]+"' name '"+self.elt.nodeName+"'>"
}

DOMNodeDict.__setattr__ = function(self,attr,value){

   if(attr.substr(0,2)=='on'){ // event
        if (!_b_.bool(value)) { // remove all callbacks attached to event
            DOMNodeDict.unbind(self,attr.substr(2))
        }else{
            // value is a function taking an event as argument
            DOMNodeDict.bind(self,attr.substr(2),value)
        }
    }else{
        if(DOMNodeDict['set_'+attr]!==undefined) {
          return DOMNodeDict['set_'+attr](self,value)
        }
        // Setting an attribute to an instance of DOMNode can mean 2
        // different things:
        // - setting an attribute to the DOM element, eg elt.href = ...
        //   sets <A href="...">
        // - setting an arbitrary attribute to the Python object
        //
        // The first option is used if the DOM element supports getAttribute
        // (or getAttributeNS for SVG elements), and if this method applied to
        // the attribute returns the same value.
        // Otherwise, the second option is used.

        if(self.elt[attr]!==undefined){self.elt[attr]=value;return}

        // Case-insensitive version of the attribute. Also replaces _ by -
        // to support setting attributes that have a -
        var attr1 = attr.replace('_','-').toLowerCase()

        if(self.elt instanceof SVGElement &&
            self.elt.getAttributeNS(null, attr1)!==null){
            self.elt.setAttributeNS(null, attr1, value)
            return
        }

        if(typeof self.elt.getAttribute=='function' &&
                typeof self.elt.setAttribute=='function'){
            var res = self.elt.getAttribute(attr1)
                if(value===false){
                    self.elt.removeAttribute(attr1)
                }else{
                    try{
                        self.elt.setAttribute(attr1,value)
                    }catch(err){
                        // happens for instance if attr starts with _ because
                        // attr1 starts with "-" and it is an invalid 1st arg
                        // for setAttribute
                        self.elt[attr]=value
                        return _b_.None
                    }
                    if(self.elt.getAttribute(attr1) !== value){
                        // If value is a Brython object, eg a dictionary
                        self.elt.removeAttribute(attr1)
                        self.elt[attr]=value
                    }
                }
                return _b_.None
        }

        // If setAttribute doesn't work, ie subsequent getAttribute doesn't
        // return the same value, set key/value on the DOMNode instance
        self.elt[attr]=value
        return _b_.None
    }
}

DOMNodeDict.__setitem__ = function(self,key,value){self.elt.childNodes[key]=value}

DOMNodeDict.abs_left = {
    __get__: function(self){
        return $getPosition(self.elt).left
    },
    __set__: function(){
        throw _b_.AttributeError("'DOMNode' objectattribute 'abs_left' is read-only")
    }
}

DOMNodeDict.abs_top = {
    __get__: function(self){
        return $getPosition(self.elt).top
    },
    __set__: function(){
        throw _b_.AttributeError("'DOMNode' objectattribute 'abs_top' is read-only")
    }
}

DOMNodeDict.bind = function(self,event){
    // bind functions to the event (event = "click", "mouseover" etc.)
    var _id
    if(self.elt.nodeType===9){_id=0}
    else{_id = self.elt.$brython_id}
    // if element id is not referenced in $B.events, create a new entry
    var _d=_b_.dict.$dict
    if(!_d.__contains__($B.events, _id)){
        _d.__setitem__($B.events, _id, dict())
    }
    var item = _d.__getitem__($B.events, _id)
    // If event is not already registered for the element, create a new list
    if(!_d.__contains__(item, event)){
        _d.__setitem__(item, event, [])
    }
    var evlist = _d.__getitem__(item, event)
    var pos=evlist.length
    for(var i=2;i<arguments.length;i++){
        var func = arguments[i]
        var callback = (function(f){
            return function(ev){
                try{
                    return f($DOMEvent(ev))
                }catch(err){
                    if(err.__class__!==undefined){
                        var msg = _b_.getattr(err, 'info')+
                            '\n'+err.__class__.__name__
                        if(err.args){msg += ': '+err.args[0]}
                        try{getattr($B.stderr,"write")(msg)}
                        catch(err){console.log(msg)}
                    }else{
                        try{getattr($B.stderr,"write")(err)}
                        catch(err1){console.log(err)}
                    }
                }
            }}
        )(func)
        self.elt.addEventListener(event,callback,false)
        evlist[pos++]=[func, callback]
    }
    return self
}

DOMNodeDict.children = function(self){
    var res = [], pos=0, elt = self.elt
    console.log(elt, elt.childNodes)
    if(elt.nodeType==9){elt = elt.body}
    for(var i=0;i<elt.childNodes.length;i++){
        res[pos++]=DOMNode(elt.childNodes[i])
    }
    return res
}

DOMNodeDict.clear = function(self){
    // remove all children elements
    var elt=self.elt
    if(elt.nodeType==9){elt=elt.body}
    while(elt.firstChild){
       elt.removeChild(elt.firstChild)
    }
}

DOMNodeDict.Class = function(self){
    if(self.elt.className !== undefined) return self.elt.className
    return None
}

DOMNodeDict.class_name = function(self){return DOMNodeDict.Class(self)}

DOMNodeDict.clone = function(self){
    res = DOMNode(self.elt.cloneNode(true))
    res.elt.$brython_id='DOM-' + $B.UUID()

    // bind events on clone to the same callbacks as self
    var _d=_b_.dict.$dict
    if(_d.__contains__($B.events, self.elt.$brython_id)){
        var events = _d.__getitem__($B.events, self.elt.$brython_id)
        var items = _b_.list(_d.items(events))
        for(var i=0;i<items.length;i++){
            var event = items[i][0]
            for(var j=0;j<items[i][1].length;j++){
                DOMNodeDict.bind(res,event,items[i][1][j][0])
            }
        }
    }
    return res
}

DOMNodeDict.closest = function(self, tagName){
    // Returns the first parent of self with specified tagName
    // Raises KeyError if not found
    var res = self.elt,
        tagName = tagName.toLowerCase()
    while(res.tagName.toLowerCase() != tagName){
        res = res.parentNode
        if(res===undefined){
            throw _b_.KeyError('no parent of type '+tagName)
        }
    }
    return DOMNode(res)
}

DOMNodeDict.events = function(self, event){
    var _id
    if(self.elt.nodeType===9){_id=0}
    else{_id = self.elt.$brython_id}
    // if element id is not referenced in $B.events, create a new entry
    var _d=_b_.dict.$dict
    if(!_d.__contains__($B.events, _id)){return []}
    var item = _d.__getitem__($B.events, _id)
    // If event is not already registered for the element, create a new list
    if(!_d.__contains__(item, event)){return []}
    var evt_list = _d.__getitem__(item, event), callbacks = []
    for(var i=0;i<evt_list.length;i++){callbacks.push(evt_list[i][1])}
    return callbacks
}

DOMNodeDict.focus = function(self){
    return (function(obj){
        return function(){
            // focus() is not supported in IE
            setTimeout(function() { obj.focus(); }, 10)
        }
    })(self.elt)
}

DOMNodeDict.get = function(self){
    // for document : doc.get(key1=value1[,key2=value2...]) returns a list of the elements
    // with specified keys/values
    // key can be 'id','name' or 'selector'
    var obj = self.elt
    var args = [], pos=0
    for(var i=1;i<arguments.length;i++){args[pos++]=arguments[i]}
    var $ns=$B.args('get',0,{},[],args,{},null,'kw')
    var $dict = {}
    var items = _b_.list(_b_.dict.$dict.items($ns['kw']))
    for(var i=0;i<items.length;i++){
        $dict[items[i][0]]=items[i][1]
    }
    if($dict['name']!==undefined){
        if(obj.getElementsByName===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by name")
        }
        var res = [], pos=0
        var node_list = document.getElementsByName($dict['name'])
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) res[pos++]=DOMNode(node_list[i])
    }
    if($dict['tag']!==undefined){
        if(obj.getElementsByTagName===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by tag name")
        }
        var res = [], pos=0
        var node_list = document.getElementsByTagName($dict['tag'])
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) res[pos++]=DOMNode(node_list[i])
    }
    if($dict['classname']!==undefined){
        if(obj.getElementsByClassName===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by class name")
        }
        var res = [], pos=0
        var node_list = document.getElementsByClassName($dict['classname'])
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) res[pos++]=DOMNode(node_list[i])
    }
    if($dict['id']!==undefined){
        if(obj.getElementById===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by id")
        }
        var id_res = obj.getElementById($dict['id'])
        if(!id_res) return []
        return [DOMNode(id_res)]
    }
    if($dict['selector']!==undefined){
        if(obj.querySelectorAll===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by selector")
        }
        var node_list = obj.querySelectorAll($dict['selector'])
        var sel_res = [], pos=0
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) sel_res[pos++]=DOMNode(node_list[i])

        if(res===undefined) return sel_res
        var to_delete = [], pos=0
        for(var i=0;i<res.length;i++){
            var elt = res[i], // keep it only if it is also inside sel_res
                flag = false
            for(var j=0;j<sel_res.length;j++){
                if(elt.__eq__(sel_res[j])){flag=true;break}
            }
            if(!flag){to_delete[pos++]=i}
        }
        for(var i=to_delete.length-1;i>=0;i--) res.splice(to_delete[i],1)
    }
    return res
}

DOMNodeDict.getContext = function(self){ // for CANVAS tag
    if(!('getContext' in self.elt)){
      throw _b_.AttributeError("object has no attribute 'getContext'")
    }
    var obj = self.elt
    return function(ctx){return JSObject(obj.getContext(ctx))}
}

DOMNodeDict.getSelectionRange = function(self){ // for TEXTAREA
    if(self.elt['getSelectionRange']!==undefined){
        return self.elt.getSelectionRange.apply(null,arguments)
    }
}

DOMNodeDict.height = {
    '__get__': function(self){
        // Special case for Canvas
        // http://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5
        if(self.elt.tagName=='CANVAS'){return self.elt.height}
        if(self.elt.style===undefined){return _b_.None}
        var res = parseInt(self.elt.style.height)
        if(isNaN(res)){
            return self.elt.offsetHeight
            //throw _b_.AttributeError("node has no attribute 'height'")
        }
        return res
    },
    '__set__': function(obj, self, value){
        if(self.elt.tagName=='CANVAS'){self.elt.height=value}
        self.elt.style.height = value+'px'
    }
}

DOMNodeDict.html = function(self){
    var res = self.elt.innerHTML
    if(res===undefined){
        if(self.elt.nodeType==9){res = self.elt.body.innerHTML}
        else{res = _b_.None}
    }
    return res
}

DOMNodeDict.id = function(self){
    if(self.elt.id !== undefined) return self.elt.id
    return None
}

DOMNodeDict.index = function(self){
    // Get index of element in its parent children
    var rank = 0,
        elt = self.elt
    while((elt = elt.previousSibling) !== null){
        rank++
    }
    return rank
}

DOMNodeDict.inside = function(self, other){
    // Test if a node is inside another node
    other = other.elt
    var elt = self.elt
    while(true){
        if(other===elt){return true}
        elt = elt.parentElement
        if(!elt){return false}
    }
}

DOMNodeDict.left = {
    '__get__': function(self){
        if(self.elt.style===undefined){return _b_.None}
        var res = parseInt(self.elt.style.left)
        if(isNaN(res)){
            throw _b_.AttributeError("node has no attribute 'left'")
        }
        return res
    },
    '__set__': function(obj, self, value){
        self.elt.style.left = value+'px'
    }
}

DOMNodeDict.options = function(self){ // for SELECT tag
    return new $OptionsClass(self.elt)
}

DOMNodeDict.parent = function(self){
    if(self.elt.parentElement) return DOMNode(self.elt.parentElement)
    return None
}

DOMNodeDict.reset = function(self){ // for FORM
    return function(){self.elt.reset()}
}

DOMNodeDict.select = function(self, selector){
    // alias for get(selector=...)
    if(self.elt.querySelectorAll===undefined){
        throw _b_.TypeError("DOMNode object doesn't support selection by selector")
    }
    var node_list = self.elt.querySelectorAll(selector),
        res = []
    if(node_list.length===0) return []
    for(var i=0, len=node_list.length;i<len;i++){
        res[i]=DOMNode(node_list[i])
    }
    return res
}

DOMNodeDict.style = function(self){
    // set attribute "float" for cross-browser compatibility
    self.elt.style.float = self.elt.style.cssFloat || self.style.styleFloat
    return $B.JSObject(self.elt.style)
}

DOMNodeDict.top = {
    '__get__': function(self){
        if(self.elt.style===undefined){return _b_.None}
        var res = parseInt(self.elt.style.top)
        if(isNaN(res)){
            throw _b_.AttributeError("node has no attribute 'top'")
        }
        return res
    },
    '__set__': function(obj, self, value){
        self.elt.style.top = value+'px'
    }
}

DOMNodeDict.setSelectionRange = function(self){ // for TEXTAREA
    if(this['setSelectionRange']!==undefined){
        return (function(obj){
            return function(){
                return obj.setSelectionRange.apply(obj,arguments)
            }})(this)
    }else if (this['createTextRange']!==undefined) {
        return (function(obj){
            return function(start_pos,end_pos){
                if(end_pos==undefined){end_pos=start_pos}
        var range = obj.createTextRange();
        range.collapse(true);
        range.moveEnd('character', start_pos);
        range.moveStart('character', end_pos);
        range.select();
            }
    })(this)
    }
}

DOMNodeDict.set_class_name = function(self,arg){
    self.elt.setAttribute('class',arg)
}

DOMNodeDict.set_html = function(self,value){
    var elt = self.elt
    if(elt.nodeType==9){elt = elt.body}
    elt.innerHTML=str(value)
}

DOMNodeDict.set_style = function(self,style){ // style is a dict
    if(!_b_.isinstance(style, _b_.dict)){
        throw TypeError('style must be dict, not '+$B.get_class(style).__name__)
    }
    var items = _b_.list(_b_.dict.$dict.items(style))
    for(var i=0;i<items.length;i++){
        var key = items[i][0],value=items[i][1]
        if(key.toLowerCase()==='float'){
            self.elt.style.cssFloat = value
            self.elt.style.styleFloat = value
        }else{
            switch(key) {
              case 'top':
              case 'left':
              case 'width':
              case 'borderWidth':
                if(isinstance(value,_b_.int)){value = value+'px'}
            }
            self.elt.style[key] = value
        }
    }
}

DOMNodeDict.set_text = function(self,value){
    var elt = self.elt
    if(elt.nodeType==9){elt = elt.body}
    elt.innerText=str(value)
    elt.textContent=str(value)
}

DOMNodeDict.set_value = function(self,value){self.elt.value = str(value)}

DOMNodeDict.submit = function(self){ // for FORM
    return function(){self.elt.submit()}
}

DOMNodeDict.text = function(self){
    var elt = self.elt
    if(elt.nodeType==9){elt = elt.body}
    var res = elt.innerText || elt.textContent
    if(res===null){
        res = _b_.None
    }
    return res
}

DOMNodeDict.toString = function(self){
    if(self===undefined) return 'DOMNode'
    return self.elt.nodeName
}

DOMNodeDict.trigger = function (self, etype){
    // Artificially triggers the event type provided for this DOMNode
    if (self.elt.fireEvent) {
      self.elt.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      self.elt.dispatchEvent(evObj);
    }
}

DOMNodeDict.unbind = function(self,event){
    // unbind functions from the event (event = "click", "mouseover" etc.)
    // if no function is specified, remove all callback functions
    // If no event is specified, remove all callbacks for all events
    var _id
    if(self.elt.nodeType==9){_id=0}else{_id=self.elt.$brython_id}
    if(!_b_.dict.$dict.__contains__($B.events, _id)) return
    var item = _b_.dict.$dict.__getitem__($B.events, _id)

    if(event===undefined){
        var events = _b_.list(_b_.dict.$dict.keys(item))
        for(var i=0;i<events.length;i++){DOMNodeDict.unbind(self, events[i])}
        return
    }

    if(!_b_.dict.$dict.__contains__(item, event)) return

    var events = _b_.dict.$dict.__getitem__(item, event)
    if(arguments.length===2){
        for(var i=0;i<events.length;i++){
            var callback = events[i][1]
            self.elt.removeEventListener(event,callback,false)
        }
        events = []
        return
    }
    for(var i=2;i<arguments.length;i++){
        var func = arguments[i], flag = false
        for(var j=0;j<events.length;j++){
            if(getattr(func,'__eq__')(events[j][0])){
                var callback = events[j][1]
                self.elt.removeEventListener(event,callback,false)
                events.splice(j,1)
                flag = true
                break
            }
        }
        // The indicated func was not found, error is thrown
        if(!flag){throw KeyError('missing callback for event '+event)}
    }
}

DOMNodeDict.width = {
    '__get__': function(self){
        // Special case for Canvas
        // http://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5
        if(self.elt.tagName=='CANVAS'){return self.elt.width}
        if(self.elt.style===undefined){return _b_.None}
        var res = parseInt(self.elt.style.width)
        if(isNaN(res)){
            //throw _b_.AttributeError("node has no attribute 'width'")
            return self.elt.offsetWidth
        }
        return res
    },
    '__set__': function(obj, self, value){
        if(self.elt.tagName=='CANVAS'){
            // for CANVAS, we must set both elt.widdth and elt.style.width
            // to the same value, else content is scaled in the browser
            self.elt.width=value
        }
        self.elt.style.width = value+'px'
    }
}

// return query string as an object with methods to access keys and values
// same interface as cgi.FieldStorage, with getvalue / getlist / getfirst
var $QueryDict = {__class__:$B.$type,__name__:'query'}

$QueryDict.__contains__ = function(self,key){
    return self._keys.indexOf(key)>-1
}

$QueryDict.__getitem__ = function(self,key){
    // returns a single value or a list of values
    // associated with key, or raise KeyError
    var result = self._values[key]
    if(result===undefined) throw KeyError(key)
    if(result.length==1) return result[0]
    return result
}

var $QueryDict_iterator = $B.$iterator_class('query string iterator')
$QueryDict.__iter__ = function(self){
    return $B.$iterator(self._keys,$QueryDict_iterator)
}

$QueryDict.__mro__ = [$ObjectDict]

$QueryDict.getfirst = function(self,key,_default){
    // returns the first value associated with key
    var result = self._values[key]
    if(result===undefined){
       if(_default===undefined) return None
       return _default
    }
    return result[0]
}

$QueryDict.getlist = function(self,key){
    // always return a list
    var result = self._values[key]
    if(result===undefined) return []
    return result
}

$QueryDict.getvalue = function(self,key,_default){
    try{return $QueryDict.__getitem__(self, key)}
    catch(err){
        if(_default===undefined) return None
        return _default
    }
}

$QueryDict.keys = function(self){return self._keys}

DOMNodeDict.query = function(self){

    var res = {__class__:$QueryDict,
        _keys : [],
        _values : {}
    }
    var qs = location.search.substr(1).split('&')
    for(var i=0;i<qs.length;i++){
        var pos = qs[i].search('=')
        var elts = [qs[i].substr(0,pos),qs[i].substr(pos+1)]
        var key = decodeURIComponent(elts[0])
        var value = decodeURIComponent(elts[1])
        if(res._keys.indexOf(key)>-1){res._values[key].push(value)}
        else{
            res._keys.push(key)
            res._values[key] = [value]
        }
    }

    return res
}

// class used for tag sums
var $TagSumDict = {__class__ : $B.$type,__name__:'TagSum'}

$TagSumDict.appendChild = function(self,child){
    self.children.push(child)
}

$TagSumDict.__add__ = function(self,other){
    if($B.get_class(other)===$TagSumDict){
        self.children = self.children.concat(other.children)
    }else if(isinstance(other,[_b_.str,_b_.int,_b_.float,
                               _b_.dict,_b_.set,_b_.list])){
        self.children = self.children.concat(DOMNode(document.createTextNode(other)))
    }else{self.children.push(other)}
    return self
}

$TagSumDict.__mro__ = [$ObjectDict]

$TagSumDict.__radd__ = function(self,other){
    var res = $TagSum()
    res.children = self.children.concat(DOMNode(document.createTextNode(other)))
    return res
}

$TagSumDict.__repr__ = function(self){
    var res = '<object TagSum> '
    for(var i=0;i<self.children.length;i++){
        res+=self.children[i]
        if(self.children[i].toString()=='[object Text]'){res += ' ['+self.children[i].textContent+']\n'}
    }
    return res
}

$TagSumDict.__str__ = $TagSumDict.toString = $TagSumDict.__repr__

$TagSumDict.clone = function(self){
    var res = $TagSum(), $i=0
    for($i=0;$i<self.children.length;$i++){
        res.children.push(self.children[$i].cloneNode(true))
    }
    return res
}

function $TagSum(){
    return {__class__:$TagSumDict,
        children:[],
        toString:function(){return '(TagSum)'}
    }
}
$TagSum.__class__=$B.$factory
$TagSum.$dict = $TagSumDict
$B.$TagSum = $TagSum // used in _html.js and _svg.js

var win =  JSObject(_window) //{__class__:$WinDict}

win.get_postMessage = function(msg,targetOrigin){
    if(isinstance(msg,dict)){
        var temp = {__class__:'dict'}
        var items = _b_.list(_b_.dict.$dict.items(msg))
        for(var i=0;i<items.length;i++) temp[items[i][0]]=items[i][1]
        msg = temp
    }
    return _window.postMessage(msg,targetOrigin)
}

$B.DOMNodeDict = DOMNodeDict

$B.win = win
})(__BRYTHON__)
