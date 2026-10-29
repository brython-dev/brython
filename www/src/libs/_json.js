(function($B) {

var _b_ = $B.builtins

const PY_SSIZE_T_MAX = 2 ** 64 - 1

var JSONDecodeError = $B.make_type('json.decoder.JSONDecodeError', [_b_.Exception])

$B.finalize_type(JSONDecodeError)
$B.set_func_names(JSONDecodeError, 'json.decoder')

function Stop(index, line, column) {
    this.index = index
    this.line = line
    this.column = column
}

function get_error() {
    // If module json is imported, use JSONDecodeError
    if ($B.imported.json) {
        return $B.module_getattr($B.imported.json, 'JSONDecodeError')
    } else {
        return JSONDecodeError
    }
}

function simple(obj) {
    switch (typeof obj) {
        case 'string':
        case 'number':
        case 'boolean':
            return true
    }
    if(obj instanceof Number ||
            Array.isArray(obj) ||
            $B.$isinstance(obj, [_b_.list, _b_.tuple, _b_.dict])){
        return true
    }
    return false
}

function to_json(obj, level) {
    var $defaults = {skipkeys:_b_.False, ensure_ascii:_b_.True,
            check_circular:_b_.True, allow_nan:_b_.True, cls:_b_.None,
            indent:_b_.None, separators:_b_.None, "default":_b_.None,
            sort_keys:_b_.False},
        $ = $B.args("to_json", 2, {obj: null, level: null}, arguments,
                {level: 1}, null, "kw")

    var kw = _b_.dict.$to_obj($.kw)
    for (var key in $defaults) {
        if (! kw.hasOwnProperty(key)) {
            kw[key] = $defaults[key]
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
    if (indent !== _b_.None) {
        var indent_str
        if (typeof indent == "string") {
            indent_str = indent
        } else if (typeof indent == "number" && indent >= 1) {
            indent_str = " ".repeat(indent)
        } else {
            $B.RAISE(_b_.ValueError, "invalid indent: " +
                _b_.str.$factory(indent))
        }
    }
    var kwarg = {[$B.KW]: [{}]}
    for (var key in kw) {
        kwarg[$B.KW][0][key] = kw[key]
    }

    switch (typeof obj) {
        case 'string':
            var res = JSON.stringify(obj)
            if (ensure_ascii) {
                var escaped = ''
                for (var i = 0, len = res.length; i < len; i++) {
                    var u = res.codePointAt(i)
                    if (u > 127) {
                        u = u.toString(16)
                        while (u.length < 4) {
                            u = "0" + u
                        }
                        escaped += '\\u' + u
                    } else {
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
                if (! allow_nan) {
                    $B.RAISE(_b_.ValueError,
                        'Out of range float values are not JSON compliant')
                }
            }
            return obj.toString()
        case "bigint":
            return obj.toString()
    }
    if (obj instanceof String) {
        if (! ensure_ascii) {
            return $B.String(obj)
        }
        // string with surrogate pairs. cf. issue #1903.
        var res = ''
        if (obj.surrogates) {
            var s_ix = 0,
                s_pos = obj.surrogates[s_ix]
            for (var i = 0, len = obj.length; i < len; i++) {
                if (i == s_pos) {
                    var code = obj.codePointAt(i) - 0x10000
                    res += '\\u' + (0xD800 | (code >> 10)).toString(16) +
                           '\\u' + (0xDC00 | (code & 0x3FF)).toString(16)
                    i++
                    s_ix++
                    s_pos = obj.surrogates[s_ix]
                } else {
                    var code = obj.charCodeAt(i)
                    if (code < 127) {
                        var x = _b_.repr(obj[i])
                        res += x.substr(1, x.length - 2)
                    } else {
                        var x = code.toString(16)
                        while (x.length < 4) {
                            x = '0' + x
                        }
                        res += '\\u' + x
                    }
                }
            }
        }
        return '"' + res.replace(new RegExp('"', "g"), '\\"') + '"'
    }

    if ($B.$isinstance(obj, [_b_.list, _b_.tuple])) {
        var res = []
        var sep = item_separator,
            first = '[',
            last = ']'
        if (indent !== _b_.None) {
            sep += "\n" + indent_str.repeat(level)
            first = '[' + '\n' + indent_str.repeat(level)
            last = '\n' + indent_str.repeat(level - 1) + ']'
            level++
        }
        for (var i = 0, len = obj.length; i < len; i++) {
            res.push(to_json(obj[i], level, kwarg))
        }
        return first + res.join(sep) + last
    } else if ($B.$isinstance(obj, _b_.float)) {
        return obj.value
    } else if ($B.is_big_int(obj)) {
        return $B.int_value(obj).toString()
    } else if (obj === _b_.None) {
        return "null"
    } else if ($B.is_dict(obj)) {
        var res = [],
            items = Array.from($B.make_js_iterator(_b_.dict.tp_funcs.items(obj)))
        if (sort_keys) {
            // Sort keys by alphabetical order
            items.sort()
        }
        var sep = item_separator,
            first = '{',
            last = '}'
        if (indent !== _b_.None) {
            sep += "\n" + indent_str.repeat(level)
            first = '{' + '\n' + indent_str.repeat(level)
            last = '\n' + indent_str.repeat(level - 1) + '}'
            level++
        }
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i]
            if (! simple(item[0])) {
                if (! skipkeys) {
                    $B.RAISE(_b_.TypeError, "keys must be str, int, " +
                        "float, bool or None, not " + $B.class_name(obj))
                }
            } else {
                // In the result, key must be a string
                var key = _b_.str.$factory(item[0])
                // Check circular reference
                if (check_circular && $B.repr.enter(item[1])) {
                    $B.RAISE(_b_.ValueError, "Circular reference detected")
                }
                res.push(
                    [to_json(key, level, kwarg), to_json(item[1], level, kwarg)].
                    join(key_separator))
                if (check_circular) {
                    $B.repr.leave(item[1])
                }
            }
        }
        return first + res.join(sep) + last
    }
    // For other types, use function default if provided
    if (_default == _b_.None) {
        console.log('obj', obj)
        $B.RAISE(_b_.TypeError, "Object of type " + $B.class_name(obj) +
            " is not JSON serializable")
    } else {
        return to_json($B.$call(_default, obj), level, kwarg)
    }
}

function loads(s) {
    var args = []
    for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i])
    }
    var decoder = JSONDecoder.$factory.apply(null, args)
    return JSONDecoder.decode(decoder, s)
}

function to_py(obj, kw) {
    // Conversion to Python objects
    // kw are the keyword arguments to loads()
    var res
    if (obj instanceof List) {
        return $B.$list(obj.items.map(x => to_py(x, kw)))
    } else if (obj instanceof Dict) {
        if (kw.object_pairs_hook !== _b_.None) {
            var pairs = []
            for (var i = 0, len = obj.keys.length; i < len; i++) {
                pairs.push($B.fast_tuple([obj.keys[i],
                    to_py(obj.values[i], kw)]))
            }
            return $B.$call(kw.object_pairs_hook, pairs)
        } else {
            var dict = $B.empty_dict()
            for (var i = 0, len = obj.keys.length; i < len; i++) {
                _b_.dict.$setitem(dict, obj.keys[i], to_py(obj.values[i], kw))
            }
            return kw.object_hook === _b_.None ? dict :
                $B.$call(kw.object_hook, dict)
        }
    } else if (obj.type == 'str') {
        return obj.value
    } else if (obj.type == 'num') {
        if (obj.value.search(/[.eE]/) > -1) {
            // float
            if (kw.parse_float !== _b_.None) {
                return $B.$call(kw.parse_float, obj.value)
            }
            return $B.fast_float(parseFloat(obj.value))
        } else {
            // integer
            if (kw.parse_int !== _b_.None) {
                return $B.$call(kw.parse_int, obj.value)
            }
            var int = parseInt(obj.value)
            if (Math.abs(int) < $B.max_int) {
                return int
            } else {
                return BigInt(obj.value)
            }
        }
    } else {
        if (obj instanceof Number && kw.parse_float !== _b_.None) {
            return $B.$call(kw.parse_float, obj)
        }else if(kw.parse_int !== _b_.None &&
                (typeof obj == 'number' || typeof obj == "bigint")){
            return $B.$call(kw.parse_int, obj)
        } else if (kw.parse_constant !== _b_.None && ! isFinite(obj)) {
            return kw.parse_constant(obj)
        }
        return obj
    }
}

var escapes = {'n': '\n',
               't': '\t',
               'b': '\b',
               'r': '\r',
               'f': '\f',
               '\\': '\\',
               '"': '\"',
               "'": "\\'",
               '/': '/'
               }

function string_at(s, i) {
    var error = get_error()

    var j = i + 1,
        escaped = false,
        len = s.length,
        value = ''
    while (j < len) {
        if (s[j] == '"' && ! escaped) {
            return [{type: 'str', value}, j + 1]
        } else if (! escaped && s[j] == '\\') {
            escaped = ! escaped
            j++
        } else if (escaped) {
            var esc = escapes[s[j]]
            if (esc) {
                value += esc
                j++
                escaped = false
            }else if(s[j] == 'u' &&
                    s.substr(j + 1, 4).match(/[0-9a-fA-f]{4}/)){
                // unicode escape
                value += String.fromCharCode(parseInt(s.substr(j + 1, 4), 16))
                j += 5
                escaped = ! escaped
            } else {
                throw $B.$call(error, 'invalid escape "' + s[j] + '"', s, j)
            }
        } else {
            value += s[j]
            j++
        }
    }
    // If we reach here, the string was not properly closed
    throw $B.$call(error, 'Unterminated string starting at', s, i)
}

function to_num(num_string, nb_dots, exp) {
    // convert to correct Brython type
    if (exp || nb_dots) {
        return new Number(num_string)
    } else {
        var int = parseInt(num_string)
        if (Math.abs(int) < $B.max_int) {
            return int
        } else {
            return BigInt(num_string)
        }
    }
}

function num_at(s, i) {
  var res = s[i],
      j = i + 1,
      nb_dots = 0,
      exp = false,
      len = s.length
  while (j < len) {
      if (s[j].match(/\d/)) {
        j++
      } else if (s[j] == '.' && nb_dots == 0) {
        nb_dots++
        j++
      } else if ('eE'.indexOf(s[j]) > -1 && ! exp) {
        exp = ! exp
        j++
      } else if (s[j] == '-' && 'eE'.includes(s[j-1])) {
        j++
      } else {
        return [{type: 'num', value: s.substring(i, j)}, j]
      }
  }
  return [{type: 'num', value: s.substring(i, j)}, j]
}

function Node(parent) {
    this.parent = parent
    if (parent instanceof List) {
        this.list = parent.items
    } else if (parent instanceof Dict) {
        this.list = parent.values
    } else if (parent === undefined) {
        this.list = []
    }
}

Node.prototype.transition = function(token) {
    if([true, false, _b_.None].includes(token) ||
            ['str', 'num'].includes(token.type)){
        if(this.parent === undefined &&
                (this.list.length > 0 || this.content)){
            throw Error('Extra data')
        }
        this.list.push(token)
        return this.parent ? this.parent : this
    } else if (token == '{') {
        if (this.parent === undefined) {
          this.content = new Dict(this)
          return this.content
        }
        return new Dict(this.parent)
    } else if (token == '[') {
        if (this.parent === undefined) {
            this.content = new List(this)
            return this.content
        }
        return new List(this.parent)
    } else {
        throw Error('unexpected item:' + token)
    }
}

function Dict(parent) {
    this.parent = parent
    this.keys = []
    this.values = []
    this.expect = 'key'
    if (parent instanceof List) {
        parent.items.push(this)
    } else if (parent instanceof Dict) {
        parent.values.push(this)
    }
}

Dict.prototype.transition = function(token) {
    if (this.expect == 'key') {
        if (token.type == 'str') {
            this.keys.push(token.value)
            this.expect = ':'
            return this
        } else if (token == '}' && this.keys.length == 0) {
            return this.parent
        } else {
            throw Error('expected str')
        }
    } else if (this.expect == ':') {
        if (token == ':') {
          this.expect = '}'
          return new Node(this)
        } else {
          throw Error('expected :')
        }
    } else if (this.expect == '}') {
        if (token == '}') {
            return this.parent
        } else if (token == ',') {
            this.expect = 'key'
            return this
        }
        throw Error('expected }')
    }
}

function List(parent) {
    if (parent instanceof List) {
        parent.items.push(this)
    }
    this.parent = parent
    this.items = []
    this.expect = 'item'
}

List.prototype.transition = function(token) {
    if (this.expect == 'item') {
        this.expect = ','
        if ([true, false, _b_.None].indexOf(token) > -1) {
            this.items.push(token)
            return this
        } else if (token.type == 'num' || token.type == 'str') {
            this.items.push(token)
            return this
        } else if (token == '{') {
            return new Dict(this)
        } else if (token == '[') {
            return new List(this)
        } else if (token == ']') {
            if (this.items.length == 0) {
                if (this.parent instanceof Dict) {
                    this.parent.values.push(this)
                }
                return this.parent
            }
            throw Error('unexpected ]')
        } else {
            console.log('token', token)
            throw Error('unexpected item:' + token)
        }

    } else if (this.expect == ',') {
        this.expect = 'item'
        if (token == ',') {
          return this
        } else if (token == ']') {
          if (this.parent instanceof Dict) {
              this.parent.values.push(this)
          }
          return this.parent
        } else {
          throw Error('expected :')
        }
    }
}

function Tokenizer(s) {
    this.s = s
}

Tokenizer.prototype.tokenize = function*(s){
  this.i = 0
  this.line_num = 1
  this.column_start = 0
  let len = s.length
  let value,
      end
  while (this.i < len) {
      let i = this.i
      if (s[i] == " " || s[i] == '\r' || s[i] == '\n' || s[i] == '\t') {
          this.i++
          this.line_num++
          this.column_start = i
      } else if ('[]{}:,'.indexOf(s[i]) > -1) {
          yield [s[i], i]
          this.i++
      } else if (s.substr(i, 4) == 'null') {
          yield [_b_.None , i]
          this.i += 4
      } else if (s.substr(i, 4) == 'true') {
          yield [true, i]
          this.i += 4
      } else if (s.substr(i, 5) == 'false') {
          yield [false, i]
          this.i += 5
      } else if (s.substr(i, 8) == 'Infinity') {
          yield [{type: 'num', value: 'Infinity'}, i]
          this.i += 8
      } else if (s.substr(i, 9) == '-Infinity') {
          yield [{type: 'num', value: '-Infinity'}, i]
          this.i += 9
      } else if (s.substr(i, 3) == 'NaN') {
          yield [{type: 'num', value: 'NaN'}, i]
          this.i += 3
      } else if (s[i] == '"') {
          value = string_at(s, i)
          yield value
          this.i = value[1]
      } else if (s[i].match(/\d/) || s[i] == '-') {
          value = num_at(s, i)
          yield value
          this.i = value[1]
      } else {
          yield new Stop()
      }
    }
}

function parse(s) {
  var res,
      state,
      node = new Node(),
      root = node,
      token
  var last_pos = 0
  let tok = new Tokenizer(s)
  for (var item of tok.tokenize(s)) {
      if (item instanceof Stop) {
          $B.RAISE(JSONDecodeError,
              `Expecting value: line ${tok.line_num} ` +
              `column ${tok.i - tok.column_start} (char ${tok.i})`
          )
      }
      token = item[0]
      last_pos = item[1]
      try {
          node = node.transition(token)
      } catch (err) {
          if (tok.i < _b_.len(s)) {
              $B.RAISE(JSONDecodeError,
                  `Extra data: line ${tok.line_num} ` +
                  `column ${1 + tok.i - tok.column_start} (char ${tok.i})`
              )
          }
          if (err.ob_type) {
              throw err
          } else {
              var error = get_error()
              throw $B.$call(error, err.message, s, item[1])
          }
      }
  }
  // Check if no valid JSON was parsed (empty string or whitespace only)
  if (!root.content && root.list.length === 0) {
      var error = get_error()
      throw $B.$call(error, 'Expecting value', s, 0)
  }
  // Check if we're still inside an incomplete structure
  if (node !== root) {
      var error = get_error()
      var expected = node instanceof Dict ? "'}'" : "']'"
      throw $B.$call(error, "Expecting ',' delimiter", s, last_pos)
  }
  return root.content ? root.content : root.list[0]
}

function ascii_escape_unichar(c, output, chars) {
    /* Escape unicode code point c to ASCII escape sequences
    in char *output. output must have at least 12 bytes unused to
    accommodate an escaped surrogate pair "\uXXXX\uXXXX" */
    output += '\\'
    switch (c) {
        case '\\':
        case '"':
            output += c
            break
        case '\b':
            output += 'b'
            break
        case '\f':
            output += 'f'
            break
        case '\n':
            output += 'n'
            break
        case '\r':
            output += 'r'
            break
        case '\t':
            output += 't'
            break
        default:
            let cp = c.codePointAt(0)
            if (cp >= 0x10000) {
                /* UTF-16 surrogate pair */
                let v = Py_UNICODE_HIGH_SURROGATE(cp)
                let vstr = v.toString(16)
                output += 'u' + '0'.repeat(4 - vstr.length) + vstr
                cp = Py_UNICODE_LOW_SURROGATE(cp)
                output += '\\'
            }
            let cstr = cp.toString(16)
            output += 'u' + '0'.repeat(4 - cstr.length) + cstr
    }
    return output
}

function ascii_escape_unicode(pystr) {
    /* Take a PyUnicode pystr and return a new ASCII-only escaped PyUnicode */
    let input_chars = _b_.str.mp_length(pystr)

    /* Compute the output size */
    let output_size
    let i
    for (i = 0, output_size = 2; i < input_chars; i++) {
        let c = char_at(pystr, i)
        let d
        if (S_CHAR(c)) {
            d = 1
        } else {
            switch(c) {
                case '\\':
                case '"':
                case '\b':
                case '\f':
                case '\n':
                case '\r':
                case '\t':
                    d = 2
                    break
            default:
                d = c >= 0x10000 ? 12 : 6
            }
        }
        if (output_size > PY_SSIZE_T_MAX - d) {
            $B.RAISE(_b_.OverflowError, "string is too long to escape")
        }
        output_size += d
    }

    let rval = ''
    let output = '"'
    let chars = 0
    for (i = 0; i < input_chars; i++) {
        let c = char_at(pystr, i)
        if (S_CHAR(c)) {
            output += c
        } else {
            output = ascii_escape_unichar(c, output)
        }
    }
    output += '"'
    return output
}

function encode_basestring_ascii(pystr) {
    /* Return an ASCII-only JSON representation of a Python string */
    /* METH_O */
    if ($B.is_str(pystr)) {
        rval = ascii_escape_unicode(_b_.str.$to_string(pystr))
    } else {
        $B.RAISE(_b_.TypeError,
            `first argument must be a string, not ${$B.class_name(pystr)}`
        )
    }
    return rval
}

function escape_unicode(pystr) {
    /* Take a PyUnicode pystr and return a new escaped PyUnicode */
    let input_chars = _b_.str.mp_length(pystr)
    let i
    let output_size

    /* Compute the output size */
    for (i = 0, output_size = 2; i < input_chars; i++) {
        let c = char_at(pystr, i)
        let d
        switch (c) {
            case '\\':
            case '"':
            case '\b':
            case '\f':
            case '\n':
            case '\r':
            case '\t':
                d = 2
                break
            default:
                if (c <= 0x1f) {
                    d = 6
                } else {
                    d = 1
                }
        }
        if (output_size > PY_SSIZE_T_MAX - d) {
            $B.RAISE(_b_.OverflowError, "string is too long to escape")
        }
        output_size += d
    }

    let output = ''

    function ENCODE_OUTPUT() {
        output += '"'
        for (let i = 0; i < input_chars; i++) {
            let c = char_at(pystr, i)
            switch (c) {
                case '\\':
                case '"':
                    output += '\\' + c
                    break
                case '\b':
                    output += '\\b'
                    break
                case '\f':
                    output += '\\f'
                    break
                case '\n':
                    output += '\\n'
                    break
                case '\r':
                    output += '\\r'
                    break
                case '\t':
                    output += '\\t'
                    break
                default:
                    let cp = c.codePointAt(0)
                    if (cp <= 0x1f) {
                        output += '\\u00'
                        let cstr = cp.toString(16)
                        output += '0'.repeat(2 - cstr.length) + ctsr
                    } else {
                        output += c
                    }
            }
        }
        output += '"'
    }

    ENCODE_OUTPUT()
    return output
}
function encode_basestring(pystr) {
    /* Return a JSON representation of a Python string */
    if ($B.is_str(pystr)) {
        return escape_unicode(_b_.str.$to_string(pystr))
    } else {
        $B.RAISE(_b_.TypeError,
            `first argument must be a string, not ${$B.class_name(pystr)}`
        )
    }
}

var JSONDecoder = $B.make_type("json.decoder.JSONDecoder")

JSONDecoder.$factory = function() {
    var $defaults = {cls: _b_.None, object_hook: _b_.None,
            parse_float: _b_.None, parse_int: _b_.None,
            parse_constant: _b_.None, object_pairs_hook: _b_.None}
    var $ = $B.args("decode", 0, {}, arguments, null, null, "kw")
    var kw = _b_.dict.$to_obj($.kw)
    for (var key in $defaults) {
        if (kw[key] === undefined) {
            kw[key] = $defaults[key]
        }
    }
    return {
        ob_type: JSONDecoder,
        object_hook: kw.object_hook,
        parse_float: kw.parse_float,
        parse_int: kw.parse_int,
        parse_constant: kw.parse_constant,
        object_pairs_hook: kw.object_pairs_hook,
        memo: $B.empty_dict()
    }
}

JSONDecoder.decode = function(self, s) {
    return to_py(parse(s), self)
}

$B.set_func_names(JSONDecoder, 'json.decoder')
$B.finalize_type(JSONDecoder)

function Py_UNICODE_IS_HIGH_SURROGATE(ch) {
    return (0xD800 <= ch && ch <= 0xDBFF)
}

function Py_UNICODE_IS_LOW_SURROGATE(ch) {
    return (0xDC00 <= ch && ch <= 0xDFFF)
}

function Py_UNICODE_JOIN_SURROGATES(high, low)  {
    return 0x10000 + (((high & 0x03FF) << 10) | (low & 0x03FF))
}

// High surrogate = top 10 bits added to 0xD800.
// The character must be in the range [U+10000; U+10ffff].
function Py_UNICODE_HIGH_SURROGATE(ch) {
    return (0xD800 - (0x10000 >> 10) + (ch >> 10))
}

// Low surrogate = bottom 10 bits added to 0xDC00.
// The character must be in the range [U+10000; U+10ffff].
function Py_UNICODE_LOW_SURROGATE(ch) {
    return (0xDC00 + (ch & 0x3FF))
}

function PySequence_Fast(v, m) {
    if ($B.exact_type(v, _b_.list) || $B.exact_type(v, _b_.tuple)) {
        return v
    }
    try {
        return Array.from($B.make_js_iterator(v))
    } catch(err) {
        $B.RAISE_IF_NOT(err, _b_.TypeError)
        $B.RAISE(_b_.TypeError, m)
    }
}

function raise_errmsg(msg, s, end) {
    /* Use JSONDecodeError exception to raise a nice looking ValueError subclass */
    let json_decoder = $B.imported['json.decoder']
    let JSONDecodeError = $B.module_getattr(json_decoder, 'JSONDecodeError')
    let exc = $B.$call(JSONDecodeError, msg, s, end)
    throw exc
}

var nb_recursions = 0
let recursion_limit = $B.recursion_limit

function _Py_EnterRecursiveCall(msg) {
    if (++nb_recursions > recursion_limit) {
        $B.RAISE(_b_.RecursionError, msg)
    }
}

function _Py_LeaveRecursiveCall() {
    nb_recursions--
}

function S_CHAR(c) {
    return c >= ' ' && c <= '~' && c != '\\' && c != '"'
}

function IS_WHITESPACE(c) {
    return ' \t\n\r'.includes(c)
}

let Writer = function() {
    this.str = ''
}

Writer.prototype.write = function(data) {
    this.str += data
}

function char_at(s, idx) {
    if (typeof s == 'string') {
        return s[idx]
    }
    return _b_.str.mp_subscript(s, idx)
}

function slice(s, start, stop) {
    return _b_.str.mp_subscript(s, _b_.slice.$factory(start, stop))
}

/* indent_cache is a list that contains intermixed values at even and odd
 * positions:
 *
 * 2*k   : '\n' + indent * (k + initial_indent_level)
 *         strings written after opening and before closing brackets
 * 2*k-1 : item_separator + '\n' + indent * (k + initial_indent_level)
 *         strings written between items
 *
 * Its size is always an odd number.
 */
function create_indent_cache(s, indent_level) {
    let newline_indent = '\n'
    if (indent_level) {
        newline_indent += $B.$getattr(s, 'indent').repeat(indent_level)
    }
    return [newline_indent]
}

function update_indent_cache(s, indent_level, indent_cache) {
    let newline_indent = indent_cache[(indent_level - 1) * 2]
    newline_indent += $B.$getattr(s, 'indent')
    let separator_indent = $B.$getattr(s, 'item_separator') + newline_indent
    indent_cache.push(separator_indent)
    indent_cache.push(newline_indent)
    return 0
}

function get_item_separator(s, indent_level, indent_cache) {
    if (indent_level * 2 > indent_cache.length) {
        update_indent_cache(s, indent_level, indent_cache)
    }
    return indent_cache[indent_level * 2 - 1]
}

function write_newline_indent(writer, indent_level, indent_cache) {
    let newline_indent = indent_cache[indent_level * 2]
    return writer.write(newline_indent)
}

function encoder_encode_float(s, obj) {
    /* Return the JSON representation of a PyFloat. */
    let v = obj.value
    if (! Number.isFinite(v)) {
        if (! s.allow_nan) {
            $B.RAISE(_b_.ValueError,
                `Out of range float values are not JSON compliant: ${v}`
            )
        }
        if (v > 0) {
            return "Infinity"
        } else if (v < 0) {
            return "-Infinity"
        } else {
            return "NaN"
        }
    }
    return _b_.float.tp_repr(obj)
}

function encoder_encode_string(s, obj) {
    /* Return the JSON representation of a string */
    let fast_encode = $B.$getattr(s, 'fast_encode')

    if (fast_encode !== _b_.None) {
        return fast_encode(obj)
    }
    let encoded = $B.$call($B.$getattr(s, 'encoder'), obj)
    if (! $B.is_str(encoded)) {
        $B.RAISE(_b_.TypeError,
            `encoder() must return a string, not ${$B.class_name(encoded)}`
        )
    }
    return encoded
}

function encoder_encode_key_value(s, writer, first, dct, key, value,
        indent_level, indent_cache, item_separator) {
    let keystr
    let encoded

    if ($B.is_str(key)) {
        keystr = key
    } else if ($B.$isinstance(key, _b_.float)) {
        keystr = encoder_encode_float(s, key)
    } else if (key === true || key === false || key === _b_.None) {
        keystr = _encoded_const(key)
    } else if ($B.is_int(key)) {
        keystr = _b_.int.tp_repr(key)
    } else if ($B.$getattr(s, 'skipkeys')) {
        return 0
    } else {
        $B.RAISE(_b_.TypeError,
            "keys must be str, int, float, bool or None, " +
            `not ${$B.class_name(key)}`
        )
    }

    if (keystr === undefined) {
        return -1
    }

    if (first[0]) {
        first[0] = false
        if ($B.$getattr(s, 'indent') != _b_.None) {
            write_newline_indent(writer, indent_level, indent_cache)
        }
    } else {
        writer.write(item_separator)
    }

    encoded = encoder_encode_string(s, keystr)
    writer.write(encoded)

    writer.write($B.$getattr(s, 'key_separator'))
    if (encoder_listencode_obj(s, writer, value, indent_level, indent_cache) < 0) {
        _PyErr_FormatNote("when serializing %T item %R", dct, key);
        return -1
    }
    return 0
}

function encoder_listencode_dict(s, writer, dct, indent_level, indent_cache) {
    /* Encode Python dict dct a JSON term */
    let ident
    let items
    let key, value
    let first = [true]

    if (_b_.dict.mp_length(dct) == 0) {
        /* Fast path */
        return writer.write("{}")
    }

    let markers = $B.$getattr(s, 'markers')
    if (markers !== _b_.None) {
        let has_key
        let ident = _b_.id(dct)
        has_key = _b_.dict.sq_contains(markers, ident)
        if (has_key) {
            if (has_key != -1) {
                $B.RAISE(_b_.ValueError, "Circular reference detected")
            }
        }
        _b_.dict.$setitem(markers, ident, dct)
    }

    writer.write('{')

    let separator = $B.$getattr(s, 'item_separator')
    if ($B.$getattr(s, 'indent') !== _b_.None) {
        indent_level++
        separator = get_item_separator(s, indent_level, indent_cache)
    }

    let sort_keys = $B.$getattr(s, 'sort_keys')

    if (sort_keys || ! $B.is_dict(dct)) {
        items = _b_.list.$factory(_b_.dict.tp_funcs.items(dct))
        if ($B.$getattr(s, 'sort_keys')) {
            _b_.list.tp_funcs.sort(items)
        }

        for (let item of items) {
            if (! $B.is_tuple(item) || _b_.tuple.mp_length(item) != 2) {
                $B.RAISE(_b_.ValueError, "items must return 2-tuples")
            }

            [key, value] = item
            encoder_encode_key_value(s, writer, first, dct, key, value,
                indent_level, indent_cache, separator)
        }
    } else {
        for ([key, value] of $B.dict_key_values(dct)) {
            encoder_encode_key_value(s, writer, first, dct, key, value,
                indent_level, indent_cache, separator)
        }
    }

    if (ident !== undefined) {
        _b_.dict.$delitem(markers, ident)
    }
    if ($B.$getattr(s, 'indent') !== _b_.None && ! first[0]) {
        indent_level--
        write_newline_indent(writer, indent_level, indent_cache)
    }

    writer.write('}')
    return 0
}

function encoder_listencode_list(s, writer, seq, indent_level, indent_cache) {
    let ident
    let s_fast

    s_fast = PySequence_Fast(seq, "_iterencode_list needs a sequence")
    if (s_fast.length == 0) {
        return writer.write("[]")
    }
    let markers = $B.$getattr(s, 'markers')
    if (markers !== _b_.None) {
        let ident = _b_.id(seq)
        let has_key = _b_.dict.sq_contains(markers, ident)
        if (has_key) {
            if (has_key != -1) {
                $B.RAISE(_b_.ValueError, "Circular reference detected")
            }
        }
        _b_.dict.$setitem(markers, ident, seq)
    }

    writer.write('[')

    let separator = s.item_separator
    if (s.indent != _b_.None) {
        indent_level++
        separator = get_item_separator(s, indent_level, indent_cache)
        write_newline_indent(writer, indent_level, indent_cache)
    }

    for (let i = 0, len = s_fast.length; i < len; i++) {
        let obj = s_fast[i]
        if (i) {
            writer.write(separator)
        }
        if (encoder_listencode_obj(s, writer, obj, indent_level, indent_cache)) {
            _PyErr_FormatNote("when serializing %T item %zd", seq, i)
        }
    }
    if (ident !== undefined) {
        _b_.dict.$delitem(markers, ident)
    }

    if (s.indent !== _b_.None) {
        indent_level--
        write_newline_indent(writer, indent_level, indent_cache)
    }

    writer.write(']')
    return 0
}

function encoder_listencode_obj(s, writer, obj, indent_level, indent_cache) {
    /* Encode Python object obj to a JSON term */
    let newobj
    let rv

    if (obj === _b_.None) {
      return writer.write("null")
    } else if (obj === true) {
      return writer.write('true')
    } else if (obj === false) {
      return writer.write('false')
    } else if ($B.is_str(obj)) {
        let encoded = encoder_encode_string(s, obj)
        return writer.write(encoded)
    } else if ($B.is_int(obj)) {
        if ($B.exact_type(obj, _b_.int)) {
            // Fast-path for exact integers
            return writer.write(_b_.repr(obj))
        }
        let encoded = _b_.int.tp_repr(obj)
        return writer.write(encoded)
    } else if ($B.$isinstance(obj, _b_.float)) {
        let encoded = encoder_encode_float(s, obj);
        return writer.write(encoded)
    } else if ($B.is_list(obj) || $B.is_tuple(obj)) {
        if (_Py_EnterRecursiveCall(" while encoding a JSON object")) {
            return -1
        }
        rv = encoder_listencode_list(s, writer, obj, indent_level,
            indent_cache)
        _Py_LeaveRecursiveCall()
        return rv
    } else if ($B.is_dict(obj)) {
        if (_Py_EnterRecursiveCall(" while encoding a JSON object")) {
            return -1
        }
        rv = encoder_listencode_dict(s, writer, obj, indent_level,
            indent_cache)
        _Py_LeaveRecursiveCall()
        return rv
    } else {
        let ident
        let markers = $B.$getattr(s, 'markers')
        if (markers !== _b_.None) {
            let ident = _b_.id(obj)
            let has_key = _b_.dict.sq_contains(markers, ident)
            if (has_key) {
                if (has_key != -1) {
                    $B.RAISE(_b_.ValueError, "Circular reference detected")
                }
                return -1
            }
            _b_.dict.$setitem(markers, ident, obj)
        }
        newobj = $B.$call(s.defaultfn, obj)

        if (_Py_EnterRecursiveCall(" while encoding a JSON object")) {
            return -1
        }
        rv = encoder_listencode_obj(s, writer, newobj, indent_level, indent_cache);
        _Py_LeaveRecursiveCall();

        if (rv) {
            _PyErr_FormatNote("when serializing %T object", obj);
            return -1
        }
        if (ident !== undefined) {
            _b_.dict.$delitem(markers, ident)
        }
        return rv
    }
}

let Encoder = $B.make_type('_json.Encoder')

Encoder.tp_new = function(cls, args, kw) {
    let _arguments = args.concat($B.dict2kwarg(kw))
    let $ = $B.args('Encoder', 9,
                {markers: null, default: null, encoder: null, indent: null,
                 key_separator: null, item_separator: null, sort_keys: null,
                 skipkeys: null, allow_nan: null},
                 _arguments)

    let markers = $.markers
    if (markers != _b_.None && ! $B.is_dict(markers)) {
        $B.RAISE(_b_.TypeError,
            `make_encoder() argument 1 must be dict or None, ` +
            `not ${$B.class_name(markers)}`
        )
    }
    let res = {
        ob_type: cls,
        markers,
        defaultfn: $.default,
        encoder: $.encoder,
        indent: $.indent,
        key_separator: $.key_separator,
        item_separator: $.item_separator,
        sort_keys: $.sort_keys,
        skipkeys: $.skipkeys,
        allow_nan: $.allow_nan
    }

    $B.init_dict(res)
    $B.set_to_dict(res, 'fast_encode', _b_.None)

    let encoder = $.encoder
    if (typeof encoder == 'function') {
        if (encoder == encode_basestring_ascii || encoder == encode_basestring) {
            $B.set_to_dict(res, 'fast_encode', encoder)
        }
    }
    return res
}

Encoder.tp_call = function(){
    /* Python callable interface to encode_listencode_obj */
    let $ = $B.args('Encoder', 3,
                {self: null, obj: null, _current_indent_level: null},
                arguments)
    let self = $.self
    let obj = $.obj
    let indent_level = $._current_indent_level

    let indent_cache
    if ($B.$getattr(self, 'indent') !== _b_.None) {
        indent_cache = create_indent_cache(self, indent_level)
    }
    indent_level = 0
    let writer = new Writer()
    if (encoder_listencode_obj(self, writer, obj, indent_level, indent_cache)) {
        return _b_.None
    }

    return writer.str
}

Encoder.tp_members = [
    ["markers", $B.TYPES.OBJECT, "markers", $B.Py_READONLY],
    ["default", $B.TYPES.OBJECT, "defaultfn", $B.Py_READONLY],
    ["encoder", $B.TYPES.OBJECT, "encoder", $B.Py_READONLY],
    ["indent", $B.TYPES.OBJECT, "indent", $B.Py_READONLY],
    ["key_separator", $B.TYPES.OBJECT, "key_separator", $B.Py_READONLY],
    ["item_separator", $B.TYPES.OBJECT, "item_separator", $B.Py_READONLY],
    ["sort_keys", $B.Py_T_BOOL, "sort_keys", $B.Py_READONLY],
    ["skipkeys", $B.Py_T_BOOL, "skipkeys", $B.Py_READONLY]
]

$B.finalize_type(Encoder)

function _match_number_unicode(s, pystr, start) {
    /* Read a JSON number from PyUnicode pystr.
    idx is the index of the first character of the number
    *next_idx_ptr is a return-by-reference index to the first character after
        the number.

    Returns a new PyObject representation of that number:
        PyLong, or PyFloat.
        May return other types if parse_int or parse_float are set
    */
    let end_idx = _b_.str.mp_length(pystr) - 1
    let idx = start
    let is_float = 0
    let rval

    /* read a sign if it's there, make sure it's not the end of the string */
    if (char_at(pystr, idx) == '-') {
        idx++
        if (idx > end_idx) {
            $B.RAISE(_b_.StopIteration, start)
        }
    }

    /* read as many integer digits as we find as long as it doesn't start with 0 */
    if (char_at(pystr, idx) >= '1' && char_at(pystr, idx) <= '9') {
        idx++
        while (idx <= end_idx && char_at(pystr, idx) >= '0' &&
                char_at(pystr, idx) <= '9') {
            idx++
        }
    } else if (char_at(pystr, idx) == '0') {
        /* if it starts with 0 we only expect one integer digit */
        idx++
    } else {
        /* no integer digits, error */
        $B.RAISE(_b_.StopIteration, start)
    }

    /* if the next char is '.' followed by a digit then read all float digits */
    if (idx < end_idx && char_at(pystr, idx) == '.' &&
            char_at(pystr, idx + 1) >= '0' &&
            char_at(pystr, idx + 1) <= '9') {
        is_float = 1
        idx += 2
        while (idx <= end_idx &&
                char_at(pystr, idx) >= '0' &&
                char_at(pystr, idx) <= '9') {
            idx++
        }
    }

    /* if the next char is 'e' or 'E' then maybe read the exponent (or backtrack) */
    if (idx < end_idx &&
            (char_at(pystr, idx) == 'e' || char_at(pystr, idx) == 'E')) {
        let e_start = idx
        idx++
        /* read an exponent sign if present */
        if (idx < end_idx &&
                (char_at(pystr, idx) == '-' || char_at(pystr, idx) == '+')) {
            idx++
        }

        /* read all digits */
        while (idx <= end_idx &&
                char_at(pystr, idx) >= '0' &&
                char_at(pystr, idx) <= '9') {
            idx++
        }

        /* if we got a digit, then parse as float. if not, backtrack */
        if (char_at(pystr, idx - 1) >= '0' && char_at(pystr, idx - 1) <= '9') {
            is_float = 1
        } else {
            idx = e_start
        }
    }

    if (is_float &&
            (custom_func = $B.$getattr(s, 'parse_float')) != _b_.float) {
        // ok
    } else if (! is_float &&
            (custom_func = $B.$getattr(s, 'parse_int')) != _b_.int) {
        // ok
    } else {
        custom_func = null
    }

    let numstr = slice(pystr, start, idx)

    if (custom_func) {
        /* copy the section we determined to be a number */
        rval = $B.$call(custom_func, numstr)
    } else {
        /* Straight conversion to ASCII, to avoid costly conversion of
           decimal unicode digits (which cannot appear here) */
        if (is_float) {
            rval = _b_.float.$factory(numstr)
        } else {
            rval = _b_.int.$factory(numstr)
        }
    }
    return $B.fast_tuple([rval, idx])
}

function _parse_array_unicode(s, memo, pystr, idx) {
    /* Read a JSON array from PyUnicode pystr.
    idx is the index of the first character after the opening brace.
    *next_idx_ptr is a return-by-reference index to the first character after
        the closing brace.

    Returns a new PyList
    */

    let rval = $B.$list()
    let comma_idx
    let end_idx = _b_.str.mp_length(pystr) - 1

    /* skip whitespace after [ */
    while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
        idx++;
    }

    /* only loop if the array is non-empty */
    if (idx > end_idx || _b_.str.mp_subscript(pystr, idx) != ']') {
        while (1) {

            /* read any JSON term  */
            let [val, next_idx] = scan_once_unicode(s, memo, pystr, idx)

            rval.push(val)
            idx = next_idx

            /* skip whitespace between term and , */
            while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
                idx++
            }

            /* bail if the array is closed or we didn't get the , delimiter */
            if (idx <= end_idx && char_at(pystr, idx) == ']') {
                break
            }

            if (idx > end_idx || char_at(pystr, idx) != ',') {
                raise_errmsg("Expecting ',' delimiter", pystr, idx)
            }
            comma_idx = idx
            idx++

            /* skip whitespace after , */
            while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
                idx++
            }

            if (idx <= end_idx && char_at(pystr, idx) == ']') {
                raise_errmsg("Illegal trailing comma before end of array", pystr, comma_idx)
            }
        }
    }

    /* verify that idx < end_idx, char_at(pystr, idx) should be ']' */
    if (idx > end_idx || char_at(pystr, idx) != ']') {
        raise_errmsg("Expecting value", pystr, end_idx)
    }
    return $B.fast_tuple([rval, idx + 1])
}

