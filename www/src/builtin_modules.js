 ;(function($B) {
     var _b_ = $B.builtins
    var update = $B.update_obj = function(mod, data) {
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
        "window": $B.win,
    }
    browser.__path__ = browser.__file__

    if ($B.isNode) {
        delete browser.window
        delete browser.win
    }else if($B.isWebWorker){
        browser.is_webworker = true
        // In a web worker, name "window" is not defined, but name "self" is
        delete browser.window
        delete browser.win
        // browser.send is an alias for postMessage
        browser.self.send = self.postMessage
        browser.document = _b_.property.$factory(
            function(){
                throw _b_.ValueError.$factory(
                    "'document' is not available in Web Workers")
            },
            function(self, value){
                browser.document = value
            }
        )
    }else{
        browser.is_webworker = false
        update(browser, {
            "alert":function(message){
                window.alert($B.builtins.str.$factory(message || ""))
            },
            confirm: $B.JSObj.$factory(window.confirm),
            "document": $B.DOMNode.$factory(document),
            doc: $B.DOMNode.$factory(document), // want to use document instead of doc
            DOMEvent:$B.DOMEvent,
            DOMNode: $B.DOMNode,
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
                $B.run_script($.src, $.name, $B.script_path, true)
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
                        __module__: "browser.html",
                        __qualname__: tagName
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
                                    throw err
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
                    // Only called for subclasses of the HTML tag
                    var res = document.createElement(tagName)
                    if(cls !== html[tagName]){
                        // Only set __class__ if it is not browser.html.<tagName>
                        res.__class__ = cls
                    }
                    return res
                }

                $B.set_func_names(dict, "browser.html")
                return dict
            }

            function makeFactory(klass){
                // Create the factory function for HTML tags.
                var factory = function(){
                    if(klass.$infos.__name__ == 'SVG'){
                        var res = $B.DOMNode.$factory(
                            document.createElementNS("http://www.w3.org/2000/svg", "svg"), true)
                    }else{
                        var res = document.createElement(klass.$infos.__name__)
                    }
                    // apply __init__
                    var init = $B.$getattr(klass, "__init__", null)
                    if(init !== null){
                        init(res, ...arguments)
                    }
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

            // Object representing the module browser.html
            var html = {}

            // Module has an attribute "tags" : a dictionary that maps all tag
            // names to the matching tag class factory function.
            // Implemented as a wrapper around a Javascript object for
            // performance.
            html.tags = $B.jsobj_as_pydict.$factory(html,
                function(attr){
                    return tags.indexOf(attr) == -1
                }
            )

            function maketag(tagName){
                // Create a new class associated with the custom HTML tag
                // "tagName". For instance, "makeTag('P2')" creates the class
                // that can be used to create tags "<P2></P2>"
                if(!(typeof tagName == 'string')){
                    throw _b_.TypeError.$factory("html.maketag expects a string as argument")
                }
                if(html[tagName] !== undefined){
                    throw _b_.ValueError.$factory("cannot reset class for "
                        + tagName)
                }
                var klass = makeTagDict(tagName)
                klass.$factory = makeFactory(klass)
                html[tagName] = klass
                return klass
            }

            for(var tagName of tags){
                maketag(tagName)
            }

            // expose function maketag to generate arbitrary tags (issue #624)
            html.maketag = maketag

            // expose function to transform parameters (issue #1187)
            html.attribute_mapper = function(attr){
                return attr.replace(/_/g, '-')
            }

            return html
        })(__BRYTHON__)
    }

    modules['browser'] = browser

    // Class for Javascript "undefined"
    $B.UndefinedType = $B.make_class("UndefinedType",
        function(){return $B.Undefined}
    )
    $B.UndefinedType.__mro__ = [_b_.object]
    $B.UndefinedType.__bool__ = function(self){
        return false
    }
    $B.UndefinedType.__repr__ = function(self){
        return "<Javascript undefined>"
    }
    $B.UndefinedType.__str__ = $B.UndefinedType.__repr__;

    $B.Undefined = {__class__: $B.UndefinedType}

    $B.set_func_names($B.UndefinedType, "javascript")

    // Class used by javascript.super()
    var super_class = $B.make_class("JavascriptSuper",
        function(){
            // Use Brython's super() to get a reference to self
            var b_super = _b_.super.$factory(),
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
                    b_self[key] = res[key]
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
        "this": function(){
            // returns the content of Javascript "this"
            // $B.js_this is set to "this" at the beginning of each function
            if($B.js_this === undefined){return $B.builtins.None}
            return $B.JSObj.$factory($B.js_this)
        },
        "Date": self.Date && $B.JSObj.$factory(self.Date),
        "extends": function(js_constr){
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
        import_js: function(url, name){
            // load JS script at specified url
            // If it exposes a variable $module, use it as the namespace of imported
            // module named "name"
            var $ = $B.args('import_js', 2, {url: null, alias: null},
                    ['url', 'alias'], arguments, {alias: _b_.None}, null, null),
                url = $.url
                alias = $.alias
            var xhr = new XMLHttpRequest(),
                result
            xhr.open('GET', url, false)
            xhr.onreadystatechange = function(){
                if(this.readyState == 4){
                    if(this.status == 200){
                        eval(this.responseText)
                        if(typeof $module !== 'undefined'){
                            result = $B.module.$factory(name)
                            for(var key in $module){
                                result[key] = $B.jsobj2pyobj($module[key])
                            }
                            result.__file__ = url
                        }else{
                            result = _b_.ImportError.$factory('Javascript ' +
                                `module at ${url} doesn't define $module`)
                        }
                    }else{
                        result = _b_.ModuleNotFoundError.$factory(name)
                    }
                }
            }
            xhr.send()
            if(_b_.isinstance(result, _b_.BaseException)){
                $B.handle_error(result)
            }else{
                if(alias === _b_.None){
                    // set module name from url
                    alias = url.split('.')
                    if(alias.length > 1){
                        alias.pop() // remove extension
                    }
                    alias = alias.join('.')
                }
                $B.imported[alias] = result
                var frame = $B.last($B.frames_stack)
                frame[1][alias] = result
            }
        },
        JSObject: $B.JSObj,
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
        "Math": self.Math && $B.JSObj.$factory(self.Math),
        NULL: null,
        NullType: $B.make_class('NullType'),
        "Number": self.Number && $B.JSObj.$factory(self.Number),
        py2js: function(src, module_name){
            if(module_name === undefined){
                module_name = '__main__' + $B.UUID()
            }
            var js = $B.py2js({src, filename: '<string>'}, module_name, module_name,
                $B.builtins_scope).to_js()
            return $B.format_indent(js, 0)
        },
        pyobj2jsobj:function(obj){return $B.pyobj2jsobj(obj)},
        "RegExp": self.RegExp && $B.JSObj.$factory(self.RegExp),
        "String": self.String && $B.JSObj.$factory(self.String),
        "super": super_class,
        UNDEFINED: $B.Undefined,
        UndefinedType: $B.UndefinedType
    }

    modules.javascript.NullType.$infos.__module__ = 'javascript'
    modules.javascript.UndefinedType.$infos.__module__ = 'javascript'

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
            var res = $B.frames_stack[$B.frames_stack.length - depth - 1]
            res.$pos = $B.frames_stack.indexOf(res)
            return res
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
        getrecursionlimit: function(){
            return $B.recursion_limit
        },
        gettrace: function(){
            return $B.tracefunc || _b_.None
        },
        modules: _b_.property.$factory(
            function(){
                return $B.obj_dict($B.imported)
            },
            function(self, value){
                 throw _b_.TypeError.$factory("Read only property 'sys.modules'")
            }
        ),
        path: _b_.property.$factory(
            function(){
                return $B.path
            },
            function(self, value){
                 $B.path = value;
            }
        ),
        meta_path: _b_.property.$factory(
            function(){
                return $B.meta_path
            },
            function(self, value){
                $B.meta_path = value
            }
        ),
        path_hooks: _b_.property.$factory(
            function(){
                return $B.path_hooks
            },
            function(self, value){
                $B.path_hooks = value
            }
        ),
        path_importer_cache: _b_.property.$factory(
            function(){
                return _b_.dict.$factory($B.JSObj.$factory($B.path_importer_cache))
            },
            function(self, value){
                throw _b_.TypeError.$factory("Read only property" +
                    " 'sys.path_importer_cache'")
            }
        ),
        setrecursionlimit: function(value){
            $B.recursion_limit = value
        },
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
            function(){
                return $B.stderr
            },
            function(self, value){
                $B.stderr = value
            }
        ),
        stdout: _b_.property.$factory(
            function(){
                return $B.stdout
            },
            function(self, value){
                $B.stdout = value
            }
        ),
        stdin: _b_.property.$factory(
            function(){
                return $B.stdin
            },
            function(self, value){
                $B.stdin = value
            }
        ),
        vfs: _b_.property.$factory(
            function(){
                if($B.hasOwnProperty("VFS")){
                    return $B.obj_dict($B.VFS)
                }else{
                    return _b_.None
                }
            },
            function(){
                throw _b_.TypeError.$factory("Read only property 'sys.vfs'")
            }
        )
    }

    modules._sys.__breakpointhook__ = modules._sys.breakpointhook

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
            var category = message.__class__ || $B.get_class(message),
                warning_message
            if(category === _b_.SyntaxWarning){
                var file = message.filename,
                    lineno = message.lineno,
                    line = message.text
                warning_message = {
                    __class__: WarningMessage,
                    message: message,
                    category,
                    filename: message.filename,
                    lineno: message.lineno,
                    file: _b_.None,
                    line: _b_.None,
                    source: _b_.None,
                    _category_name: category.__name__
                }
            }else{
                var frame = $B.imported._sys.Getframe(),
                    file = frame.__file__,
                    f_code = $B._frame.f_code.__get__(frame),
                    lineno = frame.$lineno,
                    src = $B.file_cache[file],
                    line = src ? src.split('\n')[lineno - 1] : null
                warning_message = {
                    __class__: WarningMessage,
                    message: message,
                    category,
                    filename: message.filename || f_code.co_filename,
                    lineno: message.lineno || lineno,
                    file: _b_.None,
                    line: _b_.None,
                    source: _b_.None,
                    _category_name: category.__name__
                }
            }
            if($B.imported.warnings){
                $B.imported.warnings._showwarnmsg_impl(warning_message)
            }else{
                var trace = ''
                if(file && lineno){
                    trace += `${file}:${lineno}: `
                }
                trace += $B.class_name(message) + ': ' + message.args[0]
                if(line){
                    trace += '\n    ' + line.trim()
                }
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
                module_obj[attr].$infos = {
                    __module__: name,
                    __name__: attr,
                    __qualname__: name + '.' + attr
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
        if(_b_[attr].$is_class){
            if(_b_[attr].__bases__){
                _b_[attr].__bases__.__class__ = _b_.tuple
            }else{
                _b_[attr].__bases__ = $B.fast_tuple([_b_.object])
            }
        }
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
                    return _b_.NotImplemented
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


    $B.AST = {
        __class__: _b_.type,
        __mro__: [_b_.object],
        $infos:{
            __qualname__: 'AST',
            __name__: 'AST'
        },
        $is_class: true,
        $convert: function(js_node){
            if(js_node === undefined){
                return _b_.None
            }
            var constr = js_node.constructor
            if(constr && constr.$name){
                $B.create_python_ast_classes()
                return $B.python_ast_classes[constr.$name].$factory(js_node)
            }else if(Array.isArray(js_node)){
                return js_node.map($B.AST.$convert)
            }else if(js_node.type){
                // literal constant
                switch(js_node.type){
                    case 'int':
                        var res = parseInt(js_node.value[1], js_node.value[0])
                        if(res < $B.min_int || res > $B.max_int){
                            var res = $B.fast_long_int(BigInt(res))
                            return res
                        }
                        return js_node.sign == '-' ? -res : res
                    case 'float':
                        return new Number(js_node.value)
                    case 'imaginary':
                        return $B.make_complex(0,
                            $B.AST.$convert(js_node.value))
                    case 'ellipsis':
                        return _b_.Ellipsis
                    case 'str':
                        if(js_node.is_bytes){
                            return _b_.bytes.$factory(js_node.value, 'latin-1')
                        }
                        return js_node.value
                    case 'id':
                        if(['False', 'None', 'True'].indexOf(js_node.value) > -1){
                            return _b_[js_node.value]
                        }
                        break
                }
            }else if(['string', 'number'].indexOf(typeof js_node) > -1){
                return js_node
            }else if(js_node.$name){
                // eg Store(), Load()...
                return js_node.$name + '()'
            }else if([_b_.None, _b_.True, _b_.False].indexOf(js_node) > -1){
                return js_node
            }else if(js_node.__class__){
                return js_node
            }else{
                console.log('cannot handle', js_node)
                return js_node
            }
        }
    }


})(__BRYTHON__)
