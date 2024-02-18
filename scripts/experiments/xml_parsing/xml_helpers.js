var FAIL = {FAIL: true}
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

function reset_pos(element, pos){
    get_top(element)._pos = pos
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

LITERAL.prototype.feed = function(char){
    if(char == this.string[this.str_pos]){
        this.str_pos++
        if(this.str_pos == this.string.length){
            return this.origin
        }
        return this
    }else{
        return FAIL
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
  if(this.value == ''){
    if(is_id_start(char)){
      this.value = char
    }else{
      return FAIL
    }
  }else if(is_id_continue(char)){
    this.value += char
  }else{
    this.origin.expect = this.next_if_ok
    return this.origin.feed(char)
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

function CHARSET_rule(origin, charset, next_if_ok, args){
    this.origin = origin
    this.charset = charset
    this.next_if_ok = next_if_ok
    this.args = args
    if(charset.startsWith('^')){
        this.test = char => ! charset.substr(1).includes(char)
    }else{
        this.test = char => charset.includes(char)
    }
}

CHARSET_rule.prototype.feed = function(char){
    console.log('charset feed', this.charset, char, this.test(char))
    if(! this.test(char)){
        return FAIL
    }
    return this.origin
}