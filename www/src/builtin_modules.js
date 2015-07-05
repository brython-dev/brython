;(function($B) {
    var modules = {}
    modules['_browser'] = {
        $package: true,
        $is_package: true,
        __package__:'browser',
        __file__:$B.brython_path+'/Lib/browser/__init__.py',
        alert:function(message){window.alert($B.builtins.str(message))},
        confirm: $B.JSObject(window.confirm),
        console:$B.JSObject(window.console),
        document:$B.DOMNode(document),
        doc: $B.DOMNode(document),   //want to use document instead of doc
        DOMEvent:$B.DOMEvent,
        DOMNode:$B.DOMNode,
        mouseCoords: function(ev){return $B.JSObject($mouseCoords(ev))},
        prompt: function(message, default_value){
            return $B.JSObject(window.prompt(message, default_value||''))
        },
        win: $B.win,
        window: $B.win,
        URLParameter:function(name) {
           name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
           var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
               results = regex.exec(location.search);
           results= results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
           return $B.builtins.str(results);
        }
    }

    // creation of an HTML element
    modules['browser.html'] = (function($B){
    
        var _b_ = $B.builtins
        var $TagSumDict = $B.$TagSum.$dict
        
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
                        js += arg.toLowerCase().substr(2)
                        eval(js+'",function(){'+value+'})')
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

    modules['javascript'] = {
        __file__:$B.brython_path+'/libs/javascript.js',
        JSObject: $B.JSObject,
        JSConstructor: $B.JSConstructor,
        console: $B.JSObject(window.console),
        load:function(script_url, names){
            // Load and eval() the Javascript file at script_url
            // Set the names in array "names" in the Javacript global namespace
            var file_obj = $B.builtins.open(script_url)
            var content = $B.builtins.getattr(file_obj, 'read')()
            eval(content)
            if(names!==undefined){
                if(!Array.isArray(names)){
                    throw $B.builtins.TypeError("argument 'names' should be a list, not '"+$B.get_class(names).__name__)
                }else{
                    for(var i=0;i<names.length;i++){
                        try{window[names[i]]=eval(names[i])}
                        catch(err){throw $B.builtins.NameError("name '"+names[i]+"' not found in script "+script_url)}
                    }
                }
            }
        },
        py2js: function(src){return $B.py2js(src).to_js()},
        pyobj2jsobj:function(obj){ return $B.pyobj2jsobj(obj)},
        jsobj2pyobj:function(obj){ return $B.jsobj2pyobj(obj)}
    }

    // _sys module is at the core of Brython since it is paramount for
    // the import machinery.
    // see https://github.com/brython-dev/brython/issues/189
    // see https://docs.python.org/3/reference/toplevel_components.html#programs
    var _b_=$B.builtins
    modules['_sys'] = {
        __file__:$B.brython_path+'/libs/_sys.js',
        // Called "Getframe" because "_getframe" wouldn't be imported in 
        // sys.py with "from _sys import *"
        Getframe : function(depth){
            return $B._frame($B.frames_stack, depth)
        },
        modules :
            {'__get__':function(){return _b_.dict($B.JSObject($B.imported))},
             '__set__':function(self, obj, value){ throw _b_.TypeError("Read only property 'sys.modules'") }
            },
        path: 
            {'__get__':function(){return $B.path},
             '__set__':function(self, obj, value){ $B.path = value }
            },
        meta_path: 
            {'__get__':function(){return $B.meta_path},
             '__set__':function(self, obj, value){ $B.meta_path = value }
            },
        path_hooks: 
            {'__get__':function(){return $B.path_hooks},
             '__set__':function(self, obj, value){ $B.path_hooks = value }
            },
        path_importer_cache: 
            {'__get__':function(){return _b_.dict($B.JSObject($B.path_importer_cache))},
             '__set__':function(self, obj, value){ throw _b_.TypeError("Read only property 'sys.path_importer_cache'") }
            },
        stderr : {
            __get__:function(){return $B.stderr},
            __set__:function(self, obj, value){$B.stderr = value},
            write:function(data){_b_.getattr($B.stderr,"write")(data)}
            },
        stdout : {
            __get__:function(){return $B.stdout},
            __set__:function(self, obj, value){$B.stdout = value},
            write:function(data){_b_.getattr($B.stdout,"write")(data)}
            },
        stdin : $B.stdin
    }

    function load(name, module_obj){
        // add class and __str__
        module_obj.__class__ = $B.$ModuleDict
        //module_obj.__file__ = '<builtin>'
        module_obj.__name__ = name
        module_obj.__repr__ = module_obj.__str__ = function(){
            return "<module '"+name+"' (built-in)>"
        }
        $B.imported[name] = $B.modules[name] = module_obj
    }

    for(var attr in modules){load(attr, modules[attr])}
          
})(__BRYTHON__)