function _parse_constant(s, constant, idx) {
    /* Read a JSON constant.
    constant is the constant string that was found
        ("NaN", "Infinity", "-Infinity").
    idx is the index of the first character of the constant
    Returns the result of parse_constant
    */

    /* rval = parse_constant(constant) */
    let parse_constant = $B.$getattr(s, 'parse_constant')
    return $B.fast_tuple([$B.$call(parse_constant, constant),
        idx + constant.length])
}

function _parse_object_unicode(s, memo, pystr, idx) {
    /* Read a JSON object from PyUnicode pystr.
    idx is the index of the first character after the opening curly brace.
    *next_idx_ptr is a return-by-reference index to the first character after
        the closing curly brace.

    Returns a new PyObject (usually a dict, but object_hook can change that)
    */
    let val
    let rval
    let key
    let object_pairs_hook = $B.$getattr(s, 'object_pairs_hook')
    let has_pairs_hook = object_pairs_hook != _b_.None
    let next_idx
    let comma_idx

    let end_idx = _b_.str.mp_length(pystr) - 1

    if (has_pairs_hook) {
        rval = $B.$list()
    } else {
        rval = $B.empty_dict()
    }

    /* skip whitespace after { */
    while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
        idx++
    }

    /* only loop if the object is non-empty */
    if (idx > end_idx || char_at(pystr, idx) != '}') {
        while (1) {
            /* read key */
            if (idx > end_idx || char_at(pystr, idx) != '"') {
                raise_errmsg("Expecting property name enclosed in double quotes", pystr, idx)
            }
            [key, next_idx] = scanstring_unicode(pystr, idx + 1,
                $B.$getattr(s, 'strict'))

            /*
            if (PyDict_SetDefaultRef(memo, key, key, &memokey) < 0) {
                goto bail;
            }
            Py_SETREF(key, memokey);
            */
            idx = next_idx

            /* skip whitespace between key and : delimiter, read :, skip whitespace */
            while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
                idx++
            }
            if (idx > end_idx || char_at(pystr, idx) != ':') {
                raise_errmsg("Expecting ':' delimiter", pystr, idx)
            }
            idx++
            while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
                idx++
            }

            /* read any JSON term */
            [val, next_idx] = scan_once_unicode(s, memo, pystr, idx)

            if (has_pairs_hook) {
                rval.push([key, val])
            } else {
                $B.str_dict_set(rval, key, val)
            }
            idx = next_idx

            /* skip whitespace before } or , */
            while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
                idx++
            }

            /* bail if the object is closed or we didn't get the , delimiter */
            if (idx <= end_idx && char_at(pystr, idx) == '}') {
                break
            }
            if (idx > end_idx || char_at(pystr, idx) != ',') {
                raise_errmsg("Expecting ',' delimiter", pystr, idx)
            }
            comma_idx = idx
            idx++

            /* skip whitespace after , delimiter */
            while (idx <= end_idx && IS_WHITESPACE(char_at(pystr, idx))) {
                idx++
            }

            if (idx <= end_idx && char_at(pystr, idx) == '}') {
                raise_errmsg("Illegal trailing comma before end of object",
                    pystr, comma_idx)
            }
        }
    }

    let next_idx_ptr = idx + 1

    if (has_pairs_hook) {
        val = $B.$call(object_pairs_hook, rval)
        return $B.fast_tuple([val, next_idx_ptr])
    }

    /* if object_hook is not None: rval = object_hook(rval) */
    let object_hook = $B.$getattr(s, 'object_hook')
    if (object_hook != _b_.None) {
        val = $B.$call(object_hook, rval)
        return $B.fast_tuple([val, next_idx_ptr])
    }
    return $B.fast_tuple([rval, next_idx_ptr])
}

