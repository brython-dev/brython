;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict
var JSObject = $B.JSObject

// Maps $brython_id of DOM elements to events
$B.events = _b_.dict()

// cross-browser utility functions
function $getMouseOffset(target, ev){
    ev = ev || window.event;
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
    if (!ev) var ev = window.event;
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

$B.$isNode = function(obj){
    for(var i=0;i<$DOMNodeAttrs.length;i++){
        if(obj[$DOMNodeAttrs[i]]===undefined) return false
    }
    return true
}

$B.$isNodeList = function(nodes) {
    // copied from http://stackoverflow.com/questions/7238177/
    // detect-htmlcollection-nodelist-in-javascript
    try{
        var result = Object.prototype.toString.call(nodes);
        var re = new RegExp("^\\[object (HTMLCollection|NodeList|Object)\\]$")     
        return (typeof nodes === 'object'
            && re.exec(result)!==null
            && nodes.hasOwnProperty('length')
            && (nodes.length == 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0))
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
    flag = true
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

$DOMEventDict.__mro__ = [$DOMEventDict,$ObjectDict]

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
        if(self.target===undefined) return $DOMNode(self.srcElement)
        return $DOMNode(self.target)
      case 'char':
        return String.fromCharCode(self.which)
    }

    var res =  self[attr]
    if(res!==undefined){
        if(typeof res=='function'){return function(){return res.apply(self,arguments)}}
        return $B.$JS2Py(res)
    }
    throw _b_.AttributeError("object DOMEvent has no attribute '"+attr+"'")
}

var $DOMEvent = $B.DOMEvent = function(ev){
    ev.__class__ = $DOMEventDict
    if(ev.preventDefault===undefined){ev.preventDefault = function(){ev.returnValue=false}}
    if(ev.stopPropagation===undefined){ev.stopPropagation = function(){ev.cancelBubble=true}}
    ev.__repr__ = function(){return '<DOMEvent object>'}
    ev.__str__ = function(){return '<DOMEvent object>'}
    ev.toString = ev.__str__
    return ev
}
$DOMEvent.__class__ = $B.$factory
$DOMEvent.$dict = $DOMEventDict
$DOMEventDict.$factory = $DOMEvent

var $ClipboardDict = {__class__:$B.$type,__name__:'Clipboard'}

$ClipboardDict.__getitem__=function(self,name){return self.data.getData(name)}

$ClipboardDict.__mro__ = [$ClipboardDict,$ObjectDict]

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
                // value is a function taking an event as argument
                if(window.addEventListener){
                    var callback = function(ev){return value($DOMEvent(ev))}
                    obj.addEventListener(attr.substr(2),callback)
                }else if(window.attachEvent){
                    var callback = function(ev){return value($DOMEvent(window.event))}
                    obj.attachEvent(attr,callback)
                }
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
    return $DOMNode(self.parent.options[key])
}
    
$OptionsDict.__len__ = function(self) {return self.parent.options.length}

$OptionsDict.__mro__ = [$OptionsDict,$ObjectDict]

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

$StyleDict.__mro__ = [$StyleDict,$ObjectDict]

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

function DOMNode(){} // define a Node object
DOMNode.__class__ = $B.$type
DOMNode.__mro__ = [DOMNode,_b_.object.$dict]
DOMNode.__name__ = 'DOMNode'
DOMNode.$dict = DOMNode // for isinstance
DOMNode.$factory = DOMNode

function $DOMNode(elt){ 
    // returns the element, enriched with an attribute $brython_id for 
    // equality testing and with all the attributes of Node
    var res = {}
    res.$dict = {} // used in getattr
    res.elt = elt // DOM element
    if(elt['$brython_id']===undefined||elt.nodeType===9){
        // add a unique id for comparisons
        elt.$brython_id='DOM-'+$B.UUID()
        // add attributes of Node to element
        res.__repr__ = res.__str__ = res.toString = function(){
            var res = "<DOMNode object type '"
            return res+$NodeTypes[elt.nodeType]+"' name '"+elt.nodeName+"'>"
        }
    }
    res.__class__ = DOMNode
    return res
}

