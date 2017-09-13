 ;(function($B) {
    var update = function(mod, data) {
        for(attr in data) {
            mod[attr] = data[attr]
        }
    }
    var _window = self;
    var modules = {}
    var browser = {
        $package: true,
        $is_package: true,
        __package__:'browser',
        __file__:$B.brython_path.replace(/\/*$/g,'')+'/Lib/browser/__init__.py',
        console:$B.JSObject(self.console),
        win: $B.win,
        $$window: $B.win,
    }
    browser.__path__ = browser.__file__

    if (! $B.isa_web_worker ) {
        update(browser, {
            $$alert:function(message){window.alert($B.builtins.str(message))},
            confirm: $B.JSObject(window.confirm),
            $$document:$B.DOMNode(document),
            doc: $B.DOMNode(document),   //want to use document instead of doc
            DOMEvent:$B.DOMEvent,
            DOMNode:$B.DOMNode,
            load:function(script_url, names){
                // Load and eval() the Javascript file at script_url
                // Set the names in array "names" in the Javacript global namespace
                var file_obj = $B.builtins.open(script_url)
                var content = $B.builtins.getattr(file_obj, 'read')()
                eval(content)
                if(names!==undefined){
                    if(!Array.isArray(names)){
                        throw $B.builtins.TypeError("argument 'names' should be a"+
                            " list, not '"+$B.get_class(names).__name__)
                    }else{
                        for(var i=0;i<names.length;i++){
                            try{_window[names[i]]=eval(names[i])}
                            catch(err){throw $B.builtins.NameError("name '"+
                                names[i]+"' not found in script "+script_url)}
                        }
                    }
                }
            },
            mouseCoords: function(ev){return $B.JSObject($mouseCoords(ev))},
            prompt: function(message, default_value){
                return $B.JSObject(window.prompt(message, default_value||''))
            },
            reload: function(){
                // Javascripts in the page
                var scripts = document.getElementsByTagName('script'),
                    js_scripts = []
                for(var i=0;i<scripts.length;i++){
                    if(scripts[i].type===undefined ||
                        scripts[i].type=='text/javascript'){
                        js_scripts.push(scripts[i])
                        if(scripts[i].src){
                            console.log(scripts[i].src)
                        }
                    }
                }
                console.log(js_scripts)
                // Python scripts in current page
                for(var i=0;i<$B.scripts.length;i++){
                    var name = $B.scripts[i]
                    console.log('script:', name)
                }
                // Check if imported scripts have been modified
                for(var mod in $B.imported){
                    if($B.imported[mod].$last_modified){
                        console.log('check', mod, $B.imported[mod].__file__, $B.imported[mod].$last_modified)
                    }else{
                        console.log('no date for mod', mod)
                    }
                }
            },
            select: function(css_selector){
                var elts = document.querySelectorAll(css_selector),
                    DOMNode = $B.DOMNodeDict.$factory,
                    res = []
                for(var i=0;i<elts.length;i++){
                    res.push(DOMNode(elts[i]))
                }
                return res
            },
            URLParameter:function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            results= results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            return $B.builtins.str(results);
            }
        })
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
                    var $ns=$B.args('pow',1,{self:null},['self'],arguments,
                        {},'args','kw'),
                        self = $ns['self'],
                        args = $ns['args']
                    if(args.length==1){
                        var first=args[0]
                        if(_b_.isinstance(first,[_b_.str,_b_.int,_b_.float])){
                            // set "first" as HTML content (not text)
                            self.elt.innerHTML = _b_.str(first)
                        } else if(first.__class__===$TagSumDict){
                            for(var i=0, len = first.children.length; i < len;i++){
                                self.elt.appendChild(first.children[i].elt)
                            }
                        } else {
                            if(_b_.isinstance(first, $B.DOMNode)){
                                self.elt.appendChild(first.elt)
                            }else{
                                try{
                                    // If the argument is an iterable other than
                                    // str, add the items
                                    var items = _b_.list(first)
                                    for(var i=0;i<items.length;i++){
                                        $B.DOMNode.$dict.__le__(self, items[i])
                                    }
                                }catch(err){
                                    throw _b_.ValueError('wrong element '+first)
                                }
                            }
                        }
                    }

                    // attributes
                    var items = _b_.list(_b_.dict.$dict.items($ns['kw']))
                    for(var i=0, len = items.length; i < len;i++){
                        // keyword arguments
                        var arg = items[i][0],
                            value = items[i][1]
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
                                    arg = arg.replace('_','-')
                                    $B.DOMNodeDict.__setattr__(self, arg, value)
                                }catch(err){
                                    throw _b_.ValueError("can't set attribute "+arg)
                                }
                            }
                        }
                    }
                }

                dict.__mro__ = [$B.DOMNodeDict, $B.builtins.object.$dict]

                dict.__new__ = function(cls){
                    // __new__ must be defined explicitely : it returns an instance of
                    // DOMNode for the specified tagName
                    if(cls.$dict.$elt_wrap !== undefined) {
                        // DOMNode is piggybacking on us to autogenerate a node
                        var elt = cls.$dict.$elt_wrap  // keep track of the to wrap element
                        cls.$dict.$elt_wrap = undefined  // nullify for later calls
                        var res = $B.DOMNode(elt, true)  // generate the wrapped DOMNode
                        res._wrapped = true  // marked as wrapped
                    } else {
                        var res = $B.DOMNode(document.createElement(tagName), true)
                        res._wrapped = false  // not wrapped
                    }
                    res.__class__ = cls.$dict
                    return res
                }
                return dict
            }

            // the classes used for tag sums, $TagSum and $TagSumClass
            // are defined in py_dom.js

            function makeFactory(tagName){
                var factory = function(){
                    if(factory.$dict.$elt_wrap !== undefined) {
                        // DOMNode is piggybacking on us to autogenerate a node
                        var elt = factory.$dict.$elt_wrap  // keep track of the to wrap element
                        factory.$dict.$elt_wrap = undefined  // nullify for later calls
                        var res = $B.DOMNode(elt, true)  // generate the wrapped DOMNode
                        res._wrapped = true  // marked as wrapped
                    } else {
                        if(tagName=='SVG'){
                            var res = $B.DOMNode(document.createElementNS("http://www.w3.org/2000/svg", "svg"), true)
                        }else{
                            var res = $B.DOMNode(document.createElement(tagName), true)
                        }
                        res._wrapped = false  // not wrapped
                    }
                    res.__class__ = dicts[tagName]
                    // apply __init__
                    var args = [res].concat(Array.prototype.slice.call(arguments))
                    dicts[tagName].__init__.apply(null, args)
                    return res
                }
                factory.__class__=$B.$factory
                factory.$dict = dicts[tagName]
                return factory
            }

            // All HTML 4, 5.x extracted from
            // https://w3c.github.io/elements-of-html/
            // HTML4.01 tags
            var tags = ['A','ABBR','ACRONYM','ADDRESS','APPLET','AREA','B','BASE',
                        'BASEFONT','BDO','BIG','BLOCKQUOTE','BODY','BR','BUTTON',
                        'CAPTION','CENTER','CITE','CODE','COL','COLGROUP','DD',
                        'DEL','DFN','DIR','DIV','DL','DT','EM','FIELDSET','FONT',
                        'FORM','FRAME','FRAMESET','H1','H2','H3','H4','H5','H6',
                        'HEAD','HR','HTML','I','IFRAME','IMG','INPUT','INS',
                        'ISINDEX','KBD','LABEL','LEGEND','LI','LINK','MAP','MENU',
                        'META','NOFRAMES','NOSCRIPT','OBJECT','OL','OPTGROUP',
                        'OPTION','P','PARAM','PRE','Q','S','SAMP','SCRIPT','SELECT',
                        'SMALL','SPAN','STRIKE','STRONG','STYLE','SUB','SUP', 'SVG',
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

            // Module has an attribute "tags" : a dictionary that maps all tag
            // names to the matching tag class factory function.
            var obj = {tags:_b_.dict()},
                dicts = {}

            // register tags in DOMNode to autogenerate tags when DOMNode is invoked
            $B.DOMNodeDict.tags = obj.tags

            function maketag(tag){
                if(!(typeof tag=='string')){
                    throw _b_.TypeError("html.maketag expects a string as argument")
                }
                dicts[tag] = makeTagDict(tag)
                var factory = makeFactory(tag)
                dicts[tag].$factory = factory
                obj.tags.$string_dict[tag] = factory
                return factory
            }

            for(var i=0, len = tags.length; i < len;i++){
                obj[tags[i]] = maketag(tags[i])
            }

            // expose function maketag to generate arbitrary tags (issue #624)
            obj.maketag = maketag

            return obj
        })(__BRYTHON__)
    }

    modules['browser'] = browser

    modules['javascript'] = {
        __file__:$B.brython_path+'/libs/javascript.js',
        $$this: function(){
            // returns the content of Javascript "this"
            // $B.js_this is set to "this" at the beginning of each function
            if($B.js_this===undefined){return $B.builtins.None}
            return $B.JSObject($B.js_this)
        },
        JSObject: function(){
            console.log('"javascript.JSObject" is deprecrated. '+
                'Please refer to the documentation.')
            return $B.JSObject.apply(null, arguments)
        },
        JSConstructor: function(){
            console.log('"javascript.JSConstructor" is deprecrated. '+
                'Please refer to the documentation.')
            return $B.JSConstructor.apply(null, arguments)
        },
        load:function(script_url, names){
            console.log('"javascript.load" is deprecrated. '+
                'Please refer to the documentation.')
            // Load and eval() the Javascript file at script_url
            // Set the names in array "names" in the Javacript global namespace
            var file_obj = $B.builtins.open(script_url)
            var content = $B.builtins.getattr(file_obj, 'read')()
            eval(content)
            if(names!==undefined){
                if(!Array.isArray(names)){
                    throw $B.builtins.TypeError("argument 'names' should be a"+
                        " list, not '"+$B.get_class(names).__name__)
                }else{
                    for(var i=0;i<names.length;i++){
                        try{_window[names[i]]=eval(names[i])}
                        catch(err){throw $B.builtins.NameError("name '"+
                            names[i]+"' not found in script "+script_url)}
                    }
                }
            }
        },
        py2js: function(src, module_name){
            if (module_name===undefined) {
                module_name = '__main__'+$B.UUID()
            }
            return $B.py2js(src, module_name, module_name,
                '__builtins__').to_js()
        },
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
        modules: {
            __get__: function(){return _b_.dict($B.JSObject($B.imported))},
            __set__: function(self, obj, value){
                 throw _b_.TypeError("Read only property 'sys.modules'")
             }
        },
        path: {
            __get__: function(){return $B.path},
            __set__: function(self, obj, value){
                 $B.path = value;
            }
        },
        meta_path: {
            __get__: function(){return $B.meta_path},
            __set__: function(self, obj, value){ $B.meta_path = value }
        },
        path_hooks: {
            __get__: function(){return $B.path_hooks},
            __set__: function(self, obj, value){ $B.path_hooks = value }
        },
        path_importer_cache: {
            __get__: function(){
                return _b_.dict($B.JSObject($B.path_importer_cache))
            },
            __set__: function(self, obj, value){
                throw _b_.TypeError("Read only property"+
                    " 'sys.path_importer_cache'")
            }
        },
        stderr: {
            __get__: function(){return $B.stderr},
            __set__: function(self, obj, value){$B.stderr = value},
            write: function(data){_b_.getattr($B.stderr,"write")(data)}
        },
        stdout: {
            __get__: function(){return $B.stdout},
            __set__: function(self, obj, value){$B.stdout = value},
            write: function(data){_b_.getattr($B.stdout,"write")(data)}
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
        // set attribute "name" of functions
        for(var attr in module_obj){
            if(typeof module_obj[attr] == 'function'){
                var name = attr
                while(name.charAt(0)=='$'){name=name.substr(1)}
                module_obj[attr].$infos = {__name__:name}
            }
        }
    }

    for(var attr in modules){load(attr, modules[attr])}
    if (! $B.isa_web_worker) modules['browser'].html = modules['browser.html'];

    var _b_ = $B.builtins

    // Set builtin name __builtins__
    _b_.__builtins__ = $B.$ModuleDict.$factory('__builtins__',
        'Python builtins')
    for(var attr in $B.builtins){
        _b_.__builtins__[attr] = _b_[attr]
    }
    _b_.__builtins__.__setattr__ = function(attr, value){
        _b_[attr] = value
    }
    $B.bound.__builtins__.__builtins__ = _b_.__builtins__

})(__BRYTHON__)
