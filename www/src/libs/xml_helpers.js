var _b_ = $B.builtins

var FAIL = {FAIL: true}
var DONE = {DONE: true}
var END = {END: true}

function is_id_start(char){
  return char !== END && char.match(/[a-zA-Z_]/)
}

function is_id_continue(char){
  return char !== END && (".-:_".includes(char) || char.match(/[a-zA-Z_0-9]/))
}

function is_space(char){
    return char !== END && ' \t\r\n'.includes(char)
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

function get_value(rule){
    // get string value for rule
    if(rule === undefined){
        console.log(Error().stack)
    }
    var res = ''
    if(rule.value){
        return rule.value
    }else if(rule.alt){
        return get_value(rule.selected_rule)
    }else{
        for(var rank in rule.result_store){
            var rules = rule.result_store[rank]
            if(Array.isArray(rules)){
                res += rules.map(get_value).join('')
            }else{
                res += get_value(rules)
            }
        }
    }
    return res
}

function get_rank(rule){
    return parseInt(Object.keys(rule.result_store)[0])
}

function external_id(ext_id){
    var ext_id_value = get_value(ext_id),
        systemId,
        publicId
    if(ext_id_value){
        switch(ext_id.selected_option){
            case 0:
                systemId = get_value(ext_id.selected_rule.rules[2])
                break
            case 1:
                publicId = get_value(ext_id.selected_rule.rules[2])
                systemId = get_value(ext_id.selected_rule.rules[4])
        }
    }
    return {publicId, systemId}
}

var handler = {
    AttDef: function(parser, rule){
        // S Name S AttType S DefaultDecl
        var defaultdecl = rule.rules[5],
            def_value,
            required
        switch(defaultdecl.selected_option){
            case 0:
                required = true
                break
            case 2:
                def_value = get_value(defaultdecl.rules[2].rules[1])
                break
        }
        return {
            elname: get_value(rule.origin.rules[2]),
            attname: get_value(rule.rules[1]),
            type: get_value(rule.rules[3]),
            default: def_value,
            required
        }
    },
    CData: function(parser, rule){
        return {value: get_value(rule)}
    },
    CharData: function(parser, rule){
        var value = get_value(rule)
        if(parser.CharacterDataHandler){
            parser.CharacterDataHandler(value)
        }
        return {value: get_value(rule)}
    },
    doctypedecl: function(parser, rule){
        var ext_id = external_id(rule.rules[3])
        var name = get_value(rule.rules[2])
        var has_internal_subset = false
        if(rule.rules[5].rules[1]){
            has_internal_subset = get_value(rule.rules[5].rules[1]) != ''
        }
        return {name,
                systemId: ext_id.systemId,
                publicId: ext_id.publicId,
                has_internal_subset
               }
    },
    elementdecl: function(parser, rule){
        return {
            name: get_value(rule.rules[2]),
            model: get_value(rule.rules[4])
        }
    },
    ETag: function(parser, rule){
        var name = get_value(rule.rules[1])
        if(parser.EndElementHandler){
            parser.EndElementHandler(name)
        }
        return {name: get_value(rule.rules[1])}
    },
    GEDecl: function(parser, rule){
        // '<!ENTITY' S Name S EntityDef S? '>'
        var entitydef = rule.rules[4],
            value,
            systemId,
            publicId,
            notationName
        // EntityValue | (ExternalID NDataDecl?)
        switch(entitydef.selected_option){
            case 0:
                // EntityValue    ::=  '"' ([^%&"] | PEReference | Reference)* '"'
                //  |  "'" ([^%&'] | PEReference | Reference)* "'"
                value = get_value(entitydef.selected_rule.selected_rule.result_store[1])
                break
            case 1:
                var ext_id = external_id(entitydef.selected_rule.rules[0])
                systemId = ext_id.systemId
                publicId = ext_id.publicId
                if(entitydef.selected_rule.result_store[1]){
                    // NDataDecl ::=  S 'NDATA' S Name
                    notationName = get_value(entitydef.selected_rule.rules[1].rules[3])
                }
        }
        return {
            name: get_value(rule.rules[2]),
            is_parameter_entity: false,
            value,
            systemId,
            publicId,
            notationName
        }
    },
    NotationDecl: function(parser, rule){
        // '<!NOTATION' S Name S (ExternalID | PublicID) S? '>'
        var systemId,
            publicId,
            ext_or_public = rule.rules[4]

        switch(ext_or_public.selected_option){
            case 0:
                var ext_id = external_id(ext_or_public.selected_rule)
                systemId = ext_id.systemId
                publicId = ext_id.publicId
                break
            case 1:
                publicId = get_value(ext_or_public.selected_rule.rules[2])
                break
        }
        return {
            name: get_value(rule.rules[2]),
            systemId: ext_id.systemId,
            publicId: ext_id.publicId
        }
    },
    STag: function(parser, rule){
        var name = get_value(rule.rules[1])
        var attrs = rule.result_store[2],
            attr_result = $B.empty_dict()
        if(attrs){
            for(var attr of attrs){
                var attr_value_rule = attr.result_store[1].result_store[2].selected_rule.result_store[1][0]
                var attr_name = get_value(attr.result_store[1].result_store[0]),
                    attr_value = get_value(attr_value_rule)
                _b_.dict.$setitem(attr_result, attr_name, attr_value)
            }
        }
        if(parser.StartElementHandler){
            parser.StartElementHandler(name, attr_result)
        }
        return {name, attr_result}
    },
    XMLDecl: function(parser, rule){
        // '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
        var encoding,
            standalone
        if(rule.result_store[2]){
            // S 'encoding' Eq ('"' EncName '"' | "'" EncName "'" )
            encoding = get_value(rule.rules[2].rules[3].selected_rule.rules[1])
        }
        if(rule.result_store[3]){
            // S 'standalone' Eq (("'" ('yes' | 'no') "'") | ('"' ('yes' | 'no') '"'))
            sddecl = rule.rules[3]
            standalone = get_value(sddecl.rules[3].selected_rule.rules[1])
        }
        return {
            version: get_value(rule.rules[1].rules[3].selected_rule.rules[1]),
            encoding,
            standalone
        }
    }
}

function emit(rule){
    // called when a rule is done
    var rname = rule.constructor.name
    rname = rname.substr(0, rname.length - 5)
    if(handler[rname]){
        var parser = get_top(rule)
        // console.log('emit', rname)
        handler[rname](parser, rule)
    }
}

function handle_simple(element, next_if_ok, rule, char){
    if(char === FAIL){
        if(typeof element.origin.feed !== 'function'){
            console.log('not a func', element)
        }
        return element.origin.feed(FAIL)
    }else if(char === DONE){
        element.result_store[element.expect] = rule // get_sub(rule, rule.pos, get_pos(rule)) // get_string(rule)
        var test = (rule.constructor.name == 'element_rule' ||
                rule.constructor.name == 'Attribute_rule')
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
        if(element.repeats[rank] == 0){
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
        set_expect(element, next_if_ok)
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
    var test = false // rule instanceof tmp_6_rule
    if(test){
        console.log('HANDLE STAR', rule, 'char', char)
    }
    if(char === FAIL){
        set_expect(element, next_if_ok)
        reset_pos(element, rule.pos)
        rule.reset()
        return element.feed(read_char(element))
    }else if(char === DONE){
        if(test){
            console.log(rule, 'DONE')
        }
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
        element.selected_option = element.expect
        element.selected_rule = rule
        element.result_store[element.expect] = rule
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
    var test = false // element instanceof tmp_6_rule
    if(test){
        console.log('handle_last', rule, char)
        alert()
    }
    if(char === FAIL){
        return element.origin.feed(FAIL)
    }else if(char === DONE){
        element.result_store[element.expect] = rule
        if(element.alt){
            element.selected_option = element.expect
            element.selected_rule = rule
            if(test){
                console.log('set selected', element)
                console.log('value', get_value(rule))
                element.coucou = 'ici'
                alert()
            }
        }
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
        this.value = this.string
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

function S_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.rank = this.origin.expect
  this.value = ''
}

S_rule.prototype.reset = function(){
    this.value = ''
}

S_rule.prototype.feed = function(char){
  if(is_space(char)){
      this.value += char
      return this
  }else if(this.value.length > 0){
      return this.origin.feed(DONE)
  }else{
      return this.origin.feed(FAIL)
  }
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
    this.value = ''
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
    if(char !== END && this.test(char)){
        this.value += char
        return this
    }else if(this.value.length > 0){
        return this.origin.feed(DONE)
    }else{
        return this.origin.feed(FAIL)
    }
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
        this.value = char
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

function PIText_rule(origin){
    this.origin = origin
    this.value = ''
    this.pos = get_pos(origin)
}

PIText_rule.prototype.reset = function(){}

PIText_rule.prototype.feed = function(char){
    if(char === END){
        return this.origin.feed(FAIL)
    }
    this.value += char
    if(this.value.endsWith('?>')){
        reset_pos(this, get_pos(this) - 1)
        this.value = this.value.substr(0, this.value.length - 2)
        return this.origin.feed(DONE)
    }
    return this
}

function CommentText_rule(origin){
    this.origin = origin
    this.value = ''
    this.pos = get_pos(origin)
}

CommentText_rule.prototype.reset = function(){}

CommentText_rule.prototype.feed = function(char){
    if(char === END){
        return this.origin.feed(FAIL)
    }
    this.value += char
    if(this.value.endsWith('-->')){
        reset_pos(this, get_pos(this) - 2)
        this.value = this.value.substr(0, this.value.length - 3)
        if(this.value.endsWith('-')){
            return this.origin.feed(FAIL)
        }
        return this.origin.feed(DONE)
    }
    return this
}

function CharData_rule(origin){
    this.origin = origin
    this.pos = get_pos(origin)
    this.value = ''
}

CharData_rule.prototype.reset = function(){}

CharData_rule.prototype.feed = function(char){
    // [^<&]* - ([^<&]* ']]>' [^<&]*)
    if(char === END){
        return this.origin.feed(FAIL)
    }
    if('<&'.includes(char)){
        return this.origin.feed(DONE)
    }
    this.value += char
    if(this.value.endsWith(']]>')){
        reset_pos(this, get_pos(this) - 2)
        this.value = this.value.substr(0, this.value.length - 3)
        return this.origin.feed(DONE)
    }
    return this
}

function CData_rule(origin){
    this.origin = origin
    this.pos = get_pos(origin)
    this.value = ''
}

CData_rule.prototype.reset = function(){}

CData_rule.prototype.feed = function(char){
    // (Char* - (Char* ']]>' Char*))
    if(char === END){
        return this.origin.feed(FAIL)
    }
    this.value += char
    if(this.value.endsWith(']]>')){
        reset_pos(this, get_pos(this) - 2)
        this.value = this.value.substr(0, this.value.length - 3)
        return this.origin.feed(DONE)
    }
    return this
}

function Ignore_rule(origin){
    this.origin = origin
    this.pos = get_pos(origin)
    this.value = ''
}

Ignore_rule.prototype.reset = function(){}

Ignore_rule.prototype.feed = function(char){
    // Char* - (Char* ('<![' | ']]>') Char*)
    if(char === END){
        return this.origin.feed(FAIL)
    }
    this.value += char
    if(this.value.endsWith('<![') || this.value.endsWith(']]>')){
        reset_pos(this, get_pos(this) - 2)
        this.value = this.value.substr(0, this.value.length - 3)
        return this.origin.feed(DONE)
    }
    return this
}

function PITarget_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Name
  this.items = ['Name', 'tmp_21']
  this.rules = []
  this.repeats = []
}

PITarget_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Name
      if(! this.rules[0]){
        this.rules[0] = new Name_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case 1: // tmp_21
      if(! this.rules[1]){
        this.rules[1] = new tmp_21_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      var value = get_value(this)
      if(value.toLowerCase() == 'xml'){
          return this.origin.feed(FAIL)
      }
      return this.origin.feed(DONE)
  }
  return this
}

PITarget_rule.prototype.reset = function(){
  this.expect = 0
}