function scan_once_unicode(s, memo, pystr, idx) {
    /* Read one JSON term (of any kind) from PyUnicode pystr.
    idx is the index of the first character of the term
    *next_idx_ptr is a return-by-reference index to the first character after
        the number.

    Returns a new PyObject representation of the term.
    */

    let length = _b_.str.mp_length(pystr)

    if (idx < 0) {
        $B.RAISE(_b_.ValueError, "idx cannot be negative")
    }
    if (idx >= length) {
        $B.RAISE(_b_.StopIteration, idx)
    }

    switch (_b_.str.mp_subscript(pystr, idx)) {
        case '"':
            /* string */
            return scanstring_unicode(pystr, idx + 1, $B.$getattr(s, 'strict'))
        case '{':
            /* object */
            _Py_EnterRecursiveCall(" while decoding a JSON object " +
                                       "from a unicode string")
            res = _parse_object_unicode(s, memo, pystr, idx + 1)
            _Py_LeaveRecursiveCall()
            return res
        case '[':
            /* array */
            _Py_EnterRecursiveCall(" while decoding a JSON array " +
                                       "from a unicode string")
            res = _parse_array_unicode(s, memo, pystr, idx + 1)
            _Py_LeaveRecursiveCall()
            return res;
        case 'n':
            /* null */
            if ((idx + 3 < length) &&
                    slice(pystr, idx + 1, idx + 4) == 'ull') {
                return $B.fast_tuple([_b_.None, idx + 4])
            }
            break
        case 't':
            /* true */
            if ((idx + 3 < length) &&
                    slice(pystr, idx + 1, idx + 4) == 'rue') {
                return $B.fast_tuple([true, idx + 4])
            }
            break
        case 'f':
            /* false */
            if ((idx + 4 < length) &&
                    slice(pystr, idx + 1, idx + 5) == 'alse')  {
                return $B.fast_tuple([false, idx + 5])
            }
            break
        case 'N':
            /* NaN */
            if ((idx + 2 < length) &&
                    slice(pystr, idx + 1, idx + 3) == 'aN') {
                return _parse_constant(s, "NaN", idx)
            }
            break;
        case 'I':
            /* Infinity */
            if ((idx + 7 < length) &&
                    slice(pystr, idx + 1, idx + 8) == 'nfinity') {
                return _parse_constant(s, "Infinity", idx)
            }
            break;
        case '-':
            /* -Infinity */
            if ((idx + 8 < length) &&
                    slice(pystr, idx + 1, idx + 9) == 'Infinity') {
                return _parse_constant(s, "-Infinity", idx)
            }
            break;
    }
    /* Didn't find a string, object, array, or named constant. Look for a number. */
    return _match_number_unicode(s, pystr, idx)
}

