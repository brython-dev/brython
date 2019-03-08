 ;(function($B) {
     var _b_ = $B.builtins
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
        __initialized__: true,
        __package__: 'browser',
        __file__: $B.brython_path.replace(/\/*$/g,'') +
            '/Lib/browser/__init__.py',
        console: $B.JSObject.$factory(self.console),
        win: $B.win,
        $$window: $B.win,
    }
    browser.__path__ = browser.__file__

    if(! $B.isa_web_worker ){
        update(browser, {
            $$alert:function(message){window.alert($B.builtins.str.$factory(message))},
            bind:function(){
                // bind(element, event) is a decorator for callback function
                var $ = $B.args("bind", 2, {elt: null, evt: null}, ["elt", "evt"],
                    arguments, {}, null, null)
                return function(callback){
                    if($.elt.__class__ === $B.JSObject){ // eg window
                        $B.$call($B.$getattr($.elt, "bind"))($.evt, callback)
                        return callback
                    }else if(_b_.isinstance($.elt, $B.DOMNode)){
                        // DOM element
                        $B.DOMNode.bind($.elt, $.evt, callback)
                        return callback
                    }else if(_b_.isinstance($.elt, _b_.str)){
                        // string interpreted as a CSS selector
                        var items = document.querySelectorAll($.elt)
                        for(var i = 0; i < items.length; i++){
                            $B.DOMNode.bind($B.DOMNode.$factory(items[i]),
                                $.evt, callback)
                        }
                        return callback
                    }
                    try{
                        var it = $B.$iter($.elt)
                        while(true){
                            try{
                                var elt = _b_.next(it)
                                $B.DOMNode.bind(elt, $.evt, callback)
                            }catch(err){
                                if(_b_.isinstance(err, _b_.StopIteration)){
                                    break
                                }
                                throw err
                            }
                        }
                    }catch(err){
                        if(_b_.isinstance(err, _b_.AttributeError)){
                            $B.DOMNode.bind($.elt, $.evt, callback)
                        }
                        throw err
                    }
                    return callback
                }
            },
            confirm: $B.JSObject.$factory(window.confirm),
            $$document:$B.DOMNode.$factory(document),
            doc: $B.DOMNode.$factory(document), // want to use document instead of doc
            DOMEvent:$B.DOMEvent,
            DOMNode:$B.DOMNode.$factory,
            load:function(script_url){
                // Load and eval() the Javascript file at script_url
                var file_obj = $B.builtins.open(script_url)
                var content = $B.builtins.getattr(file_obj, 'read')()
                eval(content)
            },
            mouseCoords: function(ev){return $B.JSObject.$factory($mouseCoords(ev))},
            prompt: function(message, default_value){
                return $B.JSObject.$factory(window.prompt(message, default_value||''))
            },
            reload: function(){
                // Javascripts in the page
                var scripts = document.getElementsByTagName('script'),
                    js_scripts = []
                scripts.forEach(function(script){
                    if(script.type === undefined ||
                            script.type == 'text/javascript'){
                        js_scripts.push(script)
                        if(script.src){
                            console.log(script.src)
                        }
                    }
                })
                console.log(js_scripts)
                // Check if imported scripts have been modified
                for(var mod in $B.imported){
                    if($B.imported[mod].$last_modified){
                        console.log('check', mod, $B.imported[mod].__file__,
                            $B.imported[mod].$last_modified)
                    }else{
                        console.log('no date for mod', mod)
                    }
                }
            },
            run_script: function(){
                var $ = $B.args("run_script", 2, {src: null, name: null},
                    ["src", "name"], arguments, {name: "script_" + $B.UUID()},
                    null, null)
                $B.run_script($.src, $.name, true)
            },
            URLParameter:function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            results = results === null ? "" :
                decodeURIComponent(results[1].replace(/\+/g, " "));
            return $B.builtins.str.$factory(results);
            }
        })

        // creation of an HTML element
        modules['browser.html'] = (function($B){

            var _b_ = $B.builtins
            var TagSum = $B.TagSum

            function makeTagDict(tagName){
                // return the dictionary for the class associated with tagName
                var dict = {
                    __class__: _b_.type,
                    $infos:{
                        __name__: tagName,
                        __module__: "browser.html"
                    }
                }

                dict.__init__ = function(){
                    var $ns = $B.args('pow', 1, {self: null}, ['self'],
                        arguments, {}, 'args', 'kw'),
                        self = $ns['self'],
                        args = $ns['args']
                    if(args.length == 1){
                        var first = args[0]
                        if(_b_.isinstance(first,[_b_.str,_b_.int,_b_.float])){
                            // set "first" as HTML content (not text)
                            self.elt.innerHTML = _b_.str.$factory(first)
                        }else if(first.__class__ === TagSum){
                            for(var i = 0, len = first.children.length; i < len; i++){
                                self.elt.appendChild(first.children[i].elt)
                            }
                        }else{
                            if(_b_.isinstance(first, $B.DOMNode)){
                                self.elt.appendChild(first.elt)
                            }else{
                                try{
                                    // If the argument is an iterable other than
                                    // str, add the items
                                    var items = _b_.list.$factory(first)
                                    items.forEach(function(item){
                                        $B.DOMNode.__le__(self, item)
                                    })
                                }catch(err){
                                    console.log(err)
                                    console.log("first", first)
                                    throw _b_.ValueError.$factory(
                                        'wrong element ' + first)
                                }
                            }
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
                            eval(js + '",function(){' + value + '})')
                        }else if(arg.toLowerCase() == "style"){
                            $B.DOMNode.set_style(self,value)
                        }else{
                            if(value !== false){
                                // option.selected = false sets it to true :-)
                                try{
                                    arg = arg.replace('_', '-')
                                    self.elt.setAttribute(arg, value)
                                }catch(err){
                                    throw _b_.ValueError.$factory(
                                        "can't set attribute " + arg)
                                }
                            }
                        }
                    }
                }

                dict.__mro__ = [$B.DOMNode, $B.builtins.object]

                dict.__new__ = function(cls){
                    // __new__ must be defined explicitely : it returns an instance of
                    // DOMNode for the specified tagName
                    if(cls.$elt_wrap !== undefined) {
                        // DOMNode is piggybacking on us to autogenerate a node
                        var elt = cls.$elt_wrap  // keep track of the to wrap element
                        cls.$elt_wrap = undefined  // nullify for later calls
                        var res = $B.DOMNode.$factory(elt, true)  // generate the wrapped DOMNode
                        res._wrapped = true  // marked as wrapped
                    }else{
                        var res = $B.DOMNode.$factory(document.createElement(tagName), true)
                        res._wrapped = false  // not wrapped
                    }
                    res.__class__ = cls
                    res.__dict__ = _b_.dict.$factory()
                    return res
                }
                $B.set_func_names(dict, "browser.html")
                return dict
            }

            function makeFactory(klass){
                var factory = function(){
                    if(klass.$elt_wrap !== undefined) {
                        // DOMNode is piggybacking on us to autogenerate a node
                        var elt = klass.$elt_wrap  // keep track of the to wrap element
                        klass.$elt_wrap = undefined  // nullify for later calls
                        var res = $B.DOMNode.$factory(elt, true)  // generate the wrapped DOMNode
                        res._wrapped = true  // marked as wrapped
                    }else{
                        if(klass.$infos.__name__ == 'SVG'){
                            var res = $B.DOMNode.$factory(document.createElementNS("http://www.w3.org/2000/svg", "svg"), true)
                        }else{
                            var res = $B.DOMNode.$factory(document.createElement(klass.$infos.__name__), true)
                        }
                        res._wrapped = false  // not wrapped
                    }
                    res.__class__ = klass
                    // apply __init__
                    klass.__init__(res, ...arguments)
                    return res
                }
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
            var obj = {tags:_b_.dict.$factory()},
                dicts = {}

            // register tags in DOMNode to autogenerate tags when DOMNode is invoked
            $B.DOMNode.tags = obj.tags

            function maketag(tag){
                if(!(typeof tag == 'string')){
                    throw _b_.TypeError.$factory("html.maketag expects a string as argument")
                }
                var klass = dicts[tag] = makeTagDict(tag)
                klass.$factory = makeFactory(klass)
                obj.tags.$string_dict[tag] = klass
                return klass
            }

            tags.forEach(function(tag){
                obj[tag] = maketag(tag)
            })

            // expose function maketag to generate arbitrary tags (issue #624)
            obj.maketag = maketag

            return obj
        })(__BRYTHON__)
    }else{
        // In a web worker, name "window" is not defined, but name "self" is
        delete browser.$$window
        delete browser.win
        browser.self = $B.win
    }

    modules['browser'] = browser

    modules['javascript'] = {
        //__file__:$B.brython_path + '/libs/javascript.js',
        $$this: function(){
            // returns the content of Javascript "this"
            // $B.js_this is set to "this" at the beginning of each function
            if($B.js_this === undefined){return $B.builtins.None}
            return $B.JSObject.$factory($B.js_this)
        },
        JSObject: function(){
            console.log('"javascript.JSObject" is deprecrated. ' +
                'Use window.<jsobject name> instead.')
            return $B.JSObject.$factory(...arguments)
        },
        JSConstructor: function(){
            console.log('"javascript.JSConstructor" is deprecrated. ' +
                'Use window.<js constructor name>.new() instead.')
            return $B.JSConstructor.$factory.apply(null, arguments)
        },
        load:function(script_url){
            console.log('"javascript.load" is deprecrated. ' +
                'Use browser.load instead.')
            // Load and eval() the Javascript file at script_url
            // Set the names in array "names" in the Javacript global namespace
            var file_obj = $B.builtins.open(script_url)
            var content = $B.builtins.getattr(file_obj, 'read')()
            eval(content)
        },
        NULL: null,
        py2js: function(src, module_name){
            if(module_name === undefined){
                module_name = '__main__' + $B.UUID()
            }
            return $B.py2js(src, module_name, module_name,
                $B.builtins_scope).to_js()
        },
        pyobj2jsobj:function(obj){ return $B.pyobj2jsobj(obj)},
        jsobj2pyobj:function(obj){ return $B.jsobj2pyobj(obj)},
        UNDEFINED: undefined
    }

    // _sys module is at the core of Brython since it is paramount for
    // the import machinery.
    // see https://github.com/brython-dev/brython/issues/189
    // see https://docs.python.org/3/reference/toplevel_components.html#programs
    var _b_ = $B.builtins
    modules['_sys'] = {
        //__file__:$B.brython_path + '/src/builtin_modules.js',
        // Called "Getframe" because "_getframe" wouldn't be imported in
        // sys.py with "from _sys import *"
        Getframe : function(depth){
            return $B._frame.$factory($B.frames_stack, depth)
        },
        exc_info: function(){
            for(var i = $B.frames_stack.length - 1; i >=0; i--){
                var frame = $B.frames_stack[i],
                    exc = frame[1].$current_exception
                if(exc){
                    return _b_.tuple.$factory([exc.__class__, exc,
                        $B.$getattr(exc, "traceback")])
                }
            }
            return _b_.tuple.$factory([_b_.None, _b_.None, _b_.None])
        },
        modules: {
            __get__: function(){
                return $B.obj_dict($B.imported)
            },
            __set__: function(self, obj, value){
                 throw _b_.TypeError.$factory("Read only property 'sys.modules'")
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
                return _b_.dict.$factory($B.JSObject.$factory($B.path_importer_cache))
            },
            __set__: function(self, obj, value){
                throw _b_.TypeError.$factory("Read only property" +
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
        stdin : $B.stdin,
        vfs: {
            __get__: function(){
                if($B.hasOwnProperty("VFS")){return $B.obj_dict($B.VFS)}
                else{return _b_.None}
            },
            __set__: function(){
                throw _b_.TypeError.$factory("Read only property 'sys.vfs'")
            }
        }
    }

    function load(name, module_obj){
        // add class and __str__
        module_obj.__class__ = $B.module
        //module_obj.__file__ = '<builtin>'
        module_obj.__name__ = name
        $B.imported[name] = module_obj
        // set attribute "name" of functions
        for(var attr in module_obj){
            if(typeof module_obj[attr] == 'function'){
                var name = attr
                while(name.charAt(0) == '$'){name = name.substr(1)}
                module_obj[attr].$infos = {__name__:name}
            }
        }
    }

    for(var attr in modules){load(attr, modules[attr])}
    if(! $B.isa_web_worker){modules['browser'].html = modules['browser.html']}

    var _b_ = $B.builtins

    // Set builtin name __builtins__
    _b_.__builtins__ = $B.module.$factory('__builtins__',
        'Python builtins')

    for(var attr in _b_){
        _b_.__builtins__[attr] = _b_[attr]
        $B.builtins_scope.binding[attr] = true
    }
    _b_.__builtins__.__setattr__ = function(attr, value){
        _b_[attr] = value
    }

    $B.method_descriptor.__getattribute__ = $B.Function.__getattribute__
    $B.wrapper_descriptor.__getattribute__ = $B.Function.__getattribute__

    // Set type of methods of builtin classes
    for(var name in _b_){
        if(_b_[name].__class__ === _b_.type){
            $B.builtin_classes.push(_b_[name]) // defined in brython_builtins.js
            for(var key in _b_[name]){
                var value = _b_[name][key]
                if(value === undefined){continue}
                else if(value.__class__){continue}
                else if(typeof value != "function"){continue}
                else if(key == "__new__"){
                    value.__class__ = $B.builtin_function
                }else if(key.startsWith("__")){
                    value.__class__ = $B.wrapper_descriptor
                }else{
                    value.__class__ = $B.method_descriptor
                }
                value.__objclass__ = _b_[name]
            }
        }
    }
    // Attributes of __BRYTHON__ are Python lists
    for(var attr in $B){
        if(Array.isArray($B[attr])){
            $B[attr].__class__ = _b_.list
        }
    }

    // Cell objects, for free variables in functions
    // Must be defined after dict, because property uses it
    $B.cell = $B.make_class("cell",
        function(value){
            return {
                __class__: $B.cell,
                $cell_contents: value
            }
        }
    )

    $B.cell.cell_contents = $B.$call(_b_.property)(
        function(self){
            if(self.$cell_contents === null){
                throw _b_.ValueError.$factory("empty cell")
            }
            return self.$cell_contents
        },
        function(self, value){
            self.$cell_contents = value
        }
    )

    var $comps = Object.values($B.$comps).concat(["eq", "ne"])
    $comps.forEach(function(comp){
        var op = "__" + comp + "__"
        $B.cell[op] = (function(op){
            return function(self, other){
                if(! _b_.isinstance(other, $B.cell)){
                    return NotImplemented
                }
                if(self.$cell_contents === null){
                    if(other.$cell_contents === null){
                        return op == "__eq__"
                    }else{
                        return ["__ne__", "__lt__", "__le__"].indexOf(op) > -1
                    }
                }else if(other.$cell_contents === null){
                    return ["__ne__", "__gt__", "__ge__"].indexOf(op) > -1
                }
                return $B.rich_comp(op, self.$cell_contents, other.$cell_contents)
            }
        })(op)
    })

    $B.set_func_names($B.cell, "builtins")

})(__BRYTHON__)