DOMNode.__add__ = function(self,other){
    // adding another element to self returns an instance of $TagSum
    var res = $TagSum()
    res.children = [self]
    if(isinstance(other,$TagSum)){
        for(var $i=0;$i<other.children.length;$i++){res.children.push(other.children[$i])}
    } else if(isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.list,
                                _b_.dict,_b_.set,_b_.tuple])){
        res.children.push($DOMNode(document.createTextNode(_b_.str(other))))
    }else{res.children.push(other)}
    return res
}

DOMNode.__bool__ = function(self){return true}

DOMNode.__class__ = $B.$type

DOMNode.__contains__ = function(self,key){
    try{self.__getitem__(key);return True}
    catch(err){return False}
}

DOMNode.__del__ = function(self){
    // if element has a parent, calling __del__ removes object
    // from the parent's children
    if(!self.elt.parentNode){
        throw _b_.ValueError("can't delete "+str(elt))
    }
    self.elt.parentNode.removeChild(self.elt)
}

DOMNode.__delitem__ = function(self,key){
    if(self.elt.nodeType===9){ // document : remove by id
        var res = self.elt.getElementById(key)
        if(res){res.parentNode.removeChild(res)}
        else{throw KeyError(key)}
    }else{ // other node : remove by rank in child nodes
        self.elt.removeChild(self.elt.childNodes[key])
    }
}

DOMNode.__eq__ = function(self,other){
    return self.elt==other.elt
}

DOMNode.__getattribute__ = function(self,attr){
    switch(attr) {
      case 'class_name':
      case 'children':
      case 'html':
      case 'id':
      case 'left':
      case 'parent':
      case 'query':
      case 'text':
      case 'top':
      case 'value':
      case 'height':
      case 'width':
        return DOMNode[attr](self)
      case 'clear':
      case 'remove':
        return function(){DOMNode[attr](self,arguments[0])}
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
        if(res!==undefined&&res!==null&&self.elt[attr]===undefined){
            // now we're sure it's an attribute
            return res
        }
    }
    if(self.elt[attr]!==undefined){
        res = self.elt[attr]
        if(typeof res==="function"){
            var func = (function(f,elt){
                return function(){
                    var args = []
                    for(var i=0;i<arguments.length;i++){
                        var arg=arguments[i]
                        if(isinstance(arg,JSObject)){
                            args.push(arg.js)
                        }else if(isinstance(arg,DOMNode)){
                            args.push(arg.elt)
                        }else if(arg===_b_.None){
                            args.push(null)
                        }else{
                            args.push(arg)
                        }
                    }
                    var result = f.apply(elt,args)
                    return $B.$JS2Py(result)
                }
            })(res,self.elt)
            func.__name__ = attr
            return func
        }
        if(attr=='options') return $Options(self.elt)
        if(attr=='style') return $Style(self.elt[attr])
        return $B.$JS2Py(self.elt[attr])
    }
    return $ObjectDict.__getattribute__(self,attr)
}

DOMNode.__getitem__ = function(self,key){
    if(self.elt.nodeType===9){ // Document
        if(typeof key==="string"){
            var res = self.elt.getElementById(key)
            if(res) return $DOMNode(res)
            throw KeyError(key)
        }else{
            try{
                var elts=self.elt.getElementsByTagName(key.$dict.__name__),res=[]
                for(var $i=0;$i<elts.length;$i++) res.push($DOMNode(elts[$i]))
                return res
            }catch(err){
                throw KeyError(str(key))
            }
        }
    }else{
        return $DOMNode(self.elt.childNodes[key])
    }
}

DOMNode.__iter__ = function(self){ // for iteration
    self.$counter = -1
    return self
}

DOMNode.__le__ = function(self,other){
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
    }else{ // other is a DOMNode instance
        elt.appendChild(other.elt)
    }
}

DOMNode.__len__ = function(self){return self.elt.childNodes.length}

DOMNode.__mul__ = function(self,other){
    if(isinstance(other,_b_.int) && other.valueOf()>0){
        var res = $TagSum()
        for(var i=0;i<other.valueOf();i++){
            var clone = DOMNode.clone(self)()
            res.children.push(clone)
        }
        return res
    }
    throw _b_.ValueError("can't multiply "+self.__class__+"by "+other)
}

DOMNode.__ne__ = function(self,other){return !DOMNode.__eq__(self,other)}

