"use strict";
 ;(function($B) {
     var _b_ = $B.builtins
    var update = $B.update_obj = function(mod, data) {
        for(attr in data) {
            mod[attr] = data[attr]
        }
    }
    var _window = globalThis;
    var modules = {}
    var browser = {
        $package: true,
        $is_package: true,
        __initialized__: true,
        __package__: 'browser',
        __file__: $B.brython_path.replace(new RegExp("/*$", "g"),'') +
            '/Lib/browser/__init__.py',

        bind:function(){
            // bind(element, event) is a decorator for callback function
            var $ = $B.args("bind", 3, {elt: null, evt: null, options: null},
                    ["elt", "evt", "options"], arguments,
                    {options: _b_.None}, null, null)
            var options = $.options
            if(typeof options == "boolean"){
                // ignore
            }else if(options.__class__ === _b_.dict){
                var _options = {}
                for(var key of _b_.dict.$keys_string(options)){
                    _options[key] = _b_.dict.$getitem_string(options, key)
                }
                options = _options
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
                }else if($B.$isinstance($.elt, $B.DOMNode)){
                    // DOM element
                    $B.DOMNode.bind($.elt, $.evt, callback, options)
                    return callback
                }else if($B.$isinstance($.elt, _b_.str)){
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
                            if($B.$isinstance(err, _b_.StopIteration)){
                                break
                            }
                            throw err
                        }
                    }
                }catch(err){
                    if($B.$isinstance(err, _b_.AttributeError)){
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
                console.log('content', content.length)
                eval(content)
            },
            load1:function(script_url, callback){
                // Load and eval() the Javascript file at script_url
                //var file_obj = $B.builtins.open(script_url)
                //var content = $B.$getattr(file_obj, 'read')()
                //console.log('content', content.length)
                var script = document.createElement('SCRIPT')
                script.src = script_url
                if(callback){
                    script.addEventListener('load', function(ev){
                        callback()
                    })
                }
                document.body.appendChild(script)
            },
            mouseCoords: function(ev){
                return $B.JSObj.$factory($B.$mouseCoords(ev))
            },
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
                var script = document.createElement('script')
                script.setAttribute('id', $.name)
                $B.run_script(script, $.src, $.name, $B.script_path, true)
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
                    __name__: tagName,
                    __module__: "browser.html",
                    __qualname__: tagName
                }

                dict.__init__ = function(){
                    var $ns = $B.args('__init__', 1, {self: null}, ['self'],
                        arguments, {}, 'args', 'kw'),
                        self = $ns['self'],
                        args = $ns['args']
                    if(args.length == 1){
                        var first = args[0]
                        if($B.$isinstance(first,[_b_.str, _b_.int, _b_.float])){
                            // set "first" as HTML content (not text)
                            self.innerHTML = _b_.str.$factory(first)
                        }else if(first.__class__ === TagSum){
                            for(var i = 0, len = first.children.length; i < len; i++){
                                self.appendChild(first.children[i])
                            }
                        }else{
                            if($B.$isinstance(first, $B.DOMNode)){
                                self.appendChild(first)
                            }else{
                                try{
                                    // If the argument is an iterable other than
                                    // str, add the items
                                    var items = _b_.list.$factory(first)
                                    for(var item of items){
                                        $B.DOMNode.__le__(self, item)
                                    }
                                }catch(err){
                                    if($B.get_option('debug', err) > 1){
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
                    for(var arg in $ns.kw.$jsobj){
                        // keyword arguments
                        var value = $ns.kw.$jsobj[arg]
                        if(arg.toLowerCase().substr(0,2) == "on"){
                            // Event binding passed as argument "onclick", "onfocus"...
                            $B.DOMNode.__setattr__(self, arg, value)
                        }else if(arg.toLowerCase() == "style"){
                            $B.DOMNode.set_style(self, value)
                        }else{
                            if(value !== false){
                                // option.selected = false sets it to true :-)
                                try{
                                    // Call attribute mapper (cf. issue#1187)
                                    arg = $B.imported["browser.html"].
                                        attribute_mapper(arg)
                                    self.setAttribute(arg, $B.pyobj2jsobj(value))
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

                dict.__rmul__ = function(self, num){
                    return $B.DOMNode.__mul__(self, num)
                }

                $B.set_func_names(dict, "browser.html")
                return dict
            }

            function makeFactory(klass, ComponentClass){
                // Create the factory function for HTML tags.
                return (function(k){
                    return function(){
                        if(k.__name__ == 'SVG'){
                            var res = $B.DOMNode.$factory(
                                document.createElementNS("http://www.w3.org/2000/svg", "svg"), true)
                        }else{
                            try{
                                var res = document.createElement(k.__name__)
                            }catch(err){
                                console.log('error ' + err)
                                console.log('creating element', k.__name__)
                                throw err
                            }
                        }
                        // apply __init__
                        var init = $B.$getattr(k, "__init__", null)
                        if(init !== null){
                            init(res, ...arguments)
                        }
                        return res
                    }
                })(klass)
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
            html.tags = $B.empty_dict()

            function maketag(tagName, ComponentClass){
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
                klass.$factory = makeFactory(klass, ComponentClass)
                html[tagName] = klass
                _b_.dict.$setitem(html.tags, tagName, html[tagName])
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
            var res = _b_.super.$factory()
            var js_constr = res.__thisclass__.__bases__[0]
            return function(){
                var obj = new js_constr.$js_func(...arguments)
                console.log('obj from js constr', obj)
                for(var attr in obj){
                    console.log('attr', attr)
                    res.__self_class__.__dict__[attr] = $B.jsobj2pyobj(obj[attr])
                }
                return obj
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
        Array: $B.js_array,
        Date: self.Date && $B.JSObj.$factory(self.Date),
        extends: function(js_constr){
            if((!js_constr.$js_func) ||
                    ! js_constr.$js_func.toString().startsWith('class ')){
                console.log(js_constr)
                throw _b_.TypeError.$factory(
                    'argument of extend must be a Javascript class')
            }
            js_constr.__class__ = _b_.type
            return function(obj){
                obj.__bases__.splice(0, 0, js_constr)
                obj.__mro__.splice(0, 0, js_constr)
                return obj
            }
        },
        import_js: function(url, name){
            // load JS script at specified url
            // If it exposes a variable $module, use it as the namespace of imported
            // module named "name"
            var $ = $B.args('import_js', 2, {url: null, alias: null},
                    ['url', 'alias'], arguments, {alias: _b_.None}, null, null),
                url = $.url,
                alias = $.alias
            var xhr = new XMLHttpRequest(),
                result
            xhr.open('GET', url, false)
            xhr.onreadystatechange = function(){
                if(this.readyState == 4){
                    if(this.status == 200){
                        var js = this.responseText + '\nreturn $module',
                            f = new Function(js)
                        console.log('f', f, f+'')
                        var $module = f()
                        if(typeof $module !== 'undefined'){
                            result = $B.module.$factory(name)
                            for(var key in $module){
                                result[key] = $B.jsobj2pyobj($module[key])
                            }
                            result.__file__ = url
                        }else{
                            console.log(this.responseText)
                            result = _b_.ImportError.$factory('Javascript ' +
                                `module at ${url} doesn't define $module`)
                        }
                    }else{
                        result = _b_.ModuleNotFoundError.$factory(name)
                    }
                }
            }
            xhr.send()
            if($B.$isinstance(result, _b_.BaseException)){
                $B.handle_error(result)
            }else{
                if(alias === _b_.None){
                    // set module name from url
                    alias = url.split('.')
                    if(alias.length > 1){
                        alias.pop() // remove extension
                    }
                    alias = alias.join('.')
                    result.__name__ = alias
                }
                $B.imported[alias] = result
                var frame = $B.frame_obj.frame
                frame[1][alias] = result
            }
        },
        import_modules: function(refs, callback, loaded){
            // loads the Javascript ES6 modules referenced by module_refs,
            // then calls callback with arguments = the module objects
            if(loaded === undefined){
                loaded = []
            }
            if(! Array.isArray(refs)){
                throw _b_.TypeError.$factory(
                    `first argument must be a list, got ${$B.class_name(refs)}`)
            }

            if(refs.length > 1){
                var ref = refs.shift()
                import(ref).then(function(module){
                    loaded.push(module)
                    $B.imported.javascript.import_modules(refs, callback, loaded)
                }).catch($B.show_error)
            }else{
                import(refs[0]).then(function(module){
                    loaded.push(module)
                    return $B.$call(callback).apply(null, loaded)
                }).catch($B.show_error)
            }
        },
        import_scripts:  function(refs, callback, loaded){
            // loads the Javascript ES6 modules referenced by module_refs,
            // then calls callback with arguments = the module objects
            console.log('import scripts', refs)
            if(loaded === undefined){
                loaded = []
            }
            if(! Array.isArray(refs)){
                throw _b_.TypeError.$factory(
                    `first argument must be a list, got ${$B.class_name(refs)}`)
            }

            if(refs.length > 0){
                var ref = refs.shift()
                var script = document.createElement('script')
                script.src = ref
                script.addEventListener('load',
                    function(ev){
                        console.log('script loaded')
                        loaded.push(script)
                        $B.imported.javascript.import_scripts(refs, callback, loaded)
                    }
                )
                document.body.appendChild(script)
            }else{
                console.log('appel callback', loaded)
                return $B.$call(callback).apply(null, loaded)
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
        jsobj2pyobj:function(obj){
            return $B.jsobj2pyobj(obj)
        },
        load:function(script_url){
            console.log('"javascript.load" is deprecrated. ' +
                'Use browser.load instead.')
            // Load and eval() the Javascript file at script_url
            // Set the names in array "names" in the Javacript global namespace
            var file_obj = $B.builtins.open(script_url)
            var content = $B.$getattr(file_obj, 'read')()
            eval(content)
        },
        Math: self.Math && $B.JSObj.$factory(self.Math),
        NULL: null,
        NullType: $B.make_class('NullType'),
        Number: self.Number && $B.JSObj.$factory(self.Number),
        py2js: function(src, module_name){
            if(module_name === undefined){
                module_name = '__main__' + $B.UUID()
            }
            var js = $B.py2js({src, filename: '<string>'}, module_name, module_name,
                $B.builtins_scope).to_js()
            return $B.format_indent(js, 0)
        },
        pyobj2jsobj:function(obj){
            return $B.pyobj2jsobj(obj)
        },
        RegExp: self.RegExp && $B.JSObj.$factory(self.RegExp),
        String: self.String && $B.JSObj.$factory(self.String),
        "super": super_class,
        UNDEFINED: $B.Undefined,
        UndefinedType: $B.UndefinedType
    }

    modules.javascript.NullType.__module__ = 'javascript'

    modules.javascript.NullType.__eq__ = function(_self, other){
        // in Javascript, null == undefined is true...
        return other === null || other === $B.Undefined
    }

    $B.set_func_names(modules.javascript.NullType, 'javascript')

    modules.javascript.UndefinedType.__module__ = 'javascript'

    // Default standard output and error
    // Can be reset by sys.stdout or sys.stderr
    var $io = $B.$io = $B.make_class("io",
        function(out){
            return {
                __class__: $io,
                out,
                encoding: 'utf-8'
            }
        }
    )

    $io.flush = function(self){
        if(self.buf){
            console[self.out](self.buf.join(''))
            self.buf = []
        }
    }

    $io.write = function(self, msg){
        // Default to printing to browser console
        if(self.buf === undefined){
            self.buf = []
        }
        if(typeof msg != "string"){
            throw _b_.TypeError.$factory("write() argument must be str, not " +
                $B.class_name(msg))
        }
        self.buf.push(msg)
        return _b_.None
    }
    // _sys module is at the core of Brython since it is paramount for
    // the import machinery.
    // see https://github.com/brython-dev/brython/issues/189
    // see https://docs.python.org/3/reference/toplevel_components.html#programs
    var _b_ = $B.builtins
    modules['_sys'] = {
        // Called "Getframe" because "_getframe" wouldn't be imported in
        // sys.py with "from _sys import *"
        _getframe : function(){
            var $ = $B.args("_getframe", 1, {depth: null}, ['depth'],
                    arguments, {depth: 0}, null, null),
                depth = $.depth,
                frame_obj = $B.frame_obj
            for(var i = 0; i < depth; i++){
                frame_obj = frame_obj.prev
            }
            var res = frame_obj.frame
            res.$pos = $B.count_frames() - depth - 1
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
            var frame_obj = $B.frame_obj,
                frame,
                exc
            while(frame_obj !== null){
                frame = frame_obj.frame
                exc = frame[1].$current_exception
                if(exc){
                    return _b_.tuple.$factory([exc.__class__, exc,
                        $B.$getattr(exc, "__traceback__")])
                }
                frame_obj = frame_obj.prev
            }
            return _b_.tuple.$factory([_b_.None, _b_.None, _b_.None])
        },
        excepthook: function(exc_class, exc_value, traceback){
            $B.handle_error(exc_value)
        },
        exception: function(){
            var frame_obj = $B.frame_obj,
                frame,
                exc
            while(frame_obj !== null){
                frame = frame_obj.frame
                exc = frame[1].$current_exception
                if(exc !== undefined){
                    return exc
                }
                frame_obj = frame_obj.prev
            }
            return _b_.None
        },
        float_repr_style: 'short',
        getdefaultencoding: function(){
            return 'utf-8'
        },
        getrecursionlimit: function(){
            return $B.recursion_limit
        },
        getrefcount: function(){
            return 0
        },
        gettrace: function(){
            return $B.tracefunc || _b_.None
        },
        getunicodeinternedsize: function(){
            // compliance with Python3.12
            return 0
        },
        last_exc: _b_.property.$factory(
            function(){
                return $B.imported._sys.exception()
            },
            function(value){
                $B.frame_obj.frame.$current_exception = value
            }
        ),
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
                var filename = $B.get_filename_for_import()
                return $B.import_info[filename].path
            },
            function(self, value){
                var filename = $B.get_filename_for_import()
                $B.import_info[filename].path = value
            }
        ),
        meta_path: _b_.property.$factory(
            function(){
                var filename = $B.get_filename()
                return $B.import_info[filename].meta_path
            },
            function(self, value){
                var filename = $B.get_filename()
                $B.import_info[filename].meta_path = value
            }
        ),
        path_hooks: _b_.property.$factory(
            function(){
                var filename = $B.get_filename()
                return $B.import_info[filename].path_hooks
            },
            function(self, value){
                var filename = $B.get_filename()
                $B.import_info[filename].path_hooks = value
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
            $B.frame_obj.frame.$f_trace = $B.tracefunc
            // settrace() does not activite the trace function on the current
            // frame (the one sys.settrace() was called in); we set an
            // attribute to identify this frame. It is used in the functions
            // in py_utils.js that manage tracing (enter_frame, trace_call,
            // etc.)
            $B.tracefunc.$current_frame_id = $B.frame_obj.frame[0]
            return _b_.None
        },
        stderr: console.error !== undefined ? $io.$factory("error") :
                    $io.$factory("log"),
        stdout: $io.$factory("log"),
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
            var $ = $B.args('warn', 4,
                            {message: null, category: null, stacklevel: null, source: null},
                            ['message', 'category', 'stacklevel', 'source'],
                            arguments, {category: _b_.None, stacklevel: 1, source: _b_.None},
                            null, null),
                    message = $.message,
                    category = $.category,
                    stacklevel = $.stacklevel
            if($B.$isinstance(message, _b_.Warning)){
                category = $B.get_class(message)
            }
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
            var warning_message
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
                var frame_rank = Math.max(0, $B.count_frames() - stacklevel),
                    frame = $B.get_frame_at(frame_rank),
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
                var stderr = $B.get_stderr()
                $B.$getattr(stderr, 'write')(trace + '\n')
                var flush = $B.$getattr(stderr, 'flush', _b_.None)
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

    var responseType = {
        "text": "text",
        "binary": "arraybuffer",
        "dataURL": "arraybuffer"
    }

    function handle_kwargs(kw, method){
        // kw was created with $B.obj_dict(), its keys/values are in kw.$jsobj
        var data,
            cache = false,
            format = "text",
            headers = {},
            timeout = {}
        for(var key in kw.$jsobj){
            if(key == "data"){
                var params = kw.$jsobj[key]
                if(typeof params == "string"){
                    data = params
                }else if($B.$isinstance(params, _b_.bytes)){
                    data = new ArrayBuffer(params.source.length)
                    var array = new Int8Array(data)
                    for(var i = 0, len = params.source.length; i < len; i++){
                        array[i] = params.source[i]
                    }
                }else{
                    if(params.__class__ !== _b_.dict){
                        throw _b_.TypeError.$factory("wrong type for data, " +
                            "expected dict, bytes or str, got " +
                            $B.class_name(params))
                    }
                    var items = []
                    for(var key of _b_.dict.$keys_string(params)){
                        var value = _b_.dict.$getitem_string(params, key)
                        items.push(encodeURIComponent(key) + "=" +
                                   encodeURIComponent($B.pyobj2jsobj(value)))
                    }
                    data = items.join("&")
                }
            }else if(key == "headers"){
                var value = kw.$jsobj[key]
                if(! $B.$isinstance(value, _b_.dict)){
                    throw _b_.ValueError.$factory(
                        "headers must be a dict, not " + $B.class_name(value))
                }
                for(var key of _b_.dict.$keys_string(value)){
                    headers[key.toLowerCase()] = _b_.dict.$getitem_string(value, key)
                }
            }else if(key.startsWith("on")){
                var event = key.substr(2)
                if(event == "timeout"){
                    timeout.func = kw.$jsobj[key]
                }else{
                    ajax.bind(self, event, kw.$jsobj[key])
                }
            }else if(key == "timeout"){
                timeout.seconds = kw.$jsobj[key]
            }else if(key == "cache"){
                cache = kw.$jsobj[key]
            }else if(key == "format"){
                format = kw.$jsobj[key]
            }
        }
        if(method == "post"){
            // For POST requests, set default header
            if(! headers.hasOwnProperty("Content-type")){
                headers["Content-Type"] = "application/x-www-form-urlencoded"
            }
        }
        return {
            body: data,
            cache,
            format,
            timeout,
            headers
        }
    }

    var HTTPRequest = $B.make_class("Request")

    HTTPRequest.data = _b_.property.$factory(function(self){
        if(self.format == "binary"){
            var view = new Uint8Array(self.response)
            return _b_.bytes.$factory(Array.from(view))
        }else if(self.format == "text"){
            return self.responseText
        }else if(self.format == "dataURL"){
            var base64String = btoa(String.fromCharCode.apply(null,
                new Uint8Array(self.response)))
            return "data:" + self.getResponseHeader("Content-Type") +
                ";base64," + base64String
        }
    })

    HTTPRequest.response_headers = _b_.property.$factory(function(self){
        var headers = self.getAllResponseHeaders()
        if(headers === null){return _b_.None}
        var res = $B.empty_dict()
        if(headers.length > 0){
            // Convert the header string into an array
            // of individual headers
            var lines = headers.trim().split(/[\r\n]+/)
            // Create a map of header names to values
            lines.forEach(function(line){
              var parts = line.split(': ')
              var header = parts.shift()
              var value = parts.join(': ')
              _b_.dict.$setitem(res, header, value)
            })
        }
        return res
    })

    var Future = $B.make_class("Future",
        function(){
            var methods = {}
            var promise = new Promise(function(resolve, reject){
                methods.resolve = resolve
                methods.reject = reject
            })
            promise._methods = methods
            promise._done = false
            promise.__class__ = Future
            return promise
        }
    )

    Future.done = function(){
        var $ = $B.args('done', 1, {self:null},
                        ['self'], arguments, {}, null, null)
        return !! self._done
    }

    Future.set_result = function(self, value){
        var $ = $B.args('set_result', 2, {self:null, value: null},
                        ['self', 'value'], arguments, {}, null, null)
        self._done = true
        self._methods.resolve(value)
        return _b_.None
    }

    Future.set_exception = function(self, exception){
        var $ = $B.args('set_exception', 2, {self:null, exception: null},
                        ['self', 'exception'], arguments, {}, null, null)
        self._done = true
        self._methods.reject(exception)
        return _b_.None
    }

    $B.set_func_names(Future, 'browser.aio')

    modules['browser.aio'] = {
        ajax: function(){
            var $ = $B.args("ajax", 2, {method: null, url: null},
                    ["method", "url"], arguments, {},
                    null, "kw"),
                method = $.method.toUpperCase(),
                url = $.url,
                kw = $.kw
            var args = handle_kwargs(kw, "get")
            if(method == "GET" && ! args.cache){
                url = url + "?ts" + (new Date()).getTime() + "=0"
            }
            if(args.body && method == "GET"){
                url = url + (args.cache ? "?" : "&") + args.body
            }
            var func = function(){
                return new Promise(function(resolve, reject){
                    var xhr = new XMLHttpRequest()
                    xhr.open(method, url, true)
                    for(var key in args.headers){
                        xhr.setRequestHeader(key, args.headers[key])
                    }
                    xhr.format = args.format
                    xhr.responseType = responseType[args.format]
                    xhr.onreadystatechange = function(){
                        if(this.readyState == 4){
                            this.__class__ = HTTPRequest
                            resolve(this)
                        }
                    }
                    if(args.body &&
                            ['POST', 'PUT', 'DELETE', 'PATCH'].indexOf(method) > -1){
                        xhr.send(args.body)
                    }else{
                        xhr.send()
                    }
                })
            }
            func.$infos = {
                __name__: "ajax_" + method
            }
            return {
                __class__: $B.coroutine,
                $args: [url, args],
                $func: func
            }
        },
        event: function(){
            // event(element, *names) is a Promise on the events "names" happening on
            // the element. This promise always resolves (never rejects) with the
            // first triggered DOM event.
            var $ = $B.args("event", 1, {element: null},
                    ["element"], arguments, {}, "names", null),
                element = $.element,
                names = $.names
            return new Promise(function(resolve){
                var callbacks = []
                names.forEach(function(name){
                    var callback = function(evt){
                        // When one of the handled events is triggered, all bindings
                        // are removed
                        callbacks.forEach(function(items){
                            $B.DOMNode.unbind(element, items[0], items[1])
                        })
                        resolve($B.$DOMEvent(evt))
                    }
                    callbacks.push([name, callback])
                    $B.DOMNode.bind(element, name, callback)
                })
            })
        },
        get: function(){
            return $B.imported['browser.aio'].ajax.bind(null, "GET").apply(null, arguments)
        },
        iscoroutine: function(f){
            return f.__class__ === $B.coroutine
        },
        iscoroutinefunction: function(f){
            return (f.$infos.__code__.co_flags & 128) != 0
        },
        post: function(){
            return $B.imported['browser.aio'].ajax.bind(null, "POST").apply(null, arguments)
        },
        run: function(coro){
            var handle_success = function(){
                    $B.leave_frame()
                },
                handle_error = $B.show_error,
                error_func = handle_error

            var $ = $B.args("run", 3, {coro: null, onsuccess: null, onerror: null},
                    ["coro", "onsuccess", "onerror"], arguments,
                    {onsuccess: handle_success, onerror: handle_error},
                    null, null),
                coro = $.coro,
                onsuccess = $.onsuccess,
                onerror = $.onerror,
                error_func = onerror

            if(onerror !== handle_error){
                function error_func(exc){
                    try{
                        onerror(exc)
                    }catch(err){
                        handle_error(err)
                    }
                }
            }

            var save_frame_obj = $B.frame_obj
            $B.coroutine.send(coro).then(onsuccess).catch(error_func)
            $B.frame_obj = save_frame_obj
            return _b_.None
        },
        sleep: function(seconds){
            if(seconds.__class__ === _b_.float){
                seconds = seconds.value
            }else if(typeof seconds != "number"){
                throw _b_.TypeError.$factory("'sleep' argument must be " +
                    "int or float, not " + $B.class_name(seconds))
            }
            var func = function(){
                return new Promise(resolve => setTimeout(
                    function(){resolve(_b_.None)}, 1000 * seconds))
            }
            func.$infos = {
                __name__: "sleep"
            }
            return {
                __class__: $B.coroutine,
                $args: [seconds],
                $func: func
            }
        },
        Future,
        __getattr__: function(attr){
            // search in _aio.py
            $B.$import('_aio')
            return $B.$getattr($B.imported._aio, attr)
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

    for(var attr in modules){
        load(attr, modules[attr])
    }
    if(!($B.isWebWorker || $B.isNode)){
        modules['browser'].html = modules['browser.html']
        modules['browser'].aio = modules['browser.aio']
    }

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

    $B.method_descriptor.__getattribute__ = $B.function.__getattribute__
    $B.wrapper_descriptor.__getattribute__ = $B.function.__getattribute__

    // Set type of methods of builtin classes
    for(var name in _b_){
        var builtin = _b_[name]
        if(_b_[name].__class__ === _b_.type){
            _b_[name].__qualname__ = name
            _b_[name].__module__ = 'builtins'
            _b_[name].__name__ = name
            _b_[name].$is_builtin_class = true
            $B.builtin_classes.push(_b_[name]) // defined in brython_builtins.js
            for(var key in _b_[name]){
                var value = _b_[name][key]
                if(value === undefined || value.__class__ ||
                        typeof value != 'function'){
                    continue
                }else if(key == "__new__"){
                    value.__class__ = $B.builtin_function_or_method
                }else if(key.startsWith("__")){
                    value.__class__ = $B.wrapper_descriptor
                }else{
                    value.__class__ = $B.method_descriptor
                }
                value.__objclass__ = _b_[name]
            }
        }else if(typeof builtin == 'function'){
            builtin.$infos = {
                __name__: name,
                __qualname__: name
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
                if(! $B.$isinstance(other, $B.cell)){
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

    // Set __flags__ of internal classes, defined in py_flags.js
    for(var flag in $B.builtin_class_flags.builtins){
        for(var key of $B.builtin_class_flags.builtins[flag]){
            if(_b_[key]){
                _b_[key].__flags__ = parseInt(flag)
            }else{
                console.log('not in _b_', key)
            }
        }
    }

    for(var flag in $B.builtin_class_flags.types){
        for(var key of $B.builtin_class_flags.types[flag]){
            if($B[key]){
                $B[key].__flags__ = parseInt(flag)
            }
        }
    }

    $B.AST = {
        __class__: _b_.type,
        __mro__: [_b_.object],
        __name__: 'AST',
        __qualname__: 'AST',
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
                        var value = js_node.value[1],
                            base = js_node.value[0]
                        var res = parseInt(value, base)
                        if(! Number.isSafeInteger(res)){
                            res = $B.long_int.$factory(value, base)
                        }
                        return res
                    case 'float':
                        return $B.fast_float(parseFloat(js_node.value))
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

$B.stdin = {
    __class__: $io,
    __original__: true,
    closed: false,
    len: 1,
    pos: 0,
    read: function (){
        return ""
    },
    readline: function(){
        return ""
    }
}

})(__BRYTHON__)
