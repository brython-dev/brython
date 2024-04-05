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

function get_sub(element, start, end){
    return get_top(element)._buffer.substring(start, end)
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
    get_top(element)._pos = pos
}

function update_pos(element, pos){
    element.pos = pos
}

function delete_pos(rule){
    return
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
    var test = false // element.constructor.name == 'Attribute_rule' && expect == 1
    if(test){
        console.log('set expect of', element)
        console.log(`  >>> set expect of ${element.constructor.name} to ${expect}`)
        alert()
    }
    element.expect = expect
    if(element.rules[expect]){
        var rule = element.rules[expect]
        rule.start = get_pos(element)
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

function get_string(rule){
    if(rule instanceof LITERAL){
        return rule.string
    }else if(rule instanceof Letter_rule ||
            rule instanceof CHARSET_rule){
        var s = get_sub(rule, rule.pos, rule.pos + 1)
        return s
    }
    if(rule.items === undefined){
        console.log('no items for rule', rule)
    }
    if(rule.constructor.name == 'element_rule'){
        console.log('get string of', rule)
        alert()
    }
    var s = ''
    for(var i = 0, len = rule.items.length; i < len; i++){
        var item = rule.items[i],
            last = item[item.length - 1]
        if(rule.result_store[i] === undefined){
            continue
        }
        if('?+*'.includes(last)){
            s += rule.result_store[i].join('')
        }else{
            s += rule.result_store[i]
        }
    }
    return s
}

var handler = {
    STag: function(rule){
        var name = rule.rules[1].result_store[0]
        var extra = rule.rules[1].result_store[1]
        if(extra.length){
            name += extra[0].value
        }
        var attrs = rule.result_store[2],
            attr_result = {}
        if(attrs){
            for(var attr of attrs){
                var attr_name_obj = attr.result_store[1].rules[0].result_store,
                    attr_name = attr_name_obj[0]
                if(attr_name_obj[1].length){
                    console.log(attr_name_obj[1])
                    attr_name += attr_name_obj[1][0].value
                }
                var attr_value = attr.result_store[1].result_store[2]
                var alt_rank = Object.keys(attr_value.result_store)[0]
                var value_store = attr_value.rules[alt_rank].result_store[1],
                    value = ''
                for(var item of value_store){
                    value += item.result_store[0]
                }
                attr_result[attr_name] = value
            }
        }
        return {name, attr_result}
    }
}

function emit(rule){
    // called when a rule is done
    var rname = rule.constructor.name
    rname = rname.substr(0, rname.length - 5)
    if(['element', 'STag'].includes(rname)){
        if(handler[rname]){
            console.log('handler', handler[rname](rule))
        }
    }
}

function handle_simple(element, next_if_ok, rule, char){
    if(char === FAIL){
        return element.origin.feed(FAIL)
    }else if(char === DONE){
        element.result_store[element.expect] = get_sub(rule, rule.pos, get_pos(rule)) // get_string(rule)
        var test = (rule.constructor.name == 'element_rule' ||
                rule.constructor.name == 'Attribute_rule')
        if(test){
            console.log(rule.constructor.name, element.result_store[element.expect])
            console.log('set expect of element', element, 'to', element.items[next_if_ok])
        }
        rule.reset()
        emit(rule)
        set_expect(element, next_if_ok)
        return element.feed(read_char(element))
    }else if(char === END){
        set_expect(element, next_if_ok)
        return element
    }else{
        return rule.feed(char)
    }
}

function handle_plus(element, rank, next_if_ok, rule, char){
    if(char === FAIL){
        if(element.repeats[{i}] == 0){
            reset_pos(element, rule.pos)
            return element.origin.feed(FAIL)
        }
        set_expect(element, next_if_ok)
        reset_pos(element, rule.pos)
        rule.reset()
        return element.feed(read_char(element))
    }else if(char === DONE){
        element.result_store[rank] = element.result_store[rank] || []
        element.result_store[rank].push(rule)
        element.repeats[rank] += 1
        update_pos(element, get_pos(element))
        //rule.reset()
        emit(rule)
        delete element.rules[rank]
        return element.feed(read_char(element))
    }else if(char === END){
        set_expect(element, next_if_ok)
        return element.feed(char)
    }else{
        return rule.feed(char)
    }
}

function handle_star(element, rank, next_if_ok, rule, char){
    if(char === FAIL){
        set_expect(element, next_if_ok)
        reset_pos(element, rule.pos)
        rule.reset()
        return element.feed(read_char(element))
    }else if(char === DONE){
        element.result_store[rank] = element.result_store[rank] || []
        element.result_store[rank].push(rule)
        if(rule.constructor.name == 'XXXtmp_49_rule'){
            console.log('DONE', rule.constructor.name)
            console.log('element', element)
            console.log('element.result_store[rank]', element.result_store[rank])
            alert()
        }
        element.repeats[rank] += 1
        update_pos(element, get_pos(element))
        //rule.reset()
        emit(rule)
        delete element.rules[rank]
        return element.feed(read_char(element))
    }else if(char === END){
        set_expect(element, next_if_ok)
        return element.feed(char)
    }else{
        return rule.feed(char)
    }
}

function handle_zero_or_one(element, rank, next_if_ok, rule, char){
    if(char === FAIL){
        set_expect(element, next_if_ok)
        reset_pos(element, rule.pos)
        rule.reset()
        return element.feed(read_char(element))
    }else if(char === DONE){
        element.result_store[rank] = element.result_store[rank] || []
        element.result_store[rank].push(rule)
        element.repeats[rank] += 1
        update_pos(element, get_pos(element))
        emit(rule)
        rule.reset()
        set_expect(element, next_if_ok)
        return element.feed(read_char(element))
    }else if(char === END){
        set_expect(element, next_if_ok)
        return element.feed(char)
    }else{
        return rule.feed(char)
    }
}

function handle_alt(element, alt_index, rule, char){
    if(char === FAIL){
        set_expect(element, alt_index)
        reset_pos(element, element.pos)
        return element.origin.feed(read_char(element))
    }else if(char === DONE){
        if(['AttValue_rule'].includes(rule.constructor.name)){
            console.log('DONE', rule.constructor.name, get_sub(rule, rule.pos, get_pos(rule)))
            console.log('  ', rule)
            alert()
        }
        var s = get_sub(rule, rule.pos, get_pos(rule))
        element.result_store[element.expect] = s
        emit(rule)
        rule.reset()
        return element.origin.feed(char)
    }else if(char === END){
        set_expect(element, -1)
        return element
    }else{
        return rule.feed(char)
    }
}

function handle_last(element, rule, char){
    var test = false // rule instanceof LITERAL && rule.string == '?>'
    if(test){
        console.log('handle_last', rule, char)
        alert()
    }
    if(char === FAIL){
        return element.origin.feed(FAIL)
    }else if(char === DONE){
        element.result_store[element.expect] = rule
        emit(rule)
        rule.reset()
        set_expect(element, -1)
        if(test){
            console.log('return control to element', element)
            alert()
        }
        return element.feed(char)
    }else if(char === END){
        set_expect(element, -1)
        return element
    }else{
        return rule.feed(char)
    }
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
    //console.log('LITERAL', this.string, 'expects', this.string[this.str_pos], 'char', char)
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
    //console.log('charset feed', this.charset, char, this.test(char))
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
    //console.log('BaseChar_rule, char', char, 'this.done', this.done)
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
    }else if(/\p{L}/u.exec(char)){
        this.done = true
        return this
    }else{
        return this.origin.feed(FAIL)
    }
}

function NameChar_rule(origin){
    this.origin = origin
    this.rank = origin.expect
    this.value = ''
    var result_store = this.origin.result_store
    result_store[this.rank] = result_store[this.rank] ?? []
    this.pos = get_pos(origin)
}

NameChar_rule.prototype.reset = function(){
    delete this.done
}

NameChar_rule.prototype.feed = function(char){
    if(this.done){
        return this.origin.feed(DONE)
    }else if(is_id_continue(char)){
        this.value += char
        return this
    }else{
        if(this.value == ''){
            return this.origin.feed(FAIL)
        }
        return this.origin.feed(DONE)
    }
}