DOMNode.__next__ = function(self){
   self.$counter++
   if(self.$counter<self.elt.childNodes.length){
       return $DOMNode(self.elt.childNodes[self.$counter])
   }
   throw _b_.StopIteration('StopIteration')
}

DOMNode.__radd__ = function(self,other){ // add to a string
    var res = $TagSum()
    var txt = $DOMNode(document.createTextNode(other))
    res.children = [txt,self]
    return res
}

DOMNode.__str__ = DOMNode.__repr__ = function(self){
    if(self===undefined) return "<class 'DOMNode'>"
    
    var res = "<DOMNode object type '"
    return res+$NodeTypes[self.elt.nodeType]+"' name '"+self.elt.nodeName+"'>"
}

DOMNode.__setattr__ = function(self,attr,value){
    if(attr.substr(0,2)=='on'){ // event
        if (!_b_.bool(value)) { // remove all callbacks attached to event
            DOMNode.unbind(self,attr.substr(2))
        }else{
            // value is a function taking an event as argument
            DOMNode.bind(self,attr.substr(2),value)
        }
    }else{
        if(DOMNode['set_'+attr]!==undefined) {
          return DOMNode['set_'+attr](self,value)
        }
        var attr1 = attr.replace('_','-').toLowerCase()
        if(self.elt[attr1]!==undefined){self.elt[attr1]=value;return}
        var res = self.elt.getAttribute(attr1)
        if(res!==undefined&&res!==null){self.elt.setAttribute(attr1,value)}
        else{
            self.elt[attr]=value
        }
    }
}

DOMNode.__setitem__ = function(self,key,value){self.elt.childNodes[key]=value}

DOMNode.bind = function(self,event){
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
    for(var i=2;i<arguments.length;i++){
        var func = arguments[i]
        var callback = (function(f){
            return function(ev){
                try{
                    return f($DOMEvent(ev))
                }catch(err){
                    getattr($B.stderr,"write")(err.__name__+': '+err.message+'\n'+err.info)
                }
            }}
        )(func)
        if(window.addEventListener){
            self.elt.addEventListener(event,callback,false)
        }else if(window.attachEvent){
            self.elt.attachEvent("on"+event,callback)
        }
        evlist.push([func, callback])
    }
}

DOMNode.children = function(self){
    var res = []
    for(var i=0;i<self.elt.childNodes.length;i++){
        res.push($DOMNode(self.elt.childNodes[i]))
    }
    return res
}

DOMNode.clear = function(self){
    // remove all children elements
    var elt=self.elt
    if(elt.nodeType==9){elt=elt.body}
    for(var i=elt.childNodes.length-1;i>=0;i--){
       elt.removeChild(elt.childNodes[i])
    }    
}

DOMNode.Class = function(self){
    if(self.elt.className !== undefined) return self.elt.className
    return None
}

DOMNode.class_name = function(self){return DOMNode.Class(self)}

DOMNode.clone = function(self){
    res = $DOMNode(self.elt.cloneNode(true))
    res.elt.$brython_id='DOM-' + $B.UUID()

    // bind events on clone to the same callbacks as self
    var _d=_b_.dict.$dict
    if(_d.__contains__($B.events, self.elt.$brython_id)){
        var events = _d.__getitem__($B.events, self.elt.$brython_id)
        var items = _b_.list(_d.items(events))
        for(var i=0;i<items.length;i++){
            var event = items[i][0]
            for(var j=0;j<items[i][1].length;j++){
                DOMNode.bind(res,event,items[i][1][j][0])
            }
        }
    }
    return res
}

DOMNode.focus = function(self){
    return (function(obj){
        return function(){
            // focus() is not supported in IE
            setTimeout(function() { obj.focus(); }, 10)
        }
    })(self.elt)
}

