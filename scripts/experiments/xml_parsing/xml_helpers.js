var FAIL = {FAIL: true}
var DONE = {DONE: true}
var END = {END: true}

function is_id_start(char){
  return char !== END && char.match(/[a-zA-Z_]/)
}

function is_id_continue(char){
  return char !== END && char.match(/[a-zA-Z_0-9]/)
}

function is_space(char){
    return char !== END && ' \t'.includes(char)
}

function is_num(char){
    return char !== END && char.match(/\d/)
}

function is_char(char){
    return char !== END && ! '<&"'.includes(char)
}

function get_top(element){
    while(element.origin){
        element = element.origin
    }
    return element
}

function get_pos(element){
    return get_top(element)._pos
}

function show_position(element, pos){
    var src = get_top(element)._buffer
    console.log('    ' + src)
    console.log('    ' + ' '.repeat(pos) + '^')
}

function reset_pos(element, pos){
    if(pos === undefined){
        throw Error('reset at undefined')
    }
    console.log('reset pos at', pos)
    if(pos == 62){
        console.log(Error('pos reset at 62').stack)
        alert()
    }
    get_top(element)._pos = pos
}

function update_pos(element, pos){
    delete_pos(element)
    element.pos = pos
}

function delete_pos(rule){
    delete rule.pos
    if(rule.rules){
        for(var r of rule.rules){
            delete_pos(r)
        }
    }
}

function show_path(rule){
    if(rule.constructor === undefined){
        console.log('rule', rule, 'no constructor')
        alert()
    }
    var name = rule.constructor.name
    if(name.endsWith('_rule')){
        name = name.substr(0, name.length - 5)
    }
    var t = [name + '@' + rule.pos]
    while(rule.origin){
        if(rule.origin.constructor === Object){
            break
        }
        name = rule.origin.constructor.name
        if(name.endsWith('_rule_')){
            name = name.substr(0, name.length - 5)
        }
        t.push(name + '@' + rule.origin.pos)
        rule = rule.origin
    }

    console.log('show path', t)
}

function set_expect(element, expect){
    var test = element.constructor.name == 'Attribute_rule' && expect == 1
    if(test){
        console.log('set expect of', element)
        console.log(`  >>> set expect of ${element.constructor.name} to ${expect}`)
        alert()
    }
    element.expect = expect
    if(element.rules[expect]){
        var rule = element.rules[expect]
        delete_pos(rule)
    }
    if(test){
        console.log('   !!! after set expect', element)
        alert()
    }
}

function read_char(element){
    var parser = get_top(element)
    return parser._buffer[parser._pos] || END
}

function raise_error_known_position(parser, message){
    var pos = parser._pos
    message += ' at position ' + pos
    var ix = pos
    while(ix >= 0 && parser._buffer[ix] !== '\\n'){
        ix--
    }
    message += '\\n' + parser._buffer.substring(ix, pos + 1)
    message += '\\n' + ' '.repeat(pos - ix - 1) + '^'
    throw Error(message)
}

function raise_error(element, char){
    var head = element
    while(head.origin){
        head = head.origin
    }
    console.log('head', head)
    var cls = element.constructor.name,
        message = cls + ' expected ' + element.expect +
            ', got: ' + char
    raise_error_known_position(head, message)
}

function expect_literal(element, literal, char){
    if(! element.hasOwnProperty('expected_pos')){
        element.expected_pos = 0
    }
    if(literal[element.expected_pos] == char){
        element.expected_pos++
        if(element.expected_pos == literal.length){
            delete element.expected_pos
            return {value: literal}
        }else{
            return {value: null}
        }
    }
    return FAIL
}

function LITERAL(origin, string, next_if_ok, args){
    this.origin = origin
    this.string = string
    this.next_if_ok = next_if_ok
    this.args = args
    this.pos = get_pos(this)
    this.str_pos = 0
}

LITERAL.prototype.reset = function(){
    this.str_pos = 0
}

LITERAL.prototype.feed = function(char){
    console.log('LITERAL', this.string, 'expects', this.string[this.str_pos], 'char', char)
    if(this.string == '<!DOCTYPE>'){
        console.log('LITERAL feed', this.string, char, this.str_pos)
    }
    if(this.str_pos == this.string.length){
        return this.origin.feed(DONE)
    }
    if(char == this.string[this.str_pos]){
        this.str_pos++
        return this
    }else{
        return this.origin.feed(FAIL)
    }
}

LITERAL.prototype.handle_fail = function(char){
    console.log('LITERAL', this, this.string, 'handle fail on char', char)
    var q = this.args.quantifier
    if(q == '*'){
        this.origin.expect = this.next_if_ok
        reset_pos(this, this.pos)
        return this.origin
    }
    return this.origin.handle_fail(char)
}

function NAME_rule(origin, next_if_ok){
  this.origin = origin
  this.rank = this.origin.expect
  this.next_if_ok = next_if_ok
  this.value = ''
  this.pos = get_pos(this)
}

NAME_rule.prototype.reset = function(){
    this.value = ''
}

