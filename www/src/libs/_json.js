var $module=(function($B){

var _b_ = $B.builtins

function simple(obj){
    switch(typeof obj){
        case 'string':
        case 'number':
        case 'boolean':
            return true
    }
    if(obj instanceof Number ||
            Array.isArray(obj) ||
            _b_.isinstance(obj, [_b_.list, _b_.tuple, _b_.dict])){
        return true
    }
    return false
}

function to_json(obj, level){
    var $defaults = {skipkeys:_b_.False, ensure_ascii:_b_.True,
            check_circular:_b_.True, allow_nan:_b_.True, cls:_b_.None,
            indent:_b_.None, separators:_b_.None, "default":_b_.None,
            sort_keys:_b_.False},
        $ = $B.args("to_json", 2, {obj: null, level: null}, ['obj', 'level'],
                    arguments, {level: 1}, null, "kw"),
        kw = $.kw.$string_dict

    for(key in $defaults){
        if(kw[key] === undefined){
            kw[key] = $defaults[key]
        }else{
            kw[key] = kw[key][0]
        }
    }

    var indent = kw.indent,
        ensure_ascii = kw.ensure_ascii,
        separators = kw.separators === _b_.None ?
             kw.indent === _b_.None ? [', ', ': '] : [',', ': '] :
            kw.separators,
        skipkeys = kw.skipkeys,
        $$default = kw.default,
        sort_keys = kw.sort_keys,
        allow_nan = kw.allow_nan,
        check_circular = kw.check_circular
    var item_separator = separators[0],
        key_separator = separators[1]
    if(indent !== _b_.None){
        var indent_str
        if(typeof indent == "string"){
            indent_str = indent
        }else if(typeof indent == "number" && indent >= 1){
            indent_str = " ".repeat(indent)
        }else{
            throw _b_.ValueError.$factory("invalid indent: " +
                _b_.str.$factory(indent))
        }
    }
    var kwarg = {$nat: "kw", kw: {}}
    for(var key in kw){
        kwarg.kw[key] = kw[key]
    }
    switch(typeof obj){
        case 'string':
            var res = JSON.stringify(obj)
            if(ensure_ascii){
                var escaped = ''
                for(var i = 0, len = res.length; i < len; i++){
                    var u = res.codePointAt(i)
                    if(u > 127){
                        u = u.toString(16)
                        while(u.length < 4){
                            u = "0" + u
                        }
                        escaped += '\\u' + u
                    }else{
                        escaped += res.charAt(i)
                    }
                }
                return escaped
            }
            return res
        case 'boolean':
            return obj.toString()
        case 'number':
            if([Infinity, -Infinity].indexOf(obj) > -1 ||
                    isNaN(obj)){
                if(! allow_nan){
                    throw _b_.ValueError.$factory(
                        'Out of range float values are not JSON compliant')
                }
            }
            return obj.toString()
    }
    if(_b_.isinstance(obj, _b_.list)){
        var res = []
        var sep = item_separator,
            first = '[',
            last = ']'
        if(indent !== _b_.None){
            sep += "\n" + indent_str.repeat(level)
            first = '[' + '\n' + indent_str.repeat(level)
            last = '\n' + indent_str.repeat(level - 1) + ']'
            level++
        }
        for(var i = 0, len = obj.length; i < len; i++){
            res.push(to_json(obj[i], level, kwarg))
        }
        return first + res.join(sep) + last
    }else if(obj instanceof Number){
        return obj.valueOf()
    }else if(obj === _b_.None){
        return "null"
    }else if(_b_.isinstance(obj, _b_.dict)){
        var res = [],
            items = $B.dict_to_list(obj)
        if(sort_keys){
            // Sort keys by alphabetical order
            items.sort()
        }
        var sep = item_separator,
            first = '{',
            last = '}'
        if(indent !== _b_.None){
            sep += "\n" + indent_str.repeat(level)
            first = '{' + '\n' + indent_str.repeat(level)
            last = '\n' + indent_str.repeat(level - 1) + '}'
            level++
        }
        for(var i = 0, len = items.length; i < len; i++){
            var item = items[i]
            if(! simple(item[0])){
                if(! skipkeys){
                    throw _b_.TypeError.$factory("keys must be str, int, " +
                        "float, bool or None, not " + $B.class_name(obj))
                }
            }else{
                // In the result, key must be a string
                var key = _b_.str.$factory(item[0])
                // Check circular reference
                if(check_circular && $B.repr.enter(item[1])){
                    throw _b_.ValueError.$factory("Circular reference detected")
                }
                res.push(
                    [to_json(key, level, kwarg), to_json(item[1], level, kwarg)].
                    join(key_separator))
                if(check_circular){
                    $B.repr.leave(item[1])
                }
            }
        }
        return first + res.join(sep) + last
    }
    // For other types, use function default if provided
    if($$default == _b_.None){
        throw _b_.TypeError.$factory("Object of type " + $B.class_name(obj) +
            " is not JSON serializable")
    }else{
        return to_json($B.$call($$default)(obj), level, kwarg)
    }
}

function from_json(s){
    var $defaults = {cls: _b_.None, object_hook: _b_.None,
            parse_float: _b_.None, parse_int: _b_.None,
            parse_constant: _b_.None, object_pairs_hook: _b_.None},
        $ = $B.args("from_json", 1, {s: null}, ['s'], arguments, {},
            null, "kw"),
        kw = $.kw.$string_dict
    if(Object.keys(kw).length == 0){
        // default
        return $B.structuredclone2pyobj(JSON.parse(s))
    }
    for(key in $defaults){
        if(kw[key] === undefined){
            kw[key] = $defaults[key]
        }else{
            kw[key] = kw[key][0]
        }
    }

    function reviver(key, value){
        if(typeof value == "number"){
            if(Number.isInteger(value) && kw.parse_int !== _b_.None){
                return $B.$call(kw.parse_int)(value.toString())
            }else if(! Number.isInteger(value) && kw.parse_float !== _b_.None){
                return $B.$call(kw.parse_float)(value.toString())
            }else if((value === Infinity || value === -Infinity) &&
                    kw.parse_constant !== _b_.None){
                return $B.$call(kw.parse_constant)(value)
            }else{
                return value
            }
        }else if(isNaN(value) && kw.parse_constant !== _b_.None){
            return $B.$call(kw.parse_constant)(value)
        }else if(typeof value == "object" && !Array.isArray(value) &&
                (kw.object_hook !== _b_.None ||
                    kw.object_pairs_hook !== _b_.None)){
            // Apply Python function object_hook to the Python dictionary
            // built from the Javascript object "value"
            var py_dict = $B.structuredclone2pyobj(value)
            if(kw.object_pairs_hook === _b_.None){
                var res = $B.$call(kw.object_hook)(py_dict)
            }else{
                var items = $B.dict_to_list(py_dict),
                    res = $B.$call(kw.object_pairs_hook)(items)
            }
            // Transform the result of the Python function to a Javascript
            // object
            return $B.pyobj2structuredclone(res)
        }else{
            return value
        }
    }

    return $B.structuredclone2pyobj(JSON.parse(s, reviver))
}

return {
    dumps: function(){
        return _b_.str.$factory(to_json.apply(null, arguments))
    },
    loads: from_json
}

})(__BRYTHON__)