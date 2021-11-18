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
        _default = kw.default,
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
    if(_default == _b_.None){
        throw _b_.TypeError.$factory("Object of type " + $B.class_name(obj) +
            " is not JSON serializable")
    }else{
        return to_json($B.$call(_default)(obj), level, kwarg)
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
        var root = parse(text),
            value = root.content ? root.content : root.list[0]
        return to_py(value)
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

function load(url){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url + '?' + (Date.now()), false)
    var root = {}
    xhr.onreadystatechange = function(){
      if(this.readyState == 4){
        var text = xhr.responseText
        root.content = parse(text)
      }
    }
    xhr.send()
    console.log('root', root)
    root = root.content
    var value = root.content ? root.content : root.list[0]
    console.log('value', value)
    return to_py(value)
}

function to_py(obj){
    // Conversion to Python objects
    var res
    if(obj instanceof List){
        return obj.items.map(to_py)
    }else if(obj instanceof Dict){
        var res = $B.empty_dict()
        for(var i = 0, len = obj.keys.length; i < len; i++){
            _b_.dict.$setitem(res, obj.keys[i], to_py(obj.values[i]))
        }
        return res
    }else{
        return obj
    }
}

function string_at(s, i){
    var j = i + 1,
        escaped = false,
        len = s.length
    while(j < len){
        if(s[j] == '"' && ! escaped){
          return [{type: 'str', value: s.substring(i + 1, j)}, j + 1]
        }else if(s[j] == '\\'){
          escaped = ! escaped
          j++
        }else{
          j++
        }
    }
}

function to_num(num_string, nb_dots, exp){
    // convert to correct Brython type
    if(exp || nb_dots){
        return new Number(num_string)
    }else{
        var int = parseInt(num_string)
        if(Math.abs(int) < $B.max_int){
            return int
        }else{
            if(num_string.startsWith('-')){
                return $B.fast_long_int(num_string.substr(1), false)
            }else{
                return $B.fast_long_int(num_string, true)
            }
        }
    }
}

function num_at(s, i){
  var res = s[i],
      j = i + 1,
      nb_dots = 0,
      exp = false,
      len = s.length
  while(j < len){
      if(s[j].match(/\d/)){
        j++
      }else if(s[j] == '.' && nb_dots == 0){
        nb_dots++
        j++
      }else if('eE'.indexOf(s[j]) > -1 && ! exp){
        exp = ! exp
        j++
      }else{
        return [{type: 'num', value: to_num(s.substring(i, j), nb_dots, exp)}, j]
      }
  }
  return [{type: 'num', value: to_num(s.substring(i, j), nb_dots, exp)}, j]
}

function* tokenize(s){
  var i = 0,
      len = s.length,
      value,
      end
  while(i < len){
    if(s[i] == " " || s[i] == '\r' || s[i] == '\n'){
      i++
    }else if(s[i] == '"'){
      [value, i] = string_at(s, i)
      yield value
    }else if(s[i].match(/\d/) || s[i] == '-'){
      [value, i] = num_at(s, i)
      yield value
    }else if('[]{}:,'.indexOf(s[i]) > -1){
      yield s[i]
      i++
    }else if(s.substr(i, 4) == 'null'){
      yield _b_.None
      i += 4
    }else if(s.substr(i, 4) == 'true'){
      yield true
      i += 4
    }else if(s.substr(i, 5) == 'false'){
      yield false
      i += 5
    }else{
      throw Error('unexpected: ' + s[i] + s.charCodeAt(i))
    }
  }
}

function Node(parent){
    this.parent = parent
    if(parent instanceof List){
        this.list = parent.items
    }else if(parent instanceof Dict){
        this.list = parent.values
    }else if(parent === undefined){
        this.list = []
    }
}

Node.prototype.transition = function(token){
    if([true, false, _b_.None].indexOf(token) > -1){
        this.list.push(token)
        return this.parent
    }else if(['str', 'num'].indexOf(token.type) > -1){
        this.list.push(token.value)
        return this.parent
    }else if(token == '{'){
        if(this.parent === undefined){
          this.content = new Dict(this)
          return this.content
        }
        return new Dict(this.parent)
    }else if(token == '['){
        if(this.parent === undefined){
            this.content = new List(this)
            return this.content
        }
        return new List(this.parent)
    }else{
        throw Error('unexpected item:' + token)
    }
}

function Dict(parent){
    this.parent = parent
    this.keys = []
    this.values = []
    this.expect = 'key'
    if(parent instanceof List){
        parent.items.push(this)
    }else if(parent instanceof Dict){
        parent.values.push(this)
    }
}

Dict.prototype.transition = function(token){
    if(this.expect == 'key'){
        if(token.type == 'str'){
            this.keys.push(token.value)
            this.expect = ':'
            return this
        }else{
            throw Error('expected str')
        }
    }else if(this.expect == ':'){
        if(token == ':'){
          this.expect = '}'
          return new Node(this)
        }else{
          throw Error('expected :')
        }
    }else if(this.expect == '}'){
        if(token == '}'){
            return this.parent
        }else if(token == ','){
            this.expect = 'key'
            return this
        }
        throw Error('expected }')
    }
}

function List(parent){
    if(parent === undefined){
      console.log('list, parent undefined')
    }
    if(parent instanceof List){
        parent.items.push(this)
    }
    this.parent = parent
    this.items = []
    this.expect = 'item'
}

List.prototype.transition = function(token){
    if(this.expect == 'item'){
        this.expect = ','
        if([true, false].indexOf(token) > -1){
            this.items.push(token)
            return this
        }else if(token.type == 'num' || token.type == 'str'){
            this.items.push(token.value)
            return this
        }else if(token == '{'){
            return new Dict(this)
        }else if(token == '['){
            return new List(this)
        }else if(token == ']'){
            if(this.items.length == 0){
                return this.parent
            }
            throw Error('unexpected ]')
        }else{
            console.log('token', token)
            throw Error('unexpected item:' + token)
        }

    }else if(this.expect == ','){
        this.expect = 'item'
        if(token == ','){
          return this
        }else if(token == ']'){
          if(this.parent instanceof Dict){
              this.parent.values.push(this)
          }
          return this.parent
        }else{
          throw Error('expected :')
        }
    }
}

function parse(s){
  var res,
      state,
      node = new Node(),
      root = node
  for(var item of tokenize(s)){
      node = node.transition(item)
  }
  return root
}

return {
    dscanstring: scanstring,
    dumps: function(){
        return _b_.str.$factory(to_json.apply(null, arguments))
    },
    loads: from_json
}

})(__BRYTHON__)