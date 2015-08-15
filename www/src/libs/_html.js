// creation of an HTML element
var $module = (function($B){

var _b_ = $B.builtins
var $TagSumDict = $B.$TagSum.$dict

function makeTagDict(tagName){
    // return the dictionary for the class associated with tagName
    var dict = {__class__:$B.$type,
        __name__:tagName
        }

    dict.__init__ = function(){
        var $ns=$B.$MakeArgs1('pow',1,{self:null},['self'],
            arguments,{},'args','kw')
        var self = $ns['self']
        var args = $ns['args']
        if(args.length==1){
            var first=args[0]
            if(_b_.isinstance(first,[_b_.str,_b_.int,_b_.float])){
                self.elt.appendChild(document.createTextNode(_b_.str(first)))
            } else if(first.__class__===$TagSumDict){
                for(var i=0, _len_i = first.children.length; i < _len_i;i++){
                    self.elt.appendChild(first.children[i].elt)
                }
            } else { // argument is another DOMNode instance
                try{self.elt.appendChild(first.elt)}
                catch(err){throw _b_.ValueError('wrong element '+first)}
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
                var js = '$B.DOMNodeDict.bind(self,"'
                js += arg.toLowerCase().substr(2)+'",function(){eval("'+value+'")})'
                eval(js)
            }else if(arg.toLowerCase()=="style"){
                $B.DOMNodeDict.set_style(self,value)
            } else {
                if(value!==false){
                    // option.selected=false sets it to true :-)
                    try{
                        arg = arg.toLowerCase().replace('_','-')
                        self.elt.setAttribute(arg,value)
                    }catch(err){
                        throw _b_.ValueError("can't set attribute "+arg)
                    }
                }
            }
        }
    }

    dict.__mro__ = [dict,$B.DOMNodeDict,$B.builtins.object.$dict]

    dict.__new__ = function(cls){
        // __new__ must be defined explicitely : it returns an instance of
        // DOMNode for the specified tagName
        var res = $B.DOMNode(document.createElement(tagName))
        res.__class__ = cls.$dict
        return res
    }

    return dict
}


// the classes used for tag sums, $TagSum and $TagSumClass 
// are defined in py_dom.js

function makeFactory(tagName){
    var factory = function(){
        var res = $B.DOMNode(document.createElement(tagName))
        res.__class__ = dicts[tagName]
        // apply __init__
        var args = [res].concat(Array.prototype.slice.call(arguments))
        dicts[tagName].__init__.apply(null,args)
        return res
    }
    factory.__class__=$B.$factory
    factory.$dict = dicts[tagName]
    return factory
}

// All HTML 4, 5.x extracted from
// https://w3c.github.io/elements-of-html/
// HTML4.01 tags
var $tags = ['A','ABBR','ACRONYM','ADDRESS','APPLET','AREA','B','BASE',
            'BASEFONT','BDO','BIG','BLOCKQUOTE','BODY','BR','BUTTON',
            'CAPTION','CENTER','CITE','CODE','COL','COLGROUP','DD',
            'DEL','DFN','DIR','DIV','DL','DT','EM','FIELDSET','FONT',
            'FORM','FRAME','FRAMESET','H1','H2','H3','H4','H5','H6',
            'HEAD','HR','HTML','I','IFRAME','IMG','INPUT','INS',
            'ISINDEX','KBD','LABEL','LEGEND','LI','LINK','MAP','MENU',
            'META','NOFRAMES','NOSCRIPT','OBJECT','OL','OPTGROUP',
            'OPTION','P','PARAM','PRE','Q','S','SAMP','SCRIPT','SELECT',
            'SMALL','SPAN','STRIKE','STRONG','STYLE','SUB','SUP',
            'TABLE','TBODY','TD','TEXTAREA','TFOOT','TH','THEAD',
            'TITLE','TR','TT','U','UL','VAR',
            // HTML5 tags
            'ARTICLE','ASIDE','AUDIO','BDI','CANVAS','COMMAND','DATA',
            'DATALIST','EMBED','FIGCAPTION','FIGURE','FOOTER','HEADER',
            'KEYGEN','MAIN','MARK','MATH','METER','NAV','OUTPUT',
            'PROGRESS','RB','RP','RT','RTC','RUBY','SECTION','SOURCE',
            'TEMPLATE','TIME','TRACK','VIDEO','WBR',
             // HTML5.1 tags
            'DETAILS','DIALOG','MENUITEM','PICTURE','SUMMARY']

// create classes
var obj = new Object()
var dicts = {}
for(var i=0, _len_i = $tags.length; i < _len_i;i++){
    var tag = $tags[i]
    dicts[tag] = makeTagDict(tag)
    obj[tag] = makeFactory(tag)
    dicts[tag].$factory = obj[tag]
}
$B.tag_classes = dicts
return obj
})(__BRYTHON__)
