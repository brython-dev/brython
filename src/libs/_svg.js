// creation of an HTML element
var $module = (function($B){

var _b_ = $B.builtins
var $TagSumDict = $B.$TagSum.$dict

var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

var $svgNS = "http://www.w3.org/2000/svg"
var $xlinkNS = "http://www.w3.org/1999/xlink"

function makeTagDict(tagName){
    // return the dictionary for the class associated with tagName
    var dict = {__class__:$B.$type,
        __name__:tagName
        }

    dict.__getattribute__ = function(self, attr){
        if(self.elt.hasAttributeNS(null, attr)){
            return self.elt.getAttributeNS(null,attr)
        }
        if(dict[attr]!==undefined){
            return function(){
                var args = [self].concat(Array.prototype.slice.call(arguments))
                return dict[attr].apply(null, args)
            }
        }
        return $B.DOMNode.__getattribute__(self, attr)        
    }

    dict.__init__ = function(){
        var $ns=$B.$MakeArgs('pow',arguments,['self'],[],'args','kw')
        var self = $ns['self']
        var args = $ns['args']
        if(args.length==1){
            var first=args[0]
            if(isinstance(first,[str,int,float])){
                self.elt.appendChild(document.createTextNode(str(first)))
            } else if(first.__class__===$TagSumDict){
                for(var i=0, _len_i = first.children.length; i < _len_i;i++){
                    self.elt.appendChild(first.children[i].elt)
                }
            } else { // argument is another DOMNode instance
                try{self.elt.appendChild(first.elt)}
                catch(err){throw ValueError('wrong element '+first)}
            }
        }

        // attributes
        var items = _b_.list(_b_.dict.$dict.items($ns['kw']))
        for(var i=0, _len_i = items.length; i < _len_i;i++){
            // keyword arguments
            var arg = items[i][0]
            var value = items[i][1]
            if(arg.toLowerCase().substr(0,2)==="on"){ 
                // Event binding passed as argument "onclick", "onfocus"...
                // Better use method bind of DOMNode objects
                var js = '$B.DOMNode.bind(self,"'
                js += arg.toLowerCase().substr(2)
                eval(js+'",function(){'+value+'})')
            }else if(arg.toLowerCase()=="style"){
                $B.DOMNode.set_style(self,value)
            }else if(arg.toLowerCase().indexOf("href") !== -1){ // xlink:href
                self.elt.setAttributeNS( "http://www.w3.org/1999/xlink","href",value)
            } else {
                if(value!==false){
                    // option.selected=false sets it to true :-)
                    try{
                        arg = arg.toLowerCase().replace('_','-')
                        self.elt.setAttributeNS(null,arg,value)
                    }catch(err){
                        throw ValueError("can't set attribute "+arg)
                    }
                }
            }
        }
    }

    dict.__mro__ = [dict,$B.DOMNode,$B.builtins.object.$dict]

    dict.__new__ = function(cls){
        var res = $B.$DOMNode(document.createElementNS($svgNS,tagName))
        res.__class__ = cls.$dict
        return res
    }
    
    dict.__setattr__ = function(self, key, value){
        if(self.elt.hasAttributeNS(null, key)){
            self.elt.setAttributeNS(null,key,value)
        }else{
            $B.DOMNode.__setattr__(self, key, value)
        }
    }

    return dict
}


// the classes used for tag sums, $TagSum and $TagSumClass 
// are defined in py_dom.js

function makeFactory(tagName){
    var factory = function(){
        var res = $B.$DOMNode(document.createElementNS($svgNS,tagName))
        res.__class__ = dicts[tagName]
        // apply __init__
        var args = [res]
        for(var i=0, _len_i = arguments.length; i < _len_i;i++){args.push(arguments[i])}
        dicts[tagName].__init__.apply(null,args)
        return res
    }
    factory.__class__=$B.$factory
    factory.$dict = dicts[tagName]
    return factory
}

// SVG
var $svg_tags = ['a',
'altGlyph',
'altGlyphDef',
'altGlyphItem',
'animate',
'animateColor',
'animateMotion',
'animateTransform',
'circle',
'clipPath',
'color_profile', // instead of color-profile
'cursor',
'defs',
'desc',
'ellipse',
'feBlend',
'foreignObject', //patch to enable foreign objects
'g',
'image',
'line',
'linearGradient',
'marker',
'mask',
'path',
'pattern',
'polygon',
'polyline',
'radialGradient',
'rect',
'set',
'stop',
'svg',
'text',
'tref',
'tspan',
'use']

// create classes
var obj = new Object()
var dicts = {}
for(var i=0, _len_i = $svg_tags.length; i < _len_i;i++){
    var tag = $svg_tags[i]
    dicts[tag]=makeTagDict(tag)
    obj[tag] = makeFactory(tag)
    dicts[tag].$factory = obj[tag]
}
return obj
})(__BRYTHON__)
