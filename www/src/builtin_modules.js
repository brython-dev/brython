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

        bind:function(){
            // bind(element, event) is a decorator for callback function
            var $ = $B.args("bind", 3, {elt: null, evt: null, options: null},
                    ["elt", "evt", "options"], arguments,
                    {options: _b_.None}, null, null)
            var options = $.options
            if(typeof options == "boolean"){}
            else if(options.__class__ === _b_.dict){
                options = options.$string_dict
            }else{
                options == false
            }
            return function(callback){
                if($B.get_class($.elt) === $B.JSObj){
                    // eg window, Web Worker
                    function f(ev){
                        try{
                            return callback($B.JSObj.$factory(ev))
                        }catch(err){
                            $B.handle_error(err)
                        }
                    }
                    $.elt.addEventListener($.evt, f, options)
                    return callback
                }else if(_b_.isinstance($.elt, $B.DOMNode)){
                    // DOM element
                    $B.DOMNode.bind($.elt, $.evt, callback, options)
                    return callback
                }else if(_b_.isinstance($.elt, _b_.str)){
                    // string interpreted as a CSS selector
                    var items = document.querySelectorAll($.elt)
                    for(var i = 0; i < items.length; i++){
                        $B.DOMNode.bind($B.DOMNode.$factory(items[i]),
                            $.evt, callback, options)
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

        console: self.console && $B.JSObj.$factory(self.console),
        self: $B.win,
        win: $B.win,
        $$window: $B.win,
    }
    browser.__path__ = browser.__file__

    if ($B.isNode) {
        delete browser.$$window
        delete browser.win
    }else if($B.isWebWorker){
        browser.is_webworker = true
        // In a web worker, name "window" is not defined, but name "self" is
        delete browser.$$window
        delete browser.win
        // browser.send is an alias for postMessage
        browser.self.send = self.postMessage
    } else {
        browser.is_webworker = false
        update(browser, {
            $$alert:function(message){
                window.alert($B.builtins.str.$factory(message || ""))
            },
            confirm: $B.JSObj.$factory(window.confirm),
            $$document:$B.DOMNode.$factory(document),
            doc: $B.DOMNode.$factory(document), // want to use document instead of doc
            DOMEvent:$B.DOMEvent,
            DOMNode:$B.DOMNode,
            load:function(script_url){
                // Load and eval() the Javascript file at script_url
                var file_obj = $B.builtins.open(script_url)
                var content = $B.$getattr(file_obj, 'read')()
                eval(content)
            },
            mouseCoords: function(ev){return $B.JSObj.$factory($mouseCoords(ev))},
            prompt: function(message, default_value){
                return $B.JSObj.$factory(window.prompt(message, default_value||''))
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
                        if(_b_.isinstance(first,[_b_.str, _b_.int, _b_.float])){
                            // set "first" as HTML content (not text)
                            self.innerHTML = _b_.str.$factory(first)
                        }else if(first.__class__ === TagSum){
                            for(var i = 0, len = first.children.length; i < len; i++){
                                self.appendChild(first.children[i])
                            }
                        }else{
                            if(_b_.isinstance(first, $B.DOMNode)){
                                self.appendChild(first)
                            }else{
                                try{
                                    // If the argument is an iterable other than
                                    // str, add the items
                                    var items = _b_.list.$factory(first)
                                    items.forEach(function(item){
                                        $B.DOMNode.__le__(self, item)
                                    })
                                }catch(err){
                                    if($B.debug > 1){
                                        console.log(err, err.__class__, err.args)
                                        console.log("first", first)
                                        console.log(arguments)
                                    }
                                    $B.handle_error(err)
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
                            $B.DOMNode.set_style(self, value)
                        }else{
                            if(value !== false){
                                // option.selected = false sets it to true :-)
                                try{
                                    // Call attribute mapper (cf. issue#1187)
                                    arg = $B.imported["browser.html"].
                                        attribute_mapper(arg)
                                    self.setAttribute(arg, value)
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
                    res.__dict__ = $B.empty_dict()
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
                            var elt = document.createElement(klass.$infos.__name__),
                                res = $B.DOMNode.$factory(elt, true)
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
            var obj = {tags:$B.empty_dict()},
                dicts = {}

            // register tags in DOMNode to autogenerate tags when DOMNode is invoked
            $B.DOMNode.tags = obj.tags

            function maketag(tag){
                if(!(typeof tag == 'string')){
                    throw _b_.TypeError.$factory("html.maketag expects a string as argument")
                }
                var klass = dicts[tag] = makeTagDict(tag)
                klass.$factory = makeFactory(klass)
                _b_.dict.$setitem(obj.tags, tag, klass)

                return klass
            }

            tags.forEach(function(tag){
                obj[tag] = maketag(tag)
            })

            // expose function maketag to generate arbitrary tags (issue #624)
            obj.maketag = maketag

            // expose function to transform parameters (issue #1187)
            obj.attribute_mapper = function(attr){
                return attr.replace(/_/g, '-')
            }

            return obj
        })(__BRYTHON__)
    }

    modules['browser'] = browser

    // Class for Javascript "undefined"
    $B.UndefinedClass = $B.make_class("Undefined",
        function(){return $B.Undefined}
    )
    $B.UndefinedClass.__mro__ = [_b_.object]
    $B.UndefinedClass.__bool__ = function(self){
        return false
    }
    $B.UndefinedClass.__repr__ = $B.UndefinedClass.__str__ = function(self){
        return "<Javascript undefined>"
    }

    $B.Undefined = {__class__: $B.UndefinedClass}

    $B.set_func_names($B.UndefinedClass, "javascript")

    // Class used by javascript.super()
    var super_class = $B.make_class("JavascriptSuper",
        function(){
            // Use Brython's super() to get a reference to self
            var b_super = _b_.$$super.$factory(),
                b_self = b_super.__self_class__,
                proto = Object.getPrototypeOf(b_self),
                parent = proto.constructor.$parent
            var factory = function(){
                var p = parent.bind(b_self),
                    res
                if(parent.toString().startsWith("class")){
                    res = new p(...arguments)
                }else{
                    res = p(...arguments)
                }
                for(key in res){
                    b_self[$B.to_alias(key)] = res[key]
                }
                return res
            }
            return {
                __class__: super_class,
                __init__: factory,
                __self_class__: b_self
            }
        }
    )

    super_class.__getattribute__ = function(self, attr){
        if(attr == "__init__" || attr == "__call__"){
            return self.__init__
        }
        return $B.$getattr(self.__self_class__, attr)
    }

    $B.set_func_names(super_class, "javascript")

    modules['javascript'] = {
        $$this: function(){
            // returns the content of Javascript "this"
            // $B.js_this is set to "this" at the beginning of each function
            if($B.js_this === undefined){return $B.builtins.None}
            return $B.JSObj.$factory($B.js_this)
        },
        $$Date: self.Date && $B.JSObj.$factory(self.Date),
        $$extends: function(js_constr){
            return function(obj){
                if(obj.$is_class){
                    var factory = function(){
                        var init = $B.$getattr(obj, "__init__", _b_.None)
                        if(init !== _b_.None){
                            init.bind(this, this).apply(this, arguments)
                        }
                        return this
                    }
                    factory.prototype = Object.create(js_constr.prototype)
                    factory.prototype.constructor = factory
                    factory.$parent = js_constr.$js_func
                    factory.$is_class = true // for $B.$call
                    factory.$infos = obj.$infos
                    for(var key in obj){
                        if(typeof obj[key] == "function"){
                            factory.prototype[key] = (function(x){
                                return function(){
                                    // Add "this" as first argument of method
                                    return obj[x].bind(this, this).apply(this,
                                        arguments)
                                }
                            })(key)
                        }
                    }
                    return factory
                }
            }
        },
        JSON: {
            __class__: $B.make_class("JSON"),
            parse: function(){
                return $B.structuredclone2pyobj(
                    JSON.parse.apply(this, arguments))
            },
            stringify: function(obj, replacer, space){
                return JSON.stringify($B.pyobj2structuredclone(obj, false),
                    $B.JSObj.$factory(replacer), space)
            }
        },
        jsobj2pyobj:function(obj){return $B.jsobj2pyobj(obj)},
        load:function(script_url){
            console.log('"javascript.load" is deprecrated. ' +
                'Use browser.load instead.')
            // Load and eval() the Javascript file at script_url
            // Set the names in array "names" in the Javacript global namespace
            var file_obj = $B.builtins.open(script_url)
            var content = $B.$getattr(file_obj, 'read')()
            eval(content)
        },
        $$Math: self.Math && $B.JSObj.$factory(self.Math),
        NULL: null,
        $$Number: self.Number && $B.JSObj.$factory(self.Number),
        py2js: function(src, module_name){
            if(module_name === undefined){
                module_name = '__main__' + $B.UUID()
            }
            return $B.py2js(src, module_name, module_name,
                $B.builtins_scope).to_js()
        },
        pyobj2jsobj:function(obj){return $B.pyobj2jsobj(obj)},
        $$RegExp: self.RegExp && $B.JSObj.$factory(self.RegExp),
        $$String: self.String && $B.JSObj.$factory(self.String),
        $$super: super_class,
        UNDEFINED: $B.Undefined,
        UndefinedType: $B.UndefinedClass
    }

    var arraybuffers = ["Int8Array", "Uint8Array", "Uint8ClampedArray",
        "Int16Array", "Uint16Array", "Int32Array", "Uint32Array",
        "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array"]
    arraybuffers.forEach(function(ab){
        if(self[ab] !== undefined){
            modules['javascript'][ab] = $B.JSObj.$factory(self[ab])
        }
    })

    // _sys module is at the core of Brython since it is paramount for
    // the import machinery.
    // see https://github.com/brython-dev/brython/issues/189
    // see https://docs.python.org/3/reference/toplevel_components.html#programs
    var _b_ = $B.builtins
    modules['_sys'] = {
        // Called "Getframe" because "_getframe" wouldn't be imported in
        // sys.py with "from _sys import *"
        Getframe : function(){
            var $ = $B.args("_getframe", 1, {depth: null}, ['depth'],
                    arguments, {depth: 0}, null, null),
                depth = $.depth
            return $B._frame.$factory($B.frames_stack,
                $B.frames_stack.length - depth - 1)
        },
        breakpointhook: function(){
            var hookname = $B.$options.breakpoint,
                modname,
                dot,
                funcname,
                hook
            if(hookname === undefined){
                hookname = "pdb.set_trace"
            }
            [modname, dot, funcname] = _b_.str.rpartition(hookname, '.')
            if(dot == ""){
                modname = "builtins"
            }
            try{
                $B.$import(modname)
                hook = $B.$getattr($B.imported[modname], funcname)
            }catch(err){
                console.warn("cannot import breakpoint", hookname)
                return _b_.None
            }
            return $B.$call(hook).apply(null, arguments)
        },
        exc_info: function(){
            for(var i = $B.frames_stack.length - 1; i >=0; i--){
                var frame = $B.frames_stack[i],
                    exc = frame[1].$current_exception
                if(exc){
                    return _b_.tuple.$factory([exc.__class__, exc,
                        $B.$getattr(exc, "__traceback__")])
                }
            }
            return _b_.tuple.$factory([_b_.None, _b_.None, _b_.None])
        },
        excepthook: function(exc_class, exc_value, traceback){
            $B.handle_error(exc_value)
        },
        gettrace: function(){
            return $B.tracefunc || _b_.None
        },
        max_string_length: $B.max_string_length, // in brython_builtins.js
        modules: _b_.property.$factory(
            function(){
                return $B.obj_dict($B.imported)
            },
            function(self, obj, value){
                 throw _b_.TypeError.$factory("Read only property 'sys.modules'")
            }
        ),
        path: _b_.property.$factory(
            function(){
                return $B.path
            },
            function(self, obj, value){
                 $B.path = value;
            }
        ),
        meta_path: _b_.property.$factory(
            function(){return $B.meta_path},
            function(self, obj, value){ $B.meta_path = value }
        ),
        path_hooks: _b_.property.$factory(
            function(){return $B.path_hooks},
            function(self, obj, value){ $B.path_hooks = value }
        ),
        path_importer_cache: _b_.property.$factory(
            function(){
                return _b_.dict.$factory($B.JSObj.$factory($B.path_importer_cache))
            },
            function(self, obj, value){
                throw _b_.TypeError.$factory("Read only property" +
                    " 'sys.path_importer_cache'")
            }
        ),
        settrace: function(){
            var $ = $B.args("settrace", 1, {tracefunc: null}, ['tracefunc'],
                    arguments, {}, null, null)
            $B.tracefunc = $.tracefunc
            $B.last($B.frames_stack)[1].$f_trace = $B.tracefunc
            // settrace() does not activite the trace function on the current
            // frame (the one sys.settrace() was called in); we set an
            // attribute to identify this frame. It is used in the functions
            // in py_utils.js that manage tracing (enter_frame, trace_call,
            // etc.)
            $B.tracefunc.$current_frame_id = $B.last($B.frames_stack)[0]
            return _b_.None
        },
        stderr: _b_.property.$factory(
            function(){return $B.stderr},
            function(self, value){$B.stderr = value}
        ),
        stdout: _b_.property.$factory(
            function(){return $B.stdout},
            function(self, value){
                $B.stdout = value
            }
        ),
        stdin: _b_.property.$factory(
            function(){return $B.stdin},
            function(self, value){
                $B.stdin = value
            }
        ),
        vfs: _b_.property.$factory(
            function(){
                if($B.hasOwnProperty("VFS")){return $B.obj_dict($B.VFS)}
                else{return _b_.None}
            },
            function(){
                throw _b_.TypeError.$factory("Read only property 'sys.vfs'")
            }
        )
    }

    modules._sys.__breakpointhook__ = modules._sys.breakpointhook

    modules._sys.stderr.write = function(data){
        return $B.$getattr(_sys.stderr.__get__(), "write")(data)
    }

    modules._sys.stdout.write = function(data){
        return $B.$getattr(_sys.stdout.__get__(), "write")(data)
    }

    var WarningMessage = $B.make_class("WarningMessage",
        function(){
            var $ = $B.make_args("WarningMessage", 8,
                {message: null, category: null, filename: null, lineno: null,
                 file: null, line:null, source: null},
                 ['message', 'category', 'filename', 'lineno', 'file',
                  'line', 'source'],
                 arguments, {file: _b_.None, line: _b_.None, source: _b_.None},
                 null, null)
            return {
                __class__: WarningMessage,
                message: $.message,
                category: $.category,
                filename: $.filename,
                lineno: $.lineno,
                file: $.file,
                line: $.line,
                source: $.source,
                _category_name: _b_.bool.$factory($.category) ?
                    $B.$getattr($.category, "__name__") : _b_.None
            }
        }
    )
    // _warnings provides basic warning filtering support.
    modules._warnings = {
        _defaultaction: "default",
        _filters_mutated: function(){
        },
        _onceregistry: $B.empty_dict(),
        filters: [
            $B.fast_tuple(['default', _b_.None, _b_.DeprecationWarning, '__main__', 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.DeprecationWarning, _b_.None, 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.PendingDeprecationWarning, _b_.None, 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.ImportWarning, _b_.None, 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.ResourceWarning, _b_.None, 0])
        ],
        warn: function(message){
            // Issue a warning, or maybe ignore it or raise an exception.
            var filters
            if($B.imported.warnings){
                filters = $B.imported.warnings.filters
            }else{
                filters = modules._warnings.filters
            }
            if(filters[0][0] == 'error'){
                var syntax_error = _b_.SyntaxError.$factory(message.args[0])
                syntax_error.args[1] = [message.filename, message.lineno,
                    message.offset, message.line]
                syntax_error.filename = message.filename
                syntax_error.lineno = message.lineno
                syntax_error.offset = message.offset
                syntax_error.line = message.line
                throw syntax_error
            }
            var frame = $B.imported._sys.Getframe()
                warning_message = {
                    __class__: WarningMessage,
                    $$message: message,
                    category: message.__class__,
                    filename: message.filename || frame.f_code.co_filename,
                    lineno: message.lineno || frame.f_lineno,
                    file: _b_.None,
                    line: _b_.None,
                    source: _b_.None,
                    _category_name: message.__class__.__name__
                }
            if($B.imported.warnings){
                $B.imported.warnings._showwarnmsg_impl(warning_message)
            }else{
                var trace = $B.class_name(message) + ': ' + message.args[0]
                $B.$getattr($B.stderr, 'write')(trace + '\n')
                var flush = $B.$getattr($B.stderr, 'flush', _b_.None)
                if(flush !== _b_.None){
                    flush()
                }
            }
        },
        warn_explicit: function(){
            // Low-level interface to warnings functionality.
            console.log("warn_explicit", arguments)
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
                var attr1 = $B.from_alias(attr)
                module_obj[attr].$infos = {
                    __module__: name,
                    __name__: attr1,
                    __qualname__: name + '.' + attr1
                }
            }
        }
    }

    for(var attr in modules){load(attr, modules[attr])}
    if(!($B.isWebWorker || $B.isNode)){modules['browser'].html = modules['browser.html']}

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
