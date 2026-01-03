"use strict";
 (function($B) {
    var _b_ = $B.builtins
    var update = $B.update_obj = function(mod, data) {
        for(let attr in data) {
            mod[attr] = data[attr]
        }
    }
    var modules = {}
    var win = $B.jsobj2pyobj(globalThis)

    var browser = {
        $package: true,
        $is_package: true,
        __initialized__: true,
        __package__: 'browser',
        __file__: $B.brython_path.replace(new RegExp("/*$", "g"),'') +
            '/Lib/browser/__init__.py',

        __BRYTHON__,
        bind:function(){
            // bind(element, event) is a decorator for callback function
            var $ = $B.args("bind", 3, {elt: null, evt: null, options: null},
                    ["elt", "evt", "options"], arguments,
                    {options: _b_.None}, null, null)
            var options = $.options
            if(typeof options == "boolean"){
                // ignore
            }else if($B.get_class(options) === _b_.dict){
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
                            return callback($B.jsobj2pyobj(ev))
                        }catch(err){
                            $B.handle_error(err)
                        }
                    }
                    $.elt.addEventListener($.evt, f, options)
                    return callback
                }else if($B.$isinstance($.elt, $B.DOMNode)){
                    // DOM element
                    $B.$call($B.$getattr($B.DOMNode, 'bind'), $.elt, $.evt, callback, options)
                    return callback
                }else if($B.$isinstance($.elt, _b_.str)){
                    // string interpreted as a CSS selector
                    var items = document.querySelectorAll($.elt)
                    var binder = $B.type_getattribute($B.DOMNode, 'bind')
                    for(var i = 0; i < items.length; i++){
                        $B.$call(binder, $B.DOMNode.$factory(items[i]),
                            $.evt, callback, options)
                    }
                    return callback
                }
                var binder = $B.type_getattribute($B.DOMNode, 'bind')
                try{
                    var it = $B.$iter($.elt)
                    while(true){
                        try{
                            var elt = _b_.next(it)
                            $B.$call(binder, elt, $.evt, callback)
                        }catch(err){
                            if($B.$isinstance(err, _b_.StopIteration)){
                                break
                            }
                            throw err
                        }
                    }
                }catch(err){
                    if($B.$isinstance(err, _b_.AttributeError)){
                        $B.$call(binder, $.elt, $.evt, callback)
                    }
                    throw err
                }
                return callback
            }
        },
        console: self.console && $B.jsobj2pyobj(self.console),
        run_script: function(){
            var $ = $B.args("run_script", 2, {src: null, name: null},
                ["src", "name"], arguments, {name: "script_" + $B.UUID()},
                null, null)
            $B.runPythonSource($.src, $.name)
        },
        scope: globalThis,
        self: win,
        win: win,
        window: win
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
        browser.self.send = function(){
            var $ = $B.args('send', 1, {message: null},
                    ['message'], arguments, {}, 'args', null),
                message = $B.pyobj2structuredclone($.message),
                args = $.args.map($B.pyobj2jsobj)
            self.postMessage(message, ...args)
        }
        browser.document = _b_.property.$factory(
            function(){
                $B.RAISE(_b_.ValueError,
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
            confirm: $B.jsobj2pyobj(window.confirm),
            "document": $B.DOMNode.$factory(document),
            doc: $B.DOMNode.$factory(document), // want to use document instead of doc
            DOMEvent:$B.DOMEvent,
            DOMNode: $B.DOMNode,
            load:function(script_url){
                // Load and eval() the Javascript file at script_url
                var file_obj = $B.builtins.open(script_url)
                var content = $B.$getattr(file_obj, 'read')();
                eval(content);
            },
            load1:function(script_url, callback){
                // Load and eval() the Javascript file at script_url
                //var file_obj = $B.builtins.open(script_url)
                //var content = $B.$getattr(file_obj, 'read')()
                //console.log('content', content.length)
                var script = document.createElement('SCRIPT')
                script.src = script_url
                if(callback){
                    script.addEventListener('load', function(){
                        callback()
                    })
                }
                document.body.appendChild(script)
            },
            mouseCoords: function(ev){
                return $B.jsobj2pyobj($B.$mouseCoords(ev))
            },
            prompt: function(message, default_value){
                return $B.jsobj2pyobj(window.prompt(message, default_value||''))
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
            URLParameter:function(name) {
                name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
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

            function makeTagClass(tagName){
                // return the the class associated with tagName
                var cls = $B.make_builtin_class(tagName, [$B.DOMNode])

                var cls_funcs = cls.tp_funcs = {}

                cls.tp_init = function(){
                    var $ns = $B.args('__init__', 1, {self: null}, ['self'],
                        arguments, {}, 'args', 'kw'),
                        self = $ns['self'],
                        args = $ns['args']
                    if(args.length == 1){
                        var first = args[0]
                        if($B.$isinstance(first,[_b_.str, _b_.int, _b_.float])){
                            // set "first" as HTML content (not text)
                            self.innerHTML = _b_.str.$factory(first)
                        }else if($B.get_class(first) === TagSum){
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
                                        console.log(err, $B.get_class(err), err.args)
                                        console.log("first", first)
                                        console.log(arguments)
                                    }
                                    throw err
                                }
                            }
                        }
                    }

                    // attributes
                    for(var item of _b_.dict.$iter_items($ns.kw)){
                        // keyword arguments
                        var arg = item.key,
                            value = item.value
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
                                    $B.RAISE(_b_.ValueError,
                                        "can't set attribute " + arg)
                                }
                            }
                        }
                    }
                }

                cls.tp_new = function(cls){
                    // Only called for subclasses of the HTML tag
                    var res = document.createElement(tagName)
                    if(cls !== html[tagName]){
                        // Only set ob_type if it is not browser.html.<tagName>
                        res.ob_type = cls
                    }
                    return res
                }

                cls.tp_getattroXXX = function(self, attr){
                    console.log('getattro', cls, self, attr)
                    var res = self[attr] ?? $B.NULL
                    if(res === $B.NULL && self.dict){
                        res = _b_.dict.$get_string(self.dict, attr, $B.NULL)
                    }else{
                        res = $B.jsobj2pyobj(res)
                    }
                    return res
                }

                cls_funcs.__rmul__ = function(self, num){
                    return $B.DOMNode.__mul__(self, num)
                }

                $B.set_func_names(cls, "browser.html")
                return cls
            }

            function makeFactory(klass){
                // Create the factory function for HTML tags.
                return (function(k){
                    return function(){
                        var res
                        if(k.__name__ == 'SVG'){
                            res = $B.DOMNode.$factory(
                                document.createElementNS("http://www.w3.org/2000/svg", "svg"), true)
                        }else{
                            try{
                                res = document.createElement(k.__name__)
                            }catch(err){
                                console.log('error ' + err)
                                console.log('creating element', k.__name__)
                                throw err
                            }
                        }
                        // apply __init__
                        var init = k.tp_init
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
                    $B.RAISE(_b_.TypeError, "html.maketag expects a string as argument")
                }
                if(html[tagName] !== undefined){
                    $B.RAISE(_b_.ValueError, "cannot reset class for "
                        + tagName)
                }
                var klass = makeTagClass(tagName)
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
    $B.UndefinedType = $B.make_builtin_class("UndefinedType")
    $B.UndefinedType.$factory = function(){
        return $B.Undefined
    }
    $B.UndefinedType.__bool__ = function(){
        return false
    }
    $B.UndefinedType.tp_repr = function(){
        return "<Javascript undefined>"
    }

    $B.Undefined = {
        ob_type: $B.UndefinedType
    }

    $B.set_func_names($B.UndefinedType, "javascript")

    // Class used by javascript.super()
    var super_class = $B.make_builtin_class("JavascriptSuper")
    super_class.$factory = function(){
        // Use Brython's super() to get a reference to self
        var res = _b_.super.$factory()
        var js_constr = res.__thisclass__.tp_bases[0]
        return function(){
            var obj = new js_constr.$js_func(...arguments)
            for(var attr in obj){
                res.__self_class__.dict[attr] = $B.jsobj2pyobj(obj[attr])
            }
            return obj
        }
    }

    super_class.tp_getattro = function(self, attr){
        if(attr == "__init__" || attr == "__call__"){
            return self.__init__
        }
        return $B.$getattr(self.__self_class__, attr, $B.NULL)
    }

    $B.set_func_names(super_class, "javascript")

    modules['javascript'] = {
        "this": function(){
            // returns the content of Javascript "this"
            // $B.js_this is set to "this" at the beginning of each function
            if($B.js_this === undefined){return $B.builtins.None}
            return $B.jsobj2pyobj($B.js_this)
        },
        Array: $B.js_array,
        Date: globalThis.Date, // && $B.jsobj2pyobj(self.Date),
        extends: function(js_constr){
            if((!js_constr.$js_func) ||
                    ! js_constr.$js_func.toString().startsWith('class ')){
                console.log(js_constr)
                $B.RAISE(_b_.TypeError,
                    'argument of extend must be a Javascript class')
            }
            js_constr.ob_type = _b_.type
            return function(obj){
                obj.tp_bases.splice(0, 0, js_constr)
                obj.__mro__.splice(0, 0, js_constr)
                return obj
            }
        },
        import_js: function(){
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
                        var $module = f()
                        if(typeof $module !== 'undefined'){
                            result = $B.module.$factory(alias)
                            for(var key in $module){
                                result[key] = $B.jsobj2pyobj($module[key])
                            }
                            result.__file__ = url
                        }else{
                            console.log(this.responseText)
                            result = $B.EXC(_b_.ImportError, 'Javascript ' +
                                `module at ${url} doesn't define $module`)
                        }
                    }else{
                        result = $B.EXC(_b_.ModuleNotFoundError, url)
                    }
                }
            }
            xhr.send()
            if($B.$isinstance(result, _b_.BaseException)){
                $B.handle_error(result)
            }else{
                if(alias === _b_.None){
                    // set module name from url
                    var name = url.split('.')
                    if(name.length > 1){
                        name.pop() // remove extension
                    }
                    alias = name.join('.')
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
                $B.RAISE(_b_.TypeError,
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
                    return $B.$call(callback, ...loaded)
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
                $B.RAISE(_b_.TypeError,
                    `first argument must be a list, got ${$B.class_name(refs)}`)
            }

            if(refs.length > 0){
                var ref = refs.shift()
                var script = document.createElement('script')
                script.src = ref
                script.addEventListener('load',
                    function(){
                        loaded.push(script)
                        $B.imported.javascript.import_scripts(refs, callback, loaded)
                    }
                )
                document.body.appendChild(script)
            }else{
                return $B.$call(callback, ...loaded)
            }
        },

        JSObject: $B.JSObj,
        JSON: {
            ob_type: $B.make_builtin_class("JSON"),
            parse: function(){
                return $B.structuredclone2pyobj(
                    JSON.parse.apply(this, arguments))
            },
            stringify: function(obj, replacer, space){
                return JSON.stringify($B.pyobj2structuredclone(obj, false),
                    $B.jsobj2pyobj(replacer), space)
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
        Math: self.Math && $B.jsobj2pyobj(self.Math),
        NULL: null,
        NullType: $B.make_builtin_class('NullType'),
        Number: self.Number && $B.jsobj2pyobj(self.Number),
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
        RegExp: self.RegExp && $B.jsobj2pyobj(self.RegExp),
        String: self.String && $B.jsobj2pyobj(self.String),
        "super": super_class,
        UNDEFINED: $B.Undefined,
        UndefinedType: $B.UndefinedType
    }

    modules.javascript.NullType.__module__ = 'javascript'

    modules.javascript.NullType.__eq__ = function(_self, other){
        // in Javascript, null == undefined is true...
        return other === null || other === $B.Undefined
    }

    modules.javascript.NullType.tp_repr = function(_self){
        // in Javascript, null == undefined is true...
        return '<Javascript null>'
    }

    $B.set_func_names(modules.javascript.NullType, 'javascript')

    modules.javascript.UndefinedType.__module__ = 'javascript'

    // Default standard output and error
    // Can be reset by sys.stdout or sys.stderr
    var $io = $B.$io = $B.make_builtin_class("io")
    $io.$factory = function(out){
        return {
            ob_type: $io,
            dict: $B.empty_dict(),
            out,
            encoding: 'utf-8'
        }
    }
    var $io_funcs = $io.tp_funcs = {}

    $io_funcs.flush = function(self){
        if(self.buf){
            // replace chr(0) by ' ' for printing
            var s = self.buf.join(''),
                chr0 = String.fromCodePoint(0)
            s = s.replace(new RegExp(chr0, 'g'), ' ')
            console[self.out](s)
            if(s.includes('__spec__')){
                console.log(Error('trace').stack)
            }
            self.buf = []
        }
    }

    $io_funcs.write = function(self, msg){
        // Default to printing to browser console
        if(self.buf === undefined){
            self.buf = []
        }
        if(typeof msg != "string"){
            $B.RAISE(_b_.TypeError, "write() argument must be str, not " +
                $B.class_name(msg))
        }
        self.buf.push(msg)
        return _b_.None
    }

    $io.tp_methods = ["flush", "write"]

    // _sys module is at the core of Brython since it is paramount for
    // the import machinery.
    // see https://github.com/brython-dev/brython/issues/189
    // see https://docs.python.org/3/reference/toplevel_components.html#programs
    modules['_sys'] = {
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
            return $B.$call(hook, ...arguments)
        },
        exc_info: function(){
            var frame_obj = $B.frame_obj,
                frame,
                exc
            while(frame_obj !== null){
                frame = frame_obj.frame
                exc = frame[1].$current_exception
                if(exc){
                    return _b_.tuple.$factory([$B.get_class(exc), exc,
                        $B.$getattr(exc, "__traceback__")])
                }
                frame_obj = frame_obj.prev
            }
            return _b_.tuple.$factory([_b_.None, _b_.None, _b_.None])
        },
        excepthook: function(exc_class, exc_value){
            $B.show_error(exc_value)
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
        executable: $B.strip_host($B.brython_path + 'brython.js'),
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
        modules: $B.obj_dict($B.imported),
        path: _b_.property.$factory(
            function(){
                var filename = $B.get_filename_for_import()
                return $B.$list($B.import_info[filename].path)
            },
            function(self, value){
                var filename = $B.get_filename_for_import()
                $B.import_info[filename].path = value
            }
        ),
        meta_path: _b_.property.$factory(
            function(){
                var filename = $B.get_filename()
                return $B.$list($B.import_info[filename].meta_path)
            },
            function(self, value){
                var filename = $B.get_filename()
                $B.import_info[filename].meta_path = value
            }
        ),
        path_hooks: _b_.property.$factory(
            function(){
                var filename = $B.get_filename()
                return $B.$list($B.import_info[filename].path_hooks)
            },
            function(self, value){
                var filename = $B.get_filename()
                $B.import_info[filename].path_hooks = value
            }
        ),
        path_importer_cache: _b_.property.$factory(
            function(){
                return _b_.dict.$factory($B.jsobj2pyobj($B.path_importer_cache))
            },
            function(){
                $B.RAISE(_b_.TypeError, "Read only property" +
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
                $B.RAISE(_b_.TypeError, "Read only property 'sys.vfs'")
            }
        )
    }

    var WarningMessage = $B.make_builtin_class("WarningMessage")
    WarningMessage.$factory = function(){
        var $ = $B.make_args("WarningMessage", 8,
            {message: null, category: null, filename: null, lineno: null,
             file: null, line:null, source: null},
             ['message', 'category', 'filename', 'lineno', 'file',
              'line', 'source'],
             arguments, {file: _b_.None, line: _b_.None, source: _b_.None},
             null, null)
        return {
            ob_type: WarningMessage,
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

    // _warnings provides basic warning filtering support.
    modules._warnings = {
        _defaultaction: "default",
        _filters_mutated: function(){
        },
        _onceregistry: $B.empty_dict(),
        filters: $B.$list([
            $B.fast_tuple(['default', _b_.None, _b_.DeprecationWarning, '__main__', 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.DeprecationWarning, _b_.None, 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.PendingDeprecationWarning, _b_.None, 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.ImportWarning, _b_.None, 0]),
            $B.fast_tuple(['ignore', _b_.None, _b_.ResourceWarning, _b_.None, 0])
        ]),
        warn: function(){
            // Issue a warning, or maybe ignore it or raise an exception.
            var $ = $B.args('warn', 4,
                            {message: null, category: null, stacklevel: null, source: null},
                            ['message', 'category', 'stacklevel', 'source'],
                            arguments, {category: _b_.UserWarning, stacklevel: 1, source: _b_.None},
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
                var syntax_error = $B.EXC(_b_.SyntaxError, message.args[0])
                syntax_error.args[1] = [message.filename, message.lineno,
                    message.offset, message.line]
                syntax_error.filename = message.filename
                syntax_error.lineno = message.lineno
                syntax_error.offset = message.offset
                syntax_error.line = message.line
                throw syntax_error
            }
            var warning_message,
                filename,
                file,
                lineno,
                line
            if(category === _b_.SyntaxWarning){
                filename = message.filename,
                lineno = message.lineno,
                line = message.text
                var src = $B.file_cache[file]
                if(src){
                    var lines = src.split('\n'),
                        line = lines[lineno - 1]
                }
                warning_message = {
                    ob_type: WarningMessage,
                    message: message,
                    category,
                    filename,
                    lineno,
                    file: _b_.None,
                    line,
                    source: _b_.None,
                    _category_name: category.__name__
                }
            }else{
                let frame_rank = Math.max(0, $B.count_frames() - stacklevel)
                var frame = $B.get_frame_at(frame_rank)
                file = frame.__file__
                let f_code = $B.$getattr(frame, 'f_code'),
                    src = $B.file_cache[file]
                lineno = message.lineno || frame.$lineno
                line = src ? src.split('\n')[lineno - 1] : null
                warning_message = {
                    ob_type: WarningMessage,
                    message: message,
                    category,
                    filename: message.filename || f_code.co_filename,
                    lineno,
                    file: _b_.None,
                    line: line || _b_.None,
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
            return _b_.None
        },
        warn_explicit: function(){
            // Low-level interface to warnings functionality.
            console.log("warn_explicit", arguments)
        }
    }

    // Suggestions in case of NameError or AttributeError
    var MAX_CANDIDATE_ITEMS = 750,
        MOVE_COST = 2,
        CASE_COST = 1,
        SIZE_MAX = 65535

    function LEAST_FIVE_BITS(n){
        return ((n) & 31)
    }

    function levenshtein_distance(a, b, max_cost){
        // Compute Leveshtein distance between strings a and b
        if(a == b){
            return 0
        }
        if(a.length < b.length){
            [a, b] = [b, a]
        }

        while(a.length && a[0] == b[0]){
            a = a.substr(1)
            b = b.substr(1)
        }
        while(a.length && a[a.length - 1] == b[b.length - 1]){
            a = a.substr(0, a.length - 1)
            b = b.substr(0, b.length - 1)
        }
        if(b.length == 0){
            return a.length * MOVE_COST
        }
        if ((b.length - a.length) * MOVE_COST > max_cost){
            return max_cost + 1
        }
        var buffer = []
        for(var i = 0; i < a.length; i++) {
            // cost from b[:0] to a[:i+1]
            buffer[i] = (i + 1) * MOVE_COST
        }
        var result = 0
        for(var b_index = 0; b_index < b.length; b_index++) {
            var code = b[b_index]
            // cost(b[:b_index], a[:0]) == b_index * MOVE_COST
            var distance = result = b_index * MOVE_COST;
            var minimum = SIZE_MAX;
            for(var index = 0; index < a.length; index++) {
                // 1) Previous distance in this row is cost(b[:b_index], a[:index])
                var substitute = distance + substitution_cost(code, a[index])
                // 2) cost(b[:b_index], a[:index+1]) from previous row
                distance = buffer[index]
                // 3) existing result is cost(b[:b_index+1], a[index])
                var insert_delete = Math.min(result, distance) + MOVE_COST
                result = Math.min(insert_delete, substitute)

                buffer[index] = result
                if (result < minimum) {
                    minimum = result
                }
            }
            if (minimum > max_cost) {
                // Everything in this row is too big, so bail early.
                return max_cost + 1
            }
        }
        return result
    }

    function substitution_cost(a, b){
        if(LEAST_FIVE_BITS(a) != LEAST_FIVE_BITS(b)){
            // Not the same, not a case flip.
            return MOVE_COST
        }
        if(a == b){
            return 0
        }
        if(a.toLowerCase() == b.toLowerCase()){
            return CASE_COST
        }
        return MOVE_COST
    }

    modules['_suggestions'] = {
        _generate_suggestions: function(dir, name){
            if(dir.length >= MAX_CANDIDATE_ITEMS) {
                return null
            }

            var suggestion_distance = 2 ** 52,
                suggestion = null

            for(var item of dir){
                // No more than 1/3 of the involved characters should need changed.
                var max_distance = (name.length + item.length + 3) * MOVE_COST / 6
                // Don't take matches we've already beaten.
                max_distance = Math.min(max_distance, suggestion_distance - 1)
                var current_distance =
                    levenshtein_distance(name, item, max_distance)
                if(current_distance > max_distance){
                    continue
                }
                if(!suggestion || current_distance < suggestion_distance){
                    suggestion = item
                    suggestion_distance = current_distance
                }
            }
            if(suggestion == name){
                // avoid messages such as
                // "object has no attribute 'foo'. Did you mean: 'foo'?"
                return null
            }
            return suggestion
        }
    }

    var responseType = {
        "text": "text",
        "binary": "arraybuffer",
        "dataURL": "arraybuffer"
    }

    function handle_kwargs(kw, method){
        var result = {
                cache: false,
                format: 'text',
                mode: 'text',
                headers: {}
            }
        for(let item of _b_.dict.$iter_items(kw)){
            let key = item.key,
                value = item.value
            if(key == "data"){
                var params = value
                if(typeof params == "string"  || params instanceof FormData){
                    result.body = params
                }else if($B.$isinstance(params, _b_.bytes)){
                    result.body = new ArrayBuffer(params.source.length)
                    var array = new Int8Array(data)
                    for(let i = 0, len = params.source.length; i < len; i++){
                        array[i] = params.source[i]
                    }
                }else{
                    if($B.get_class(params) !== _b_.dict){
                        $B.RAISE(_b_.TypeError, "wrong type for data, " +
                            "expected dict, bytes or str, got " +
                            $B.class_name(params))
                    }
                    var items = []
                    for(let subitem of _b_.dict.$iter_items(params)){
                        items.push(encodeURIComponent(subitem.key) + "=" +
                                   encodeURIComponent($B.pyobj2jsobj(subitem.value)))
                    }
                    result.body = items.join("&")
                }
            }else if(key == "headers"){
                if(! $B.$isinstance(value, _b_.dict)){
                    $B.RAISE(_b_.ValueError,
                        "headers must be a dict, not " + $B.class_name(value))
                }
                for(let subitem of _b_.dict.$iter_items(value)){
                    result.headers[subitem.key.toLowerCase()] = subitem.value
                }
            }else if(["cache", "format", "mode"].includes(key)){
                result[key] = value
            }
        }
        if(method == "post"){
            // For POST requests, set default header
            if(! result.headers.hasOwnProperty("content-type")){
                result.headers["Content-Type"] = "application/x-www-form-urlencoded"
            }
        }
        return result
    }

    var HTTPRequest = $B.make_builtin_class("HTTPRequest")

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

    var Future = $B.make_builtin_class("Future")
    Future.$factory = function(){
        var methods = {}
        var promise = new Promise(function(resolve, reject){
            methods.resolve = resolve
            methods.reject = reject
        })
        promise._methods = methods
        promise._done = false
        promise.ob_type = Future
        return promise
    }

    Future.done = function(){
        var $ = $B.args('done', 1, {self:null},
                        ['self'], arguments, {}, null, null)
        return !! $.self._done
    }

    Future.set_result = function(){
        var $ = $B.args('set_result', 2, {self:null, value: null},
                        ['self', 'value'], arguments, {}, null, null)
        $.self._done = true
        $.self._methods.resolve($.value)
        return _b_.None
    }

    Future.set_exception = function(){
        var $ = $B.args('set_exception', 2, {self:null, exception: null},
                        ['self', 'exception'], arguments, {}, null, null)
        $.self._done = true
        $.self._methods.reject($.exception)
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
                return new Promise(function(resolve){
                    var xhr = new XMLHttpRequest()
                    xhr.open(method, url, true)
                    for(var key in args.headers){
                        xhr.setRequestHeader(key, args.headers[key])
                    }
                    xhr.format = args.format
                    xhr.responseType = responseType[args.format]
                    xhr.onreadystatechange = function(){
                        if(this.readyState == 4){
                            this.ob_type = HTTPRequest
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
            func.$function_infos = []
            func.$function_infos[$B.func_attrs.name] = `ajax_${method}`
            return {
                ob_type: $B.coroutine,
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
            return $B.get_class(f) === $B.coroutine
        },
        iscoroutinefunction: function(f){
            return (f.$function_infos[$B.func_attrs.flags] & 128) != 0
        },
        post: function(){
            return $B.imported['browser.aio'].ajax.bind(null, "POST").apply(null, arguments)
        },
        run: function(){
            var handle_success = function(){
                    $B.leave_frame()
                },
                handle_error = $B.show_error

            var $ = $B.args("run", 3, {coro: null, onsuccess: null, onerror: null},
                    ["coro", "onsuccess", "onerror"], arguments,
                    {onsuccess: handle_success, onerror: handle_error},
                    null, null),
                coro = $.coro,
                onsuccess = $.onsuccess,
                onerror = $.onerror

            var save_frame_obj = $B.frame_obj
            $B.$call($B.$getattr($B.coroutine, 'send'), coro).then(onsuccess).catch(onerror)
            $B.frame_obj = save_frame_obj
            return _b_.None
        },
        sleep: function(seconds){
            if($B.get_class(seconds) === _b_.float){
                seconds = seconds.value
            }else if(typeof seconds != "number"){
                $B.RAISE(_b_.TypeError, "'sleep' argument must be " +
                    "int or float, not " + $B.class_name(seconds))
            }
            var func = function(){
                return new Promise(resolve => setTimeout(
                    function(){resolve(_b_.None)}, 1000 * seconds))
            }
            func.$infos = {
                __name__: "sleep"
            }
            func.$function_infos = []
            func.$function_infos[$B.func_attrs.name] = 'sleep'
            return {
                ob_type: $B.coroutine,
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
        module_obj.ob_type = $B.module
        module_obj.dict = $B.empty_dict()
        module_obj.md_dict = $B.empty_dict()
        $B.imported[name] = module_obj
        // set attribute "name" of functions
        for(var attr in module_obj){
            if(typeof module_obj[attr] == 'function'){
                module_obj[attr].$infos = {
                    __module__: name,
                    __name__: attr,
                    __qualname__: name + '.' + attr
                }
                $B.set_function_infos(module_obj[attr],
                    {
                        __module__: name,
                        __name__: attr,
                        __qualname__: name + '.' + attr
                    }
                )
            }
            _b_.dict.$setitem(module_obj.md_dict, attr, module_obj[attr])
        }
        module_obj.__name__ = name
    }

    for(let attr in modules){
        load(attr, modules[attr])
    }
    if(!($B.isWebWorker || $B.isNode)){
        modules['browser'].html = modules['browser.html']
        modules['browser'].aio = modules['browser.aio']
    }

    // Set builtin name __builtins__
    _b_.__builtins__ = $B.module.$factory('__builtins__',
        'Python builtins')

    for(let attr in _b_){
        _b_.__builtins__[attr] = _b_[attr]
        $B.builtins_scope.binding[attr] = true
        if(_b_[attr].$is_class){
            if(! _b_[attr].tp_bases){
                _b_[attr].tp_bases = [_b_.object]
            }
        }
    }
    _b_.__builtins__.__setattr__ = function(attr, value){
        _b_[attr] = value
    }

    // Attributes of __BRYTHON__ are Python lists
    for(let attr in $B){
        if(Array.isArray($B[attr])){
            $B[attr].ob_type = _b_.list
        }
    }

    // Cell objects, for free variables in functions
    // Must be defined after dict, because property uses it
    $B.cell = $B.make_builtin_class("cell")
    $B.cell.$factory = function(value){
        return {
            ob_type: $B.cell,
            $cell_contents: value
        }
    }


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

    /* cell start */
    $B.cell.tp_richcompare = function(self){

    }

    $B.cell.tp_repr = function(self){
        return '<cell object>'
    }

    $B.cell.tp_hash = function(self){

    }

    $B.cell.tp_new = function(self){

    }

    var cell_funcs = $B.cell.tp_funcs = {}

    cell_funcs.__new__ = function(self){

    }

    cell_funcs.cell_contents_get = function(self){
        if(self.$cell_contents === null){
            $B.RAISE(_b_.ValueError, "empty cell")
        }
        return self.$cell_contents
    }

    cell_funcs.cell_contents_set = function(self){
        self.$cell_contents = value
    }

    $B.cell.functions_or_methods = ["__new__"]

    $B.cell.tp_getset = ["cell_contents"]

    /* cell end */

    $B.set_func_names($B.cell, "builtins")

    for(let flag in $B.builtin_class_flags.types){
        for(let key of $B.builtin_class_flags.types[flag]){
            if($B[key]){
                $B[key].__flags__ = parseInt(flag)
            }
        }
    }

    $B.AST = {
        ob_type: _b_.type,
        __mro__: [_b_.object],
        tp_name: 'AST',
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
            }else if($B.get_class(js_node) !== $B.JSObj){
                return js_node
            }else{
                console.log('cannot handle', js_node)
                return js_node
            }
        }
    }

$B.stdin = {
    ob_type: $io,
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

// Populated in py2js.brython(), used for sys.argv
$B.__ARGV = $B.$list([])

// set default trace function (cf. sys.settrace)
$B.tracefunc = _b_.None

// make built-in module builtins
var builtins_doc = "Built-in functions, types, exceptions, and other " +
    "objects.\n\nThis module provides direct access to all 'built-in'" +
    "\nidentifiers of Python; for example, builtins.len is\nthe full name" +
    " for the built-in function len().\n\nThis module is not normally " +
    "accessed explicitly by most\napplications, but can be useful in " +
    "modules that provide\nobjects with the same name as a built-in value, " +
    "but in\nwhich the built-in of that name is also needed."
$B.imported.builtins = $B.module.tp_new($B.module, 'builtins', builtins_doc)

for(var attr in _b_){
    $B.module_setattr($B.imported.builtins, attr, _b_[attr])
}


})(__BRYTHON__);