function scanstring_unicode(pystr, end, strict) {
    /* Read the JSON string from PyUnicode pystr.
    end is the index of the first character after the quote.
    if strict is zero then literal control characters are allowed
    *next_end_ptr is a return-by-reference index of the character
        after the end quote

    Return value is a new PyUnicode
    */
    let rval = null
    let len
    let begin = end - 1
    let next /* = begin */;
    let buf
    let kind

    let writer = ''

    len = _b_.str.mp_length(pystr)

    if (end < 0 || len < end) {
        $B.RAISE(_b_._ValueError, "end is out of bounds")
    }
    while (1) {
        /* Find the end of the string or the next escape */
        let c
        let d = 0
        for (next = end; next < len; next++) {
            d = _b_.str.mp_subscript(pystr, next)
            if (d == '"' || d == '\\') {
                break
            }
            if (d.codePointAt(0) <= 0x1f && strict) {
                console.log('scan d', d)
                raise_errmsg("Invalid control character at", pystr, next)
            }
        }
        c = d

        if (c == '"') {
            // Fast path for simple case.
            if (_b_.str.mp_length(writer) == 0) {
                let ret = slice(pystr, end, next)
                return $B.fast_tuple([ret, next + 1])
            }
        } else if (c != '\\') {
            raise_errmsg("Unterminated string starting at", pystr, begin)
        }

        /* Pick up this chunk if it's not zero length */
        if (next != end) {
            writer += slice(pystr, end, next)
        }
        next++
        if (c == '"') {
            end = next
            break
        }
        if (next == len) {
            raise_errmsg("Unterminated string starting at", pystr, begin)
        }
        c = _b_.str.mp_subscript(pystr, next)
        if (c != 'u') {
            /* Non-unicode backslash escapes */
            end = next + 1
            switch (c) {
                case '"':
                case '\\':
                case '/':
                    break
                case 'b':
                    c = '\b'
                    break
                case 'f':
                    c = '\f'
                    break
                case 'n':
                    c = '\n'
                    break
                case 'r':
                    c = '\r'
                    break
                case 't':
                    c = '\t'
                    break
                default:
                    c = 0
            }
            if (c === 0) {
                raise_errmsg("Invalid \\escape", pystr, end - 2)
            }
        } else {
            c = 0
            next++
            end = next + 4
            if (end >= len) {
                raise_errmsg("Invalid \\uXXXX escape", pystr, next - 1)
            }
            let hex_digits = slice(pystr, next, end)
            if (! hex_digits.match(/[0-9a-fA-F]{4}/)) {
                raise_errmsg("Invalid \\uXXXX escape", pystr, end - 5)
            }
            next = end
            let cp = parseInt(hex_digits, 16)
            c = String.fromCodePoint(cp)
        }
        writer += c
    }

    rval = $B.String(writer) // might have surrogate pairs
    return $B.fast_tuple([rval, end])
}