DOMNode.get = function(self){
    // for document : doc.get(key1=value1[,key2=value2...]) returns a list of the elements
    // with specified keys/values
    // key can be 'id','name' or 'selector'
    var obj = self.elt
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var $ns=$B.$MakeArgs('get',args,[],[],null,'kw')
    var $dict = {}
    var items = _b_.list(_b_.dict.$dict.items($ns['kw']))
    for(var i=0;i<items.length;i++){
        $dict[items[i][0]]=items[i][1]
    }
    if($dict['name']!==undefined){
        if(obj.getElementsByName===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by name")
        }
        var res = []
        var node_list = document.getElementsByName($dict['name'])
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) res.push($DOMNode(node_list[i]))
    }
    if($dict['tag']!==undefined){
        if(obj.getElementsByTagName===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by tag name")
        }
        var res = []
        var node_list = document.getElementsByTagName($dict['tag'])
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) res.push($DOMNode(node_list[i]))
    }
    if($dict['classname']!==undefined){
        if(obj.getElementsByClassName===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by class name")
        }
        var res = []
        var node_list = document.getElementsByClassName($dict['classname'])
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) res.push($DOMNode(node_list[i]))
    }
    if($dict['id']!==undefined){
        if(obj.getElementById===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by id")
        }
        var id_res = obj.getElementById($dict['id'])
        if(!id_res) return []
        return [$DOMNode(id_res)]
    }
    if($dict['selector']!==undefined){
        if(obj.querySelectorAll===undefined){
            throw _b_.TypeError("DOMNode object doesn't support selection by selector")
        }
        var node_list = obj.querySelectorAll($dict['selector'])
        var sel_res = []
        if(node_list.length===0) return []
        for(var i=0;i<node_list.length;i++) sel_res.push($DOMNode(node_list[i]))
        
        if(res===undefined) return sel_res
        var to_delete = []
        for(var i=0;i<res.length;i++){
            var elt = res[i] // keep it only if it is also inside sel_res
            flag = false
            for(var j=0;j<sel_res.length;j++){
                if(elt.__eq__(sel_res[j])){flag=true;break}
            }
            if(!flag){to_delete.push(i)}
        }
        for(var i=to_delete.length-1;i>=0;i--) res.splice(to_delete[i],1)
    }
    return res
}

DOMNode.getContext = function(self){ // for CANVAS tag
    if(!('getContext' in self.elt)){
      throw _b_.AttributeError("object has no attribute 'getContext'")
    }
    var obj = self.elt
    return function(ctx){return JSObject(obj.getContext(ctx))}
}

DOMNode.getSelectionRange = function(self){ // for TEXTAREA
    if(self.elt['getSelectionRange']!==undefined){
        return self.elt.getSelectionRange.apply(null,arguments)
    }
}

DOMNode.height = function(self){
    return _b_.int($getPosition(self.elt)["height"])
}

DOMNode.html = function(self){return self.elt.innerHTML}

DOMNode.left = function(self){
    return _b_.int($getPosition(self.elt)["left"])
}

DOMNode.id = function(self){
    if(self.elt.id !== undefined) return self.elt.id
    return None
}

DOMNode.options = function(self){ // for SELECT tag
    return new $OptionsClass(self.elt)
}

DOMNode.parent = function(self){
    if(self.elt.parentElement) return $DOMNode(self.elt.parentElement)
    return None
}

DOMNode.remove = function(self,child){
    // Remove child from self
    // If child is not inside self, throw ValueError
    var elt=self.elt,flag=false,ch_elt=child.elt
    if(self.elt.nodeType==9){elt=self.elt.body}

    while(ch_elt.parentElement){
        if(ch_elt.parentElement===elt){
            elt.removeChild(ch_elt)
            flag = true
            break
        }else{ch_elt = ch_elt.parentElement}
    }
    if(!flag){throw _b_.ValueError('element '+child+' is not inside '+self)}
}

DOMNode.top = function(self){
    return _b_.int($getPosition(self.elt)["top"])
}

DOMNode.reset = function(self){ // for FORM
    return function(){self.elt.reset()}
}

DOMNode.style = function(self){
    // set attribute "float" for cross-browser compatibility
    self.elt.style.float = self.elt.style.cssFloat || self.style.styleFloat
    return $B.JSObject(self.elt.style)
}

DOMNode.setSelectionRange = function(self){ // for TEXTAREA
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
    
DOMNode.set_class_name = function(self,arg){
    self.elt.setAttribute('class',arg)
}

DOMNode.set_html = function(self,value){
    self.elt.innerHTML=str(value)
}

DOMNode.set_style = function(self,style){ // style is a dict
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
                //if(['top','left','height','width','borderWidth'].indexOf(key)>-1
                // && isinstance(value,_b_.int)){value = value+'px'}
                if(isinstance(value,_b_.int)){value = value+'px'}
            }
            self.elt.style[key] = value
        }
    }
}

