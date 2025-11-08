// Python to Javascript translation engine
(function($B){
"use strict";

var _b_ = $B.builtins

var _window

if ($B.isNode){
    _window = { location: {
        href:'',
        origin: '',
        pathname: ''} }
} else {
    _window = self
}
$B.parser = {}

/*
Utility functions
=================
*/

// Return a clone of an object
$B.clone = function(obj){
    var res = {}
    for(var attr in obj){
        res[attr] = obj[attr]
    }
    return res
}

// Last element in a list
$B.last = function(table){
    if(table === undefined){
        console.log($B.make_frames_stack())
    }
    return table[table.length - 1]
}


// $B.ast is in generated script py_ast.js
var ast = $B.ast


function get_line(filename, lineno){
    var src = $B.file_cache[filename],
        line = _b_.None
    if(src !== undefined){
        var lines = src.split('\n')
        line = lines[lineno - 1]
    }
    return line
}

// Adapted from Python/future.c
var VALID_FUTURES = ["nested_scopes",
                    "generators",
                    "division",
                    "absolute_import",
                    "with_statement",
                    "print_function",
                    "unicode_literals",
                    "barry_as_FLUFL",
                    "generator_stop",
                    "annotations"]

$B.future_features = function(mod, filename){
    var features = 0
    var i = 0;
    if(mod.body[0] instanceof $B.ast.Expr){
        if(mod.body[0].value instanceof $B.ast.Constant &&
                typeof mod.body[0].value.value == "string"){
            // docstring
            i++
        }
    }
    while(i < mod.body.length){
        var child = mod.body[i]
        if(child instanceof $B.ast.ImportFrom && child.module == '__future__'){
            // check names, update features
            for(var alias of child.names){
                var name = alias.name
                if(name == "braces"){
                    raise_error_known_location(_b_.SyntaxError, filename,
                        alias.lineno, alias.col_offset,
                        alias.end_lineno, alias.end_col_offset,
                        get_line(filename, child.lineno),
                        "not a chance")
                }else if(name == "annotations"){
                    features |= $B.CO_FUTURE_ANNOTATIONS
                }else if(VALID_FUTURES.indexOf(name) == -1){
                    raise_error_known_location(_b_.SyntaxError, filename,
                        alias.lineno, alias.col_offset,
                        alias.end_lineno, alias.end_col_offset,
                        get_line(filename, child.lineno),
                        `future feature ${name} is not defined`)
                }
            }
            i++
        }else{
            break
        }
    }
    return {features}
}


$B.format_indent = function(js, indent){
    // Indent JS code based on curly braces ({ and })
    var indentation = '  ',
        lines = js.split('\n'),
        level = indent,
        res = '',
        last_is_closing_brace = false,
        last_is_backslash = false,
        last_is_var_and_comma = false
    for(var i = 0, len = lines.length; i < len; i++){
        var line = lines[i],
            add_closing_brace = false,
            add_spaces = true
        if(last_is_backslash){
            add_spaces = false
        }else if(last_is_var_and_comma){
            line = '    ' + line.trim()
        }else{
            line = line.trim()
        }
        if(add_spaces && last_is_closing_brace &&
                (line.startsWith('else') ||
                 line.startsWith('catch') ||
                 line.startsWith('finally'))){
            res = res.substr(0, res.length - 1)
            add_spaces = false
        }
        last_is_closing_brace = line.endsWith('}')
        if(line.startsWith('}')){
            level--
        }else if(line.endsWith('}')){
            line = line.substr(0, line.length - 1)
            add_closing_brace = true
        }
        if(level < 0){
            if($B.get_option('debug') > 2){
                console.log('wrong js indent')
                //console.log(res)
            }
            level = 0
        }
        try{
            res += (add_spaces ? indentation.repeat(level) : '') + line + '\n'
        }catch(err){
            console.log(res)
            throw err
        }
        if(line.endsWith('{')){
            level++
        }else if(add_closing_brace){
            level--
            if(level < 0){
                level = 0
            }
            try{
                res += indentation.repeat(level) + '}\n'
            }catch(err){
                console.log(res)
                throw err
            }
        }
        last_is_backslash = line.endsWith('\\')
        last_is_var_and_comma = line.endsWith(',') &&
            (line.startsWith('var ') || last_is_var_and_comma)
    }
    return res
}


function get_docstring(node){
    var doc_string = _b_.None
    if(node.body.length > 0){
        var firstchild = node.body[0]
        if(firstchild instanceof $B.ast.Constant &&
                typeof firstchild.value == 'string'){
            doc_string = firstchild.value
        }
    }
    return doc_string
}

var s_escaped = 'abfnrtvxuU"0123456789' + "'" + '\\',
    is_escaped = {}
for(var i = 0; i < s_escaped.length; i++){
    is_escaped[s_escaped.charAt(i)] = true
}

function SurrogatePair(value){
    // value is a code point between 0x10000 and 0x10FFFF
    // attribute "str" is a Javascript string of 2 characters
    value =  value - 0x10000
    return String.fromCharCode(0xD800 | (value >> 10)) +
        String.fromCharCode(0xDC00 | (value & 0x3FF))
}


function test_escape(text, antislash_pos){
    // Test if the escape sequence starting at position "antislah_pos" in text
    // is is valid
    // string_start is the position of the first character after the quote
    // text is the content of the string between quotes
    // antislash_pos is the position of \ inside text
    var seq_end,
        mo
    // 1 to 3 octal digits = Unicode char
    mo = /^[0-7]{1,3}/.exec(text.substr(antislash_pos + 1))
    if(mo){
        return [String.fromCharCode(parseInt(mo[0], 8)), 1 + mo[0].length]
    }
    switch(text[antislash_pos + 1]){
        case "x":
            mo = /^[0-9A-F]{0,2}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 2){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                throw Error(
                     "(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\xXX escape")
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
            break
        case "u":
            mo = /^[0-9A-F]{0,4}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 4){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                throw Error(
                     "(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape")
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
            break
        case "U":
            mo = /^[0-9A-F]{0,8}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 8){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                throw Error(
                     "(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape")
            }else{
                let value = parseInt(mo[0], 16)
                if(value > 0x10FFFF){
                    throw Error('invalid unicode escape ' + mo[0])
                }else if(value >= 0x10000){
                    return [SurrogatePair(value), 2 + mo[0].length]
                }else{
                    return [String.fromCharCode(value), 2 + mo[0].length]
                }
            }
    }
}

$B.test_escape = test_escape // used in libs/_python_re.js

function unindent(src){
    // Brython supports scripts that don't start at column 0
    // Return unindented source, or raise SyntaxError if a line starts at a
    // column lesser than the first line.
    var lines = src.split('\n'),
        line,
        global_indent,
        indent,
        first,
        unindented_lines = []

    var min_indent
    for(var line of lines){
        if(/^\s*$/.exec(line)){
            continue
        }
        indent = line.match(/^\s*/)[0].length
        if(indent == 0){
            return src
        }
        if(min_indent === undefined){
            min_indent = indent
        }
        if(indent < min_indent){
            min_indent = indent
        }
    }

    for(var line of lines){
        if(/^\s*$/.exec(line)){
            unindented_lines.push(line)
        }else{
            unindented_lines.push(line.substr(min_indent))
        }
    }
    return unindented_lines.join('\n')
}

var $token = {}

$B.parse_time = 0

$B.py2js = function(src, module, locals_id, parent_scope){
    // src = Python source (string or object)
    // module = module name (string)
    // locals_id = the id of the block that will be created
    // parent_scope = the scope where the code is created
    //
    // Returns the Javascript code
    if(typeof module == "object"){
        module = module.__name__
    }

    parent_scope = parent_scope || $B.builtins_scope

    var filename,
        imported
    if(typeof src == 'object'){
        filename = src.filename
        imported = src.imported
        src = src.src
    }

    // normalize line ends to \n
    src = src.replace(/\r\n/g, '\n').
              replace(/\r/g, '\n')
    var locals_is_module = Array.isArray(locals_id)
    if(locals_is_module){
        locals_id = locals_id[0]
    }

    var t0 = globalThis.performance.now()

    // generated PEG parser
    var parser = new $B.Parser(src, filename, 'file'),
        _ast = $B._PyPegen.run_parser(parser)

    $B.parse_time += globalThis.performance.now() - t0
    var future = $B.future_features(_ast, filename)
    var symtable = $B._PySymtable_Build(_ast, filename, future)
    var js_obj = $B.js_from_root({ast: _ast,
                                  symtable,
                                  filename,
                                  src,
                                  imported})
    var js_from_ast = js_obj.js

    return {
        _ast,
        imports: js_obj.imports,
        to_js: function(){return js_from_ast}
    }
}

$B.parse_options = function(options){
    // By default, only set debug level
    if(options === undefined){
        options = {}
    }else if(typeof options == 'number'){
        // If the argument provided to brython() is a number, it is the debug
        // level
        options = {debug: options}
    }else if(typeof options !== 'object'){
        console.warn('ignoring invalid argument passed to brython():',
            options)
        options = {}
    }

    let options_lowered = {}
    for (const [key, value] of Object.entries(options)) {
        options_lowered[key.toLowerCase()] = value
    }
    options = options_lowered

    $B.debug = options.debug === undefined ? 1 : options.debug

    // set built-in variable __debug__
    _b_.__debug__ = $B.debug > 0

    // Default extension used in imports (cf. issue #1748)
    options.python_extension = options.python_extension || '.py'

    if($B.$options.args){
        $B.__ARGV = $B.$options.args
    }else{
        $B.__ARGV = _b_.list.$factory([])
    }

    $B.options_parsed = true
    return options
}

// set mutation observer to capture the scripts added to the page
// after this script (py2js.js)
if(!($B.isWebWorker || $B.isNode)){
    var startup_observer = new MutationObserver(function(mutations){
      for(var mutation of mutations){
        for(var addedNode of mutation.addedNodes){
          addPythonScript(addedNode);
        }
      }
    });

    startup_observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
}

var brython_options = $B.brython_options = {}

var python_scripts = []

if(!$B.isWebWorker){
    // If this script is not called in a web worker by importScripts,
    // store Python scripts already loaded in the page before loading this
    // script
    python_scripts = python_scripts.concat(Array.from(
        document.querySelectorAll('script[type="text/python"]'))).concat(
        Array.from(
        document.querySelectorAll('script[type="text/python3"]')))


    // handle content load
    var onload

    addEventListener('DOMContentLoaded',
        function(ev){
            if(ev.target.body){
                onload = ev.target.body.onload
            }
            if(! onload){
                // If no explicit "onload" is defined, default to brython
                ev.target.body.onload = function(){
                    return brython()
                }
            }else{
                // else, execute onload, and if brython() was not called,
                // call it, using the options defined in the custom tag
                // <brython_options>
                ev.target.body.onload = function(){
                    onload()
                    if(! status.brython_called){
                        brython()
                    }
                }
            }
        }
    )

    // define custom element <brython-options>
    class BrythonOptions extends HTMLElement {
        constructor(){
            super()
        }
        connectedCallback() {
            for(var attr of this.getAttributeNames()){
                brython_options[attr] = convert_option(attr, this.getAttribute(attr))
            }
        }
    }

    customElements.define('brython-options', BrythonOptions)

}

var defined_ids = {},
    script_to_id = new Map(),
    id_to_script = {}

function addPythonScript(addedNode){
    // callback function for the MutationObserver used once this script is
    // loaded (startup_observer)
    if(addedNode.tagName == 'SCRIPT' &&
           (addedNode.type == "text/python" ||
            addedNode.type == "text/python3")){
        python_scripts.push(addedNode)
    }
}

var status = {
    brython_called: false,
    first_unnamed_script: true
}

$B.dispatch_load_event = function(script){
    // dispatch 'load' event to be able to use the script when loaded
    // (cf issue 2215)
    script.dispatchEvent(new Event('load'))
}

function injectPythonScript(addedNode){
    // callback function for the MutationObserver used after brython() has
    // been called
    if(addedNode.tagName == 'SCRIPT' && addedNode.type == "text/python"){
        set_script_id(addedNode)
        run_scripts([addedNode])
    }
}

function set_script_id(script){
    if(script_to_id.has(script)){
        // ignore
    }else if(script.id){
        if(defined_ids[script.id]){
            throw Error("Brython error : Found 2 scripts with the " +
              "same id '" + script.id + "'")
        }else{
            defined_ids[script.id] = true
        }
        script_to_id.set(script, script.id)
    }else{
        if(script.className === 'webworker'){
            $B.RAISE_ATTRIBUTE_ERROR(
                    "webworker script has no attribute 'id'", script, 'id')
        }
        if(status.first_unnamed_script){
            script_to_id.set(script, '__main__')
            status.first_unnamed_script = false
        }else{
            script_to_id.set(script, '__main__' + $B.UUID())
        }
    }
    var id = script_to_id.get(script)
    id_to_script[id] = script
    return id
}

var brython = $B.parser.brython = function(options){
    $B.$options = $B.parse_options(options)

    if(!($B.isWebWorker || $B.isNode)){
        if(! status.brython_called){
            // first time brython() is called
            status.brython_called = true
            startup_observer.disconnect()
            // observe subsequent injections
            var inject_observer = new MutationObserver(function(mutations){
              for(var mutation of mutations){
                for(var addedNode of mutation.addedNodes){
                  injectPythonScript(addedNode);
                }
              }
            })

            inject_observer.observe(document.documentElement, {
              childList: true,
              subtree: true
            })
        }
    }else if($B.isNode){
        return
    }

    // initialize Map object script_to_id and object id_to_script
    for(var python_script of python_scripts){
        set_script_id(python_script)
    }

    var scripts = []

    // Save initial Javascript namespace
    var kk = Object.keys(_window)

    // Option to only run the scripts specified by their id
    var ids = $B.get_page_option('ids')
    if(ids !== undefined){
        if(! Array.isArray(ids)){
            $B.RAISE(_b_.ValueError, "ids is not a list")
        }
        if(ids.length == 0){
            // no script to run: return immediately
            //return
        }
        for(var id of ids){
            var script = document.querySelector(`script[id="${id}"]`)
            if(script){
                set_script_id(script)
                scripts.push(script)
            }else{
                console.log(`no script with id '${id}'`)
                $B.RAISE(_b_.KeyError, `no script with id '${id}'`)
            }
        }
    }else if($B.isWebWorker){
        // ignore
    }else{
        scripts = python_scripts.slice()
    }

    run_scripts(scripts)

    /* Uncomment to check the names added in global Javascript namespace
    var kk1 = Object.keys(_window)
    for (var i = 0; i < kk1.length; i++){
        if(kk[i] === undefined){
            console.log("leaking", kk1[i])
            console.log(window[kk1[i]])
        }
    }
    */
}

function convert_option(option, value){
    // Convert the options defined in tag <brython-options>
    if(option == 'debug'){
        if(typeof value == 'string' && value.match(/^\d+$/)){
            return parseInt(value)
        }else if(typeof value == 'number'){
            return value
        }else{
            if(value !== null && value !== undefined){
                console.debug(`Invalid value for debug: ${value}`)
            }
        }
    }else if(option == 'cache' ||
            option == 'indexeddb' ||
            option == 'static_stdlib_import'){
        if(value == '1' || value.toLowerCase() == 'true'){
            return true
        }else if(value == '0' || value.toLowerCase() == 'false'){
            return false
        }else{
            console.debug(`Invalid value for ${option}: ${value}`)
        }
    }else if(option == 'ids' || option == 'pythonpath' || option == 'args'){
        // passed as a list of space-separated values
        if(typeof value == 'string'){
            if(value.trim().length == 0){
                return []
            }
            return value.trim().split(/\s+/)
        }
    }else if(option == 'js_tab'){
        if(/\d+/.test(value)){
            var res = parseInt(value)
            if(res < 1 || res > 4){
                console.log('Warning: option "js_tab" must be between ' +
                    `1 and 4, got ${res}`)
                res = 2
            }
            return res
        }
        console.warn('illegal value for js_tab', value)
    }
    return value
}

const default_option = {
    args: [],
    cache: false,
    debug: 1,
    indexeddb: true,
    python_extension: '.py',
    static_stdlib_import: true,
    js_tab: 2
}

$B.get_filename = function(){
    if($B.count_frames() > 0){
        return $B.get_frame_at(0).__file__
    }
}

$B.get_filename_for_import = function(){
    var filename = $B.get_filename()
    if($B.import_info[filename] === undefined){
        $B.make_import_paths(filename)
    }
    return filename
}

$B.get_page_option = function(option){
    // Get option defined at page level
    // If brython is explicitely called in <body onload="brython(options)">,
    // use these options first
    option = option.toLowerCase()
    if($B.$options.hasOwnProperty(option)){
        // option passed to brython()
        return $B.$options[option]
    }else if(brython_options.hasOwnProperty(option)){
        // else use options defined in tag <brython-options>
        return brython_options[option]
    }else{
        return default_option[option]
    }
}

$B.get_option = function(option, err){
    var filename = $B.script_filename
    if(err && err.filename){
        filename = err.filename
    }else if(err && err.$frame_obj){
        filename = $B.get_frame_at(0, err.$frame_obj).__file__
    }else{
        filename = $B.get_filename() ?? filename
    }
    return $B.get_option_from_filename(option, filename)
}

$B.get_option_from_filename = function(option, filename){
    if(filename === undefined || ! $B.scripts[filename]){
        return $B.get_page_option(option)
    }
    var value = $B.scripts[filename].getAttribute(option)
    if(value !== null){
        return convert_option(option, value)
    }else{
        return $B.get_page_option(option)
    }
}

function run_scripts(_scripts){
    // Split between webworkers and other scripts
    var webworkers = _scripts.filter(script => script.className === 'webworker'),
        scripts = _scripts.filter(script => script.className !== 'webworker')

    var module_name,
        filename

    if(scripts.length > 0 || $B.isWebWorker){
        if($B.get_page_option('indexedDB') && $B.has_indexedDB &&
                $B.hasOwnProperty("VFS")){
            $B.tasks.push([$B.idb_open])
        }
    }
    var src
    for(var worker of webworkers){
        if(worker.src){
            // format <script type="text/python" src="python_script.py">
            // get source code by an Ajax call
            $B.tasks.push([$B.ajax_load_script,
                {script: worker, name: worker.id, url: worker.src, is_ww: true}])
        }else{
            // Get source code inside the script element
            $B.webworkers[worker.id] = worker
            filename = $B.script_filename = $B.strip_host(
                $B.script_path + "#" + worker.id)
            var source = (worker.innerText || worker.textContent)
            source = unindent(source) // remove global indentation
            // remove leading CR if any
            source = source.replace(/^\n/, '')
            $B.url2name[filename] = worker.id
            $B.file_cache[filename] = source
            $B.scripts[filename] = worker
            $B.dispatch_load_event(worker)
        }
    }

    for(var script of scripts){
        module_name = script_to_id.get(script)
        // Get Python source code
        if(script.src){
            // format <script type="text/python" src="python_script.py">
            // get source code by an Ajax call
            $B.tasks.push([$B.ajax_load_script,
                {script, name: module_name, url: script.src, id: script.id}])
        }else{
            filename = $B.script_filename = $B.strip_host(
                $B.script_path + "#" + module_name)
            // Get source code inside the script element
            src = (script.innerHTML || script.textContent)
            src = unindent(src) // remove global indentation
            // remove leading CR if any
            src = src.replace(/^\n/, '')
            // remove trailing \n
            if(src.endsWith('\n')){
                src = src.substr(0, src.length - 1)
            }
            // store source code
            $B.tasks.push([$B.run_script, script, src, module_name,
                           $B.script_path, true])
        }
    }
    $B.loop()
}

$B.run_script = function(script, src, name, url, run_loop){
    // run_loop is set to true if run_script is added to tasks in
    // ajax_load_script
    var filename = $B.script_filename = $B.strip_host(url + '#' + name)

    // set script dir
    var script_elts = url.split('/')
    script_elts.pop()
    $B.script_dir = script_elts.join('/')

    $B.file_cache[filename] = src
    $B.url2name[filename] = name
    $B.scripts[filename] = script

    // Initialize information for imports : path, meta_path, path_hooks
    $B.make_import_paths(filename) // in py_import.js

    // set built-in variable __debug__
    _b_.__debug__ = $B.get_option('debug') > 0

    var root,
        js

    try{
        root = $B.py2js({src: src, filename}, name, name)
        js = root.to_js()
        if($B.get_option_from_filename('debug', filename) > 1){
            console.log(js) //$B.format_indent(js, 0))
        }
    }catch(err){
        return $B.handle_error($B.exception(err)) // in loaders.js
    }
    var _script = {
            __doc__: get_docstring(root._ast),
            js: js,
            __name__: name,
            __file__: url,
            script_element: script
        }
    $B.tasks.push(["execute", _script])
    if(run_loop){
        $B.loop()
    }
}


// in case the name 'brython' is used in a Javascript library,
// we can use $B.brython
$B.brython = brython

})(__BRYTHON__);

globalThis.brython = __BRYTHON__.brython

if(__BRYTHON__.isNode){
    global.__BRYTHON__ = __BRYTHON__
    module.exports = { __BRYTHON__ }
}
