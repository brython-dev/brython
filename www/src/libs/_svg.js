// creation of an HTML element
var $module = (function($B){

var _b_ = $B.builtins
var TagSum = $B.TagSum // defined in py_dom.js

var $s=[]
for(var $b in _b_) $s.push('var ' + $b +' = _b_["' + $b + '"]')
eval($s.join(';'))

var $svgNS = "http://www.w3.org/2000/svg"
var $xlinkNS = "http://www.w3.org/1999/xlink"

function makeTagDict(tagName){
    // return the dictionary for the class associated with tagName
    var dict = $B.make_class(tagName)

    dict.__init__ = function(){
        var $ns = $B.args('__init__', 1, {self: null}, ['self'],
            arguments, {}, 'args', 'kw'),
            self = $ns['self'],
            args = $ns['args']
        if(args.length == 1){
            var first = args[0]
            if(isinstance(first, [str, int, float])){
                self.elt.appendChild(document.createTextNode(str.$factory(first)))
            }else if(first.__class__ === TagSum){
                for(var i = 0, len = first.children.length; i < len; i++){
                    self.elt.appendChild(first.children[i].elt)
                }
            }else{ // argument is another DOMNode instance
                try{self.elt.appendChild(first.elt)}
                catch(err){throw ValueError.$factory('wrong element ' + first)}
            }
        }

        // attributes
        var items = _b_.list.$factory(_b_.dict.items($ns['kw']))
        for(var i = 0, len = items.length; i < len; i++){
            // keyword arguments
            var arg = items[i][0],
                value = items[i][1]
            if(arg.toLowerCase().substr(0,2) == "on"){
                // Event binding passed as argument "onclick", "onfocus"...
                // Better use method bind of DOMNode objects
                var js = '$B.DOMNode.bind(self,"' +
                    arg.toLowerCase().substr(2)
                eval(js+'",function(){'+value+'})')
            }else if(arg.toLowerCase() == "style"){
                $B.DOMNode.set_style(self,value)
            }else if(arg.toLowerCase().indexOf("href") !== -1){ // xlink:href
                self.elt.setAttributeNS( "http://www.w3.org/1999/xlink",
                    "href",value)
            }else{
                if(value !== false){
                    // option.selected=false sets it to true :-)
                    try{
                        arg = arg.replace('_', '-')
                        self.elt.setAttributeNS(null, arg, value)
                    }catch(err){
                        throw ValueError.$factory("can't set attribute " + arg)
                    }
                }
            }
        }
    }

    dict.__mro__ = [$B.DOMNode, $B.builtins.object]

    dict.__new__ = function(cls){
        var res = $B.DOMNode.$factory(document.createElementNS($svgNS, tagName))
        res.__class__ = cls
        return res
    }

    dict.$factory = function(){
        var res = $B.DOMNode.$factory(
            document.createElementNS($svgNS, tagName))
        res.__class__ = dict
        // apply __init__
        dict.__init__(res, ...arguments)
        return res
    }

    $B.set_func_names(dict, "browser.svg")

    return dict
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
for(var i = 0, len = $svg_tags.length; i < len; i++){
    var tag = $svg_tags[i]
    obj[tag] = makeTagDict(tag)
}
return obj
})(__BRYTHON__)