DOMNode.set_text = function(self,value){
    self.elt.innerText=str(value)
    self.elt.textContent=str(value)
}

DOMNode.set_value = function(self,value){self.elt.value = str(value)}

DOMNode.submit = function(self){ // for FORM
    return function(){self.elt.submit()}
}

DOMNode.text = function(self){return self.elt.innerText || self.elt.textContent}
    
DOMNode.toString = function(self){
    if(self===undefined) return 'DOMNode'
    return self.elt.nodeName
}

DOMNode.trigger = function (self, etype){
    // Artificially triggers the event type provided for this DOMNode
    if (self.elt.fireEvent) {
      self.elt.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      self.elt.dispatchEvent(evObj);
    }
}

DOMNode.unbind = function(self,event){
    // unbind functions from the event (event = "click", "mouseover" etc.)
    // if no function is specified, remove all callback functions
    var _id
    if(self.elt.nodeType==9){_id=0}else{_id=self.elt.$brython_id}
    if(!_b_.dict.$dict.__contains__($B.events, _id)) return
    var item = _b_.dict.$dict.__getitem__($B.events, _id)
    if(!_b_.dict.$dict.__contains__(item, event)) return

    var events = _b_.dict.$dict.__getitem__(item, event)
    if(arguments.length===2){
        for(var i=0;i<events.length;i++){
            var callback = events[i][1]
            if(window.removeEventListener){
                self.elt.removeEventListener(event,callback,false)
            }else if(window.detachEvent){
                self.elt.detachEvent(event,callback,false)
            }
        }
        events = []
        return
    }
    for(var i=2;i<arguments.length;i++){
        var func = arguments[i], flag = false
        for(var j=0;j<events.length;j++){
            if(getattr(func,'__eq__')(events[j][0])){
                var callback = events[j][1]
                if(window.removeEventListener){
                    self.elt.removeEventListener(event,callback,false)
                }else if(window.detachEvent){
                    self.elt.detachEvent(event,callback,false)
                }
                events.splice(j,1)
                flag = true
                break
            }
        }
        // The indicated func was not found, error is thrown
        if(!flag){throw KeyError('missing callback for event '+event)}
    }
}

DOMNode.value = function(self){return self.elt.value}

DOMNode.width = function(self){
    return _b_.int($getPosition(self.elt)["width"])
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

$QueryDict.__mro__ = [$QueryDict,$ObjectDict]

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
    try{return self.__getitem__(key)}
    catch(err){
        $B.$pop_exc()
        if(_default===undefined) return None
        return _default
    }
}

$QueryDict.keys = function(self){return self._keys}

DOMNode.query = function(self){

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
        self.children = self.children.concat($DOMNode(document.createTextNode(other)))
    }else{self.children.push(other)}
    return self
}

$TagSumDict.__mro__ = [$TagSumDict,$ObjectDict]

