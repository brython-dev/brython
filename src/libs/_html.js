// creation of an HTML element
var $module = (function($B){

var _b_ = $B.builtins
var $TagSumDict = $B.$TagSum.$dict

var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

//for(var $py_builtin in _b_) eval("var "+$py_builtin+"=_b_[$py_builtin]")

function makeTagDict(tagName){
    // return the dictionary for the class associated with tagName
    var dict = {__class__:$B.$type,
        __name__:tagName
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
                for(var i=0;i<first.children.length;i++){
                    self.elt.appendChild(first.children[i].elt)
                }
            } else { // argument is another DOMNode instance
                try{self.elt.appendChild(first.elt)}
                catch(err){throw ValueError('wrong element '+first)}
            }
        }

        // attributes
        try {
            itr = $B.$dict_iterator($ns['kw'])
            while (true) {
                itm = itr.next()
                var arg = itm[0]
                var value = itm[1]
                if(arg.toLowerCase().substr(0,2)==="on"){ 
                    // Event binding passed as argument "onclick", "onfocus"...
                    // Better use method bind of DOMNode objects
                    var js = '$B.DOMNode.bind(self,"'
                    js += arg.toLowerCase().substr(2)
                    eval(js+'",function(){'+value+'})')
                }else if(arg.toLowerCase()=="style"){
                    $B.DOMNode.set_style(self,value)
                } else {
                    if(value!==false){
                        // option.selected=false sets it to true :-)
                        try{
                            arg = arg.toLowerCase()
                            self.elt.setAttribute(arg,value)
                            if(arg=="class"){ // for IE
                                self.elt.setAttribute("className",value)
                            }
                        }catch(err){
                            throw ValueError("can't set attribute "+arg)
                        }
                    }
                }
            }
        } catch (err) {
            if (err.__name__ !== "StopIteration") { throw err } else { $B.$pop_exc() }
        }
    }

    dict.__mro__ = [dict,$B.DOMNode,$B.builtins.object.$dict]

    dict.__new__ = function(cls){
        // __new__ must be defined explicitely : it returns an instance of
        // DOMNode for the specified tagName
        var res = $B.$DOMNode(document.createElement(tagName))
        res.__class__ = cls.$dict
        return res
    }

    return dict
}


// the classes used for tag sums, $TagSum and $TagSumClass 
// are defined in py_dom.js

function makeFactory(tagName){
    var factory = function(){
        var res = $B.$DOMNode(document.createElement(tagName))
        res.__class__ = dicts[tagName]
        // apply __init__
        var args = [res]
        for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
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
for(var i=0;i<$tags.length;i++){
    var tag = $tags[i]
    dicts[tag]=makeTagDict(tag)
    obj[tag] = makeFactory(tag)
    dicts[tag].$factory = obj[tag]
}
return obj
})(__BRYTHON__)