NAME_rule.prototype.feed = function(char){
    console.log('NAME_rule, value', this.value, 'char', char)
  if(this.value == ''){
    if(is_id_start(char)){
      this.value = char
    }else{
      return this.origin.feed(FAIL)
    }
  }else if(is_id_continue(char)){
    this.value += char
  }else{
    return this.origin.feed(DONE)
  }
  return this
}

function NUMBER_rule(origin, next_if_ok, args){
  this.origin = origin
  this.rank = this.origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.pos = get_pos(this)
  this.value = ''
}

NUMBER_rule.prototype.reset = function(){
    this.value = ''
}

NUMBER_rule.prototype.feed = function(char){
  if(this.value == ''){
    if(is_num(char)){
      this.value = char
    }else if(this.args.next_if_fail !== undefined){
        this.origin.expect = this.args.next_if_fail
        return this.origin.feed(char)
    }else{
      return FAIL
    }
  }else if(is_num(char)){
    this.value += char
  }else{
    this.origin.expect = this.next_if_ok
    this.origin.store_result(this)
    return this.origin.feed(char)
  }
  return this
}

function S_rule(origin, next_if_ok, args){
  this.origin = origin
  this.pos = get_pos(this)
  this.rank = this.origin.expect
  this.next_if_ok = next_if_ok
  this.args = args
  this.value = ''
}

S_rule.prototype.reset = function(){
    this.value = ''
}

S_rule.prototype.feed = function(char){
    console.log('S_rule, char', char, 'value', this.value.length)
  if(this.value == ''){
      if(! is_space(char)){
          return FAIL
      }
      this.value = char
  }else if(is_space(char)){
      this.value += char
  }else{
      return this.origin.feed(char)
  }
  return this
}


function CHAR_rule(origin, next_if_ok, args){
  this.origin = origin
  this.next_if_ok = next_if_ok
  this.args = args
}

CHAR_rule.prototype.feed = function(char){
    if(is_char(char)){
        this.value = char
        return this.origin
    }else{
        return FAIL
    }
}

var hex_range_re = /^#x([a-fA-F0-9]+)-#x([a-fA-F0-9]+)$/
var charset_range_re = /(\w)-(\w)/g


function CHARSET_rule(origin, charset, next_if_ok){
    this.origin = origin
    this.charset = charset
    this.next_if_ok = next_if_ok
    this.pos = get_pos(origin)
    var negative = charset.startsWith('^'),
        body = negative ? charset.substr(1) : charset

    var mo = body.match(hex_range_re)
    if(mo){
        var left = parseInt(`0x${mo[1]}`, 16),
            right = parseInt(`0x${mo[2]}`, 16)
        if(negative){
            this.test = function(char){
                var cp = char.charCodeAt(0)
                return (cp < left) || (cp > right)
            }
        }else{
            this.test = function(char){
                var cp = char.charCodeAt(0)
                return (cp >= left) && (cp <= right)
            }
        }
        return
    }

    var ranges = []
    for(var mo of body.matchAll(charset_range_re)){
        console.log('mo', mo)
        ranges.push(mo.slice(1))
    }
    if(ranges.length > 0){
        console.log('ranges', ranges)
        if(negative){
            this.test = function(char){
                for(var range of ranges){
                    if(char >= range[0] && char <= range[1]){
                        return false
                    }
                }
                return true
            }
        }else{
            this.test = function(char){
                for(var range of ranges){
                    if(char >= range[0] && char <= range[1]){
                        return true
                    }
                }
                return false
            }
        }
        return
    }

    if(charset.startsWith('^')){
        this.test = char => ! charset.substr(1).includes(char)
    }else{
        this.test = char => charset.includes(char)
    }
}

CHARSET_rule.prototype.reset = function(){
    delete this.done
}

CHARSET_rule.prototype.feed = function(char){
    console.log('charset feed', this.charset, char, this.test(char))
    if(this.done){
        return this.origin.feed(DONE)
    }else if(! this.test(char)){
        return this.origin.feed(FAIL)
    }
    this.done = true
    return this
}

function BaseChar_rule(origin){
    this.origin = origin
    this.pos = get_pos(origin)
}

BaseChar_rule.prototype.reset = function(){
    delete this.done
}

BaseChar_rule.prototype.feed = function(char){
    console.log('BaseChar_rule, char', char, 'this.done', this.done)
    if(this.done){
        return this.origin.feed(DONE)
    }else if(/\p{L}/u.exec(char)){
        this.done = true
        return this
    }else{
        return this.origin.feed(FAIL)
    }
}

function Letter_rule(origin){
    this.origin = origin
    this.pos = get_pos(origin)
}

Letter_rule.prototype.reset = function(){
    delete this.done
}

Letter_rule.prototype.feed = function(char){
    if(this.done){
        return this.origin.feed(DONE)
    }
    if(/\p{L}/u.exec(char)){
        this.done = true
        return this
    }else{
        return this.origin.feed(FAIL)
    }
}

function NameChar_rule(origin){
    this.origin = origin
    this.pos = get_pos(origin)
}

NameChar_rule.prototype.reset = function(){
    delete this.done
}

NameChar_rule.prototype.feed = function(char){
    if(this.done){
        return this.origin.feed(DONE)
    }else if(is_id_continue(char)){
        this.done = true
        return this
    }else{
        return this.origin.feed(FAIL)
    }
}