$TagSumDict.__radd__ = function(self,other){
    var res = $TagSum()
    res.children = self.children.concat($DOMNode(document.createTextNode(other)))
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

//creation of jquery like helper functions..

var $toDOM = function (content) {
   if (isinstance(content,DOMNode)) return content

   if (isinstance(content,str)) {
      var _dom = document.createElement('div')
      _dom.innerHTML = content
      return _dom
   }

   // if we got this far there is a problem..
   throw Error('Invalid argument' + content)
}

DOMNode.prototype.addClass = function(classname){
   var _c = this.__getattr__('class')
   if (_c === undefined) {
      this.__setattr__('class', classname)
      return this
   }
   this.__setattr__('class', _c + " " + classname)
   return this
}

DOMNode.prototype.after = function(content){
   var _content=$toDOM(content);

   if (this.nextSibling !== null) {
     this.parentElement.insertBefore(_content, this.nextSibling)
     return this
   } 
   this.parentElement.appendChild(_content)
   return this
}

DOMNode.after = function(self,content){
   var _con

   if (isinstance(content,DOMNode)) {
     _con=content.elt
   } else {
     _con=$toDOM(content)
     _con=_con.childNodes[0]
   }

   if (self.elt.nextSibling !== null) {
     self.elt.parentElement.insertBefore(_con, self.elt.nextSibling);
   } else {
     self.elt.parentElement.appendChild(_con)
   }

   return self
}

DOMNode.prototype.append = function(content){
   var _content=$toDOM(content);
   this.appendChild(_content);
   return this
}

DOMNode.append = function(self,content){
 if (isinstance(content,DOMNode)) {
    self.elt.appendChild(content.elt)
 } else {
    var _content=$toDOM(content)
    self.elt.appendChild(_content.childNodes[0])
 }
  return self
}

DOMNode.prototype.before = function(content){
   var _content=$toDOM(content);
   this.parentElement.insertBefore(_content, this);
   return this
}

DOMNode.before = function(self,content){
   var _con

   if (isinstance(content,DOMNode)) {
     _con=content.elt
   } else {
     _con=$toDOM(content)
     _con=_con.childNodes[0]
   }

   self.elt.parentElement.insertBefore(_con, self.elt)

   return self
}


// closest will return the first ancestor that it comes across
// while traversing up the tree.
// note that selector parameter in regular jquery will be implemented
// at a higher level (ie, python class).

//a python class will implement very high level 
// selector functions, which will allow maximum flexibility
// we can also emulate jquery style selectors with the
// python class. :)

DOMNode.prototype.closest = function(selector){
   var traverse=function(node, ancestors) {
       if (node === _doc) return None
       for(var i=0; i<ancestors.length; i++) {
          if (node === ancestors[i]) { 
             return ancestors[i];
          }
       } 

       return traverse(this.parentElement, ancestors);
   }

   if (isinstance(selector, str)) {
      var _elements=_doc.get(selector=selector)
      return traverse(this, _elements); 
   } 

   return traverse(this, selector);
}

DOMNode.prototype.css = function(property,value){
   if (value !== undefined) {
      this.set_style({property:value})
      return this   
   }

   if (isinstance(property, dict)) {
      // we also set styles here..
      this.set_style(property)
      return this
   }

   //this is a get request
   if (this.style[property] === undefined) { return None}
   return this.style[property]
}

DOMNode.prototype.empty = function(){
   for (var i=0; i <= this.childNodes.length; i++) {
       this.removeChild(this.childNodes[i])
   }
}

DOMNode.prototype.hasClass = function(name){
   var _c = this.__getattr__('class')
   if (_c === undefined) return false
   if (_c.indexOf(name) > -1) return true

   return false
}

DOMNode.prototype.prepend = function(content){
   var _content=$toDOM(content);
   this.insertBefore(_content, this.firstChild);
}

DOMNode.prototype.removeAttr = function(name){
   this.__setattr__(name, undefined)
}

DOMNode.prototype.removeClass = function(name){
   var _c = this.__getattr__('class')
   if (_c === undefined) return

   if (_c === name) {
      this.__setattr__('class', undefined)
      return
   }

   _index=_c.indexOf(name)
   if (_index == -1) return

   var _class_string=_c
   if (_index==0) {  // class is first in list
        _class_string=_c.substring(name.length)
   } else if (_index == _c.length - name.length) {  // at end of string
        _class_string=_c.substring(0, _index)
   } else { // must be somewhere in the middle
        _class_string=_c.replace(' '+name+' ', '')
   }
   this.__setattr('class', _class_string)
}

var $WinDict = {__class__:$B.$type,__name__:'window'}

$WinDict.__getattribute__ = function(self,attr){
    if(window[attr]!==undefined){return JSObject(window[attr])}
    throw _b_.AttributeError("'window' object has no attribute '"+attr+"'")
}

$WinDict.__setattr__ = function(self, attr, value){
    //console.log('set attr '+attr+' of window ')
    window[attr] = value
    //console.log(window[attr])
}

$WinDict.__mro__ = [$WinDict,$ObjectDict]

var win =  JSObject(window) //{__class__:$WinDict}

win.get_postMessage = function(msg,targetOrigin){
    if(isinstance(msg,dict)){
        var temp = {__class__:'dict'}
        var items = _b_.list(_b_.dict.$dict.items(msg))
        for(var i=0;i<items.length;i++) temp[items[i][0]]=items[i][1]
        msg = temp
    }
    return window.postMessage(msg,targetOrigin)
}

$B.DOMNode = DOMNode
$B.$DOMNode = $DOMNode

$B.win = win
})(__BRYTHON__)