function scanstring() {
    let $ = $B.args('scanstring', 3,
                {pystr: null, end: null, strict: null},
                arguments,
                {strict: true}
            )
    let pystr = $.pystr,
        end = $.end,
        strict = $.strict
    if ($B.is_str(pystr)) {
        pystr = _b_.str.$to_string(pystr) // for str subclasses
        return scanstring_unicode(pystr, end, strict)
    } else {
        $B.RAISE(_b_.TypeError,
            `first argument must be a string, not ${$B.class_name(pystr)}`
        )
    }
}

let Scanner = $B.make_type('_json.Scanner')

Scanner.tp_new = function(cls, args, kw) {
    let ctx = args[0]
    return {
        ob_type: Scanner,
        strict: $B.$bool($B.$getattr(ctx, 'strict')),
        object_hook: $B.$getattr(ctx, 'object_hook'),
        object_pairs_hook: $B.$getattr(ctx, 'object_pairs_hook'),
        parse_float: $B.$getattr(ctx, 'parse_float'),
        parse_int: $B.$getattr(ctx, 'parse_int'),
        parse_constant: $B.$getattr(ctx, 'parse_constant')
    }
}

Scanner.tp_call = function(){
    /* Python callable interface to scan_once_{str,unicode} */
    let $ = $B.args('scan_once', 3, {self: null, pystr: null, idx: null},
            arguments)
    let self = $.self
    let pystr = $.pystr
    let idx = $.idx
    let next_idx = -1

    if (! $B.is_str(pystr)) {
        $B.RAISE(_b_.TypeError,
            `first argument must be a string, not ${$B.class_name(pystr)}`
        )
    }
    pystr = _b_.str.$to_string(pystr)

    let memo = $B.empty_dict()

    return scan_once_unicode(self, memo, pystr, idx)
}

Scanner.tp_members = [
    ["strict", $B.TYPES.BOOL, 'strict', $B.Py_READONLY],
    ["object_hook", $B.TYPES.OBJECT, 'object_hook', $B.Py_READONLY],
    ["object_pairs_hook", $B.TYPES.OBJECT, 'object_pairs_hook', $B.Py_READONLY],
    ["parse_float", $B.TYPES.OBJECT, 'parse_float', $B.Py_READONLY],
    ["parse_int", $B.TYPES.OBJECT, 'parse_int', $B.Py_READONLY],
    ["parse_constant", $B.TYPES.OBJECT, 'parse_constant', $B.Py_READONLY]
]

$B.finalize_type(Scanner)

$B.addToImported('_json',
    {
        dumps: function() {
            return _b_.str.$factory(to_json.apply(null, arguments))
        },
        encode_basestring_ascii,
        encode_basestring,
        loads,
        JSONDecoder,
        JSONDecodeError,
        make_encoder: Encoder,
        make_scanner: Scanner,
        scanstring
    }
)

})(__BRYTHON__)