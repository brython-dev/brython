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

function to_json(){
    var $ = $B.args("to_json", 2, {obj: null, level: null}, ['obj', 'level'],
                    arguments, {level: 1}, null, "kw"),
        obj = $.obj,
        level = $.level,
        kw = $.kw.$string_dict,
        indent = kw.indent === undefined ? _b_.None : kw.indent[0],
        ensure_ascii = kw.ensure_ascii === undefined ? true : kw.ensure_ascii[0],
        separators = kw.separators === undefined ?
            indent === _b_.None ? [', ', ': '] : [',', ': '] :
            kw.separators,
        skipkeys = kw.skipkeys === undefined ? false : kw.skipkeys[0],
        $$default = kw.default === undefined ? _b_.None : kw.default[0],
        sort_keys = kw.sort_keys === undefined ? false : kw.sort_keys[0],
        allow_nan = kw.allow_nan === undefined ? true : kw.allow_nan[0],
        check_circular = kw.check_circular === undefined ? true : kw.check_circular[0]
    var item_separator = separators[0],
        key_separator = separators[1]
    if(indent !== _b_.None){
        var indent_str
        if(typeof indent == "string"){
            indent_str = indent
        }else if(typeof indent == "number" && indent >= 1){
            indent_str = " ".repeat(indent)
        }else{
            console.log("indent",indent)
            throw _b_.ValueError.$factory("invalid indent: " +
                _b_.str.$factory(indent))
        }
    }
    var kwarg = {$nat: "kw", kw: {}}
    for(var key in kw){
        kwarg.kw[key] = kw[key][0]
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
    }else if(obj.__class__ === _b_.dict){
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

return {
    _dumps: function(){
        return _b_.str.$factory(to_json.apply(null, arguments))
    }
}

})(__BRYTHON__)