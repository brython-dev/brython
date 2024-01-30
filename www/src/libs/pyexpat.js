(function($B){

var _b_ = $B.builtins

const XML_PARAM_ENTITY_PARSING_NEVER = 0,
      XML_PARAM_ENTITY_PARSING_UNLESS_STANDALONE = 1,
      XML_PARAM_ENTITY_PARSING_ALWAYS = 2


var xmlparser = $B.make_class('xmlparser',
    function(encoding, namespace_separator, intern){
        return {
            __class__: xmlparser,
            encoding,
            namespace_separator,
            intern,
            _buffer: '',
            _state: 'data',
            _data_buffer: '',
            initialized: false,
            has_xml_header: false
        }
    }
)

const encoding_re = /<\?xml .*encoding\s*=\s*"(.*)"/

xmlparser.Parse = function(){
    var $ = $B.args('Parse', 3,
                {self: null, data: null, isfinal: null},
                ['self', 'data', 'isfinal'], arguments,
                {}, null, null),
        self = $.self,
        data = $.data,
        isfinal = $.isfinal,
        decoder,
        array
    if(self.finished){
        throw Error('parsing finished')
    }
    if(_b_.isinstance(data, _b_.bytes)){
        if(self.encoding === _b_.None){
            // try getting encoding from prolog
            decoder = new TextDecoder('iso-8859-1')
            array = new Uint8Array(data.source.slice(0, 200))
            var head = decoder.decode(array)
            var mo = encoding_re.exec(head)
            if(mo){
                self.encoding = mo[1]
            }else{
                self.encoding = 'utf-8' // default
            }
        }
        // decode bytes
        decoder = new TextDecoder(self.encoding)
        array = new Uint8Array(data.source)
        data = decoder.decode(array)
    }
    if(! self.initialized){
        if(data[0] != '<'){
            throw Error("XML or text declaration not at start of entity")
        }
        self.initialized = true
    }
    self._buffer = data
    self._buffer_length = _b_.len(data)
    self._pos = 0
    for(var token of xmlparser.xml_tokenizer(self)){
        if(token instanceof ELEMENT){
            if(! token.is_declaration && ! token.is_end){
                self.StartElementHandler(token.name, token.attrs)
            }else if(token.is_end){
                self.EndElementHandler(token.name)
            }
        }else if(token instanceof DATA){
            self.CharacterDataHandler(token.value)
        }
    }
    if(isfinal){
        self.finished = true
    }
}

xmlparser.SetBase = function(self, base){
    self._base = base
    return _b_.None
}

xmlparser.SetParamEntityParsing = function(self, peParsing){
    self._peParsing = peParsing
    return peParsing
}

xmlparser.xml_tokenizer = function*(self){
    // convert bytes to string
    while(self._pos < self._buffer_length){
        var char = self._buffer[self._pos]
        if(self._state == 'data' && char == '<'){
            if(self._data_buffer.length > 0){
                yield new DATA(self._data_buffer)
            }
            self._state = 'element'
            self._tag_state = 'tag_name'
            self._element = new ELEMENT(self)
            self._pos++
        }else if(self._state == 'data'){
            if(char == '\n'){
                if(self._data_buffer.length > 0){
                    yield new DATA(self._data_buffer)
                }
                yield new DATA(char)
                self._data_buffer = ''
            }else{
                self._data_buffer += char
            }
            self._pos++
        }else if(self._state == 'element' &&
                self._element.expect == 'name_start'
                && char == '!'){
            self._element = new DTD(self)
            self._pos++
        }else if(self._state == 'element'){
            self._element = self._element.feed(char)
            if(self._element === undefined){
                console.log('undefined after char', char,
                    self._buffer.substring(self._pos - 10, self._pos + 10))
            }
            if(self._element.closed){
                yield self._element
                self._state = 'data'
                self._data_buffer = ''
            }else if(self._element.is_comment){
                self._state = 'comment'
                self._comment = new COMMENT(self)
            }
            self._pos++
        }else if(self._state == 'comment'){
            self._comment.feed(char)
            if(self._comment.closed){
                yield self._comment
                self._state = 'data'
                self._data_buffer = ''
            }
            self._pos++
        }else{
            self._pos++
        }
    }
    console.log('fini')
}

$B.set_func_names(xmlparser, 'expat')

function raise_error(parser, message){
    message += ' at position ' + parser._pos
    var ix = parser._pos
    while(ix >= 0 && parser._buffer[ix] !== '\n'){
        ix--
    }
    message += '\n' + parser._buffer.substring(ix, parser._pos + 1)
    throw error.$factory(message)
}

var error = $B.make_class("error",
    function(message){
        return {
            __class__: error,
            msg: message,
            args: $B.fast_tuple([message]),
            __cause__: _b_.None,
            __context__: _b_.None,
            __suppress_context__: false
        }
    })
error.__bases__ = [_b_.Exception, _b_.object]
error.__mro__ = [_b_.Exception, _b_.BaseException, _b_.object]

$B.set_func_names(error, "expat")

function DOCTYPE(parser){
    this.parser = parser
    this.expect = 'element_start'
}

DOCTYPE.prototype.feed = function(char){
    if(this.expect == 'element_start'){
        if(is_id_start(char)){
            this.root_element = char
            this.expect = 'element_continue'
        }else if(! is_whitespace(char)){
            throw Error('expected element start, got: ' + char)
        }
    }else if(this.expect == 'element_continue'){
        if(is_id_continue(char)){
            this.root_element += char
        }else{
            if(is_whitespace(char)){
                this.expect = 'rest'
            }else{
                throw Error('expected whitespace after root element, got: ' + char)
            }
        }
    }else if(this.expect == 'rest'){
        if(! is_whitespace(char)){
            if(is_id_start(char)){
                // external DTD
                this.type = 'external'
                this.decl = char
                this.expect = 'decl_continue'
            }else if(char == '['){
                this.type = 'internal'
                this.expect = ']'
                this.declarations = ''
            }else{
                throw Error('unexpected in DOCTYPE: ' + char)
            }
        }
    }else if(this.expect == 'decl_continue'){
        if(is_id_continue(char)){
            this.decl += char
        }else{
            if(is_whitespace(char)){
                this.expect = 'string_start'
                this.strings = []
            }else{
                throw Error('unexpected after declaration: ' + char)
            }
        }
    }else if(this.expect == 'string_start'){
        if(! is_whitespace(char)){
            if(char == '"' || char == "'"){
                this.quote = char
                this.string = ''
                this.expect = 'string_end'
            }else{
                raise_error(this.parser, 'expected quote, got: ' + char)
            }
        }
    }else if(this.expect == 'string_end'){
        if(char == this.quote){
            this.strings.push(this.string)
            if(this.strings.length == 1){
                this.fpi = this.strings[0]
                this.expect = 'string_start'
                this.string = ''
            }else{
                this.url = this.strings[1]
                this.expect = '>'
            }
        }else{
            this.string += char
        }
    }else if(this.expect == '>'){
        if(! is_whitespace(char)){
            if(char == '>'){
                this.closed = true
            }else{
                throw Error('expected >, ggot: ' + char)
            }
        }
    }else if(this.expect == ']'){
        if(char == ']'){
            this.expect = '>'
        }else{
            this.declaration += char
        }
    }else{
        throw Error('wrong expect: ' + this.expect)
    }
    return this
}
function DTD(parser){
    this.parser = parser
    this.expect = 'name_start'
    this.items = []
}

DTD.prototype.feed = function(char){
    if(this.expect == 'name_start'){
        if(is_id_start(char)){
            this.name = char
            this.expect = 'name_continue'
        }else if(char == '-'){
            this.expect = '-' // maybe comment start
        }else{
            throw Error('expected name, got ' + chare)
        }
    }else if(this.expect == 'name_continue'){
        if(is_id_continue(char)){
            this.name += char
        }else{
            if(this.name == 'DOCTYPE'){
                return new DOCTYPE(this.parser)
            }
            if(char == '>'){
                this.closed = true
            }else{
                this.expect == 'any'
            }
        }
    }else if(this.expect == '-'){
        if(char == '-'){
            // comment
            this.is_comment = true
        }else{
            throw Error('expected -, got: ' + char)
        }
    }else{
        if(char == '>'){
            this.closed = true
        }else{
            this.items.push(char)
        }
    }
    return this
}

DTD.prototype.toString = function(){
    var res = `<!${this.name}`
    if(this.items.length > 0){
        res += ' '
        var items = this.items.map(x => x.toString())
        res += items.join(' ')
    }
    return res + '>'
}

function COMMENT(parser){
    this.parser = parser
    this.value = ''
    this.expect = '-'
}

COMMENT.prototype.feed = function(char){
    if(this.expect == '-'){
        if(char == '-'){
            this.expect = '--'
        }else{
            this.value += char
        }
    }else if(this.expect == '--'){
        if(char == '-'){
            this.expect = '>'
        }else{
            this.value += '-' + char
            this.expect = '-'
        }
    }else if(this.expect == '>'){
        if(char == '>'){
            this.closed = true
        }else{
            throw Error('comment, expected >, got: ' + char)
        }
    }
}

function ELEMENT(parser) {
    this.parser = parser
    this.expect = 'name_start'
    this.attrs = $B.empty_dict()
}

ELEMENT.prototype.add_attribute_name = function(attr_name){
    if(_b_.dict.$contains(this.attrs, attr_name)){
        throw Error(`duplicate attribute name: ${attr_name}`)
    }
    _b_.dict.$setitem(this.attrs, attr_name, _b_.None)
}

ELEMENT.prototype.set_attribute_value = function(value){
    _b_.dict.$setitem(this.attrs, this.attr_name, value)
}

ELEMENT.prototype.feed = function(item){
    if(this.expect == 'name_start'){
        if(item == '?'){
            if(this.is_declaration){
                throw Error('already got ?')
            }
            this.is_declaration = true
        }else if(item == '/'){
            if(this.is_end){
                throw Error('already got /')
            }
            this.is_end = true
        }else if(is_id_start(item)){
            this.name = item
            this.expect = 'name_continue'
        }
    }else if(this.expect == 'name_continue'){
        if(is_id_continue(item)){
            this.name += item
        }else{
            // end of element name
            if(this.is_declaration){
                if(this.name == 'xml'){
                    this.is_xml_header = true
                }else{
                    return new PROCESSING_INSTRUCTION(this.parser, this.name)
                }
            }
            if(is_whitespace(item)){
                this.expect = 'attr_name_start'
            }else if(item == '>'){
                this.closed = true
            }else if(item == '/'){
                this.self_closing = true
                this.expect = '>'
            }else{
                throw Error('unexpected at end of element name: ' + item)
            }
        }
    }else if(this.expect == 'attr_name_start'){
        if(item == '/'){
            this.self_closing = true
        }else if(item == '>'){
            this.closed = true
        }else if(is_id_start(item)){
            this.attr_name = item
            this.expect = 'attr_name_continue'
        }else if(item == '?' && this.is_declaration){
            this.expect = '>'
        }else if(! is_whitespace(item)){
            throw Error('expected attribute name, got: ' + item)
        }
    }else if(this.expect == 'attr_name_continue'){
        if(is_id_continue(item)){
            this.attr_name += item
        }else if(item == '='){
            this.add_attribute_name(this.attr_name)
            this.expect = 'attr_value_start'
            this.attr_value = ''
        }else if(is_whitespace(item)){
            this.add_attribute_name(this.attr_name)
            this.expect = '='
        }else if(item == '>'){
            this.add_attribute_name(this.attr_name)
            this.closed = true
        }else{
            throw Error('unexpected character in attribute name: ' + item)
        }
    }else if(this.expect == '='){
        if(item == '='){
            this.expect = 'attr_value_start'
        }else if(! is_whitespace(item)){
            throw Error('expected =, got: ' + item)
        }
    }else if(this.expect == 'attr_value'){
        if(item == '='){
            this.expect = 'attr_value_start'
            this.attr_value = ''
        }else if(item == '>'){
            this.closed = true
        }else if(is_id_start(item)){
            this.attr_name = item
            this.expect = 'attr_name_continue'
        }else if(! is_whitespace(item)){
            throw Error('expected attribute value or name, got: ' + item)
        }
    }else if(this.expect == 'attr_value_start'){
        if(item == '"' || item == "'"){
            this.expect = 'quote'
            this.quote = item
            this.attr_value = ''
        }else if(! is_whitespace(item)){
            throw Error('unexpect attribute value start: ' + item)
        }
    }else if(this.expect == "quote"){
        if(item == this.quote){
            this.set_attribute_value(this.attr_value)
            this.expect = 'attr_name_start'
        }else{
            this.attr_value += item
        }
    }else if(this.expect == '>'){
        if(item == '>'){
            this.closed = true
        }else{
            throw Error('expected >, got: ' + item)
        }
    }else if(this.expect == 'attr_name'){
        if(item instanceof Name){
            if(_b_.dict.__contains__(this.attrs, item.value)){
                throw Error('duplicate value ' + item.value)
            }
            _b_.dict.$setitem(this.attrs, item.value, _b_.None)
            this.last_attr = item.value
        }else if(item.value == '?' && this.is_declaration){
            if(this.question_mark){
                throw Error('already ?')
            }
            this.question_mark = true
        }else if(item == END){
            if(this.is_declaration && ! this.question_mark){
                throw Error('missing ')
            }
        }else if(item instanceof Punctuation && item.value == '/'){
            this.no_end = true
            this.expect = END
        }else{
            throw Error('expected attribute name, got ' + item)
        }
    }else if(this.expect == 'attr_value'){
        _b_.dict.$setitem(this.attrs, this.last_attr, item)
        this.expect = 'attr_name'
    }else if(this.expect == END){
        // after "/"
        if(item != END){
            throw Error('nothing after /')
        }
    }
    return this
}

ELEMENT.prototype.toString = function() {
    var res = `<`
    res += this.is_end ? '/' : ''
    res += this.name
    if(this.attrs.length > 0){
        res += ' '
    }
    var attrs = []
    for(var item of _b_.dict.$iter_items(this.attrs)){
        console.log('item', item)
        attrs.push(`${item.key}: ${item.value.toString()}`)
    }
    res += attrs.join(' ')
    if(this.no_end){
        res += '/'
    }
    return res + '>'
}

function PROCESSING_INSTRUCTION(parser, name){
    this.parser = parser
    this.name = name
    this.expect = '?'
    this.content = ''
}

PROCESSING_INSTRUCTION.prototype.feed = function(char){
    // capture everything until the sequence ?>
    if(this.expect == '?'){
        if(char == '?'){
            this.expect = '>'
        }else{
            this.content += char
        }
    }else if(this.expect == '>'){
        if(char == '>'){
            this.closed = true
        }else{
            this.content += '?' + char
            this.expect = '-'
        }
    }
    return this
}

function ATTR(name){
  this.name = name
}

ATTR.prototype.toString = function(){
  var res = this.name
  if(this.hasOwnProperty('value')){
    res += '=' + this.value
  }
  return res
}

function DATA(value) {
    this.value = value
}

DATA.prototype.toString = function() {
    return `${this.value}`
}

var START = 'START'
var END = 'END'


function Name(value){
    this.value = value
}

Name.prototype.toString = function(){
    return this.value
}

function Punctuation(value){
    this.value = value
}

function String(quote, value){
    this.quote = quote
    this.value = value
}

String.prototype.toString = function(){
    return this.quote + this.value + this.quote
}

const punctuations = '!?/'

function open(url){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, false)
    xhr.onreadystatechange = function(ev){
        if(this.readyState == 4){
            process(this.responseText)
        }
    }
    xhr.send()
}

function create_parser(){
    console.log('create parser', arguments)
    var $ = $B.args('ParserCreate', 3,
                {encoding: null, namespace_separator: null, intern: null},
                ['encoding', 'namespace_separator', 'intern'], arguments,
                {encoding: _b_.None, namespace_separator: _b_.None, intern: _b_.None},
                null, null),
        encoding = $.encoding,
        ns_sep = $.namespace_separator,
        intern = $.intern
    if(encoding !== _b_.None && ! _b_.isinstance(encoding, _b_.str)){
        throw _b_.TypeError.$factory(
            `ParserCreate() argument 'encoding' must be ` +
            `str or None, not ${$B.class_name(encoding)}`)
    }
    if(ns_sep !== _b_.None){
        if(! _b_.isinstance(ns_sep, _b_.str)){
            throw _b_.TypeError.$factory(
                `ParserCreate() argument 'namespace_separator' must be ` +
                `str or None, not ${$B.class_name(ns_sep)}`)
        }
        if(ns_sep.length != 1){
            throw _b_.ValueError.$factory("namespace_separator must be at " +
                "most one character, omitted, or None")
        }
    }
    if(intern === _b_.None){
        intern = $B.empty_dict()
    }else if(! _b_.isinstance(intern, _b_.dict)){
        throw _b_.TypeError.$factory('intern must be a dictionary')
    }
    return xmlparser.$factory(encoding, ns_sep, intern)
}

function display(text){
    report.value += text + '\n'
}

function process(src){
    var indent = 0
    for(var token of xml_tokenizer(src)){
        if(indent > 50){
            break
        }
        var head = ' '.repeat(indent)
        if(token instanceof DATA){
            display(head + ' ' + token.toString())
        }else if(token instanceof ELEMENT){
            if(token.is_end){
                indent--
            }
            head = ' '.repeat(indent)
            display(head + token.toString())
            if(token.is_end || token.self_closing || token.is_declaration){
                //
            }else{
                indent++
            }
        }else if(token instanceof DECLARATION){
            display(head + token.toString())
        }else{
            console.log(head + 'token', token, token.toString())
        }
    }
}

function is_id_start(char){
    return char.match(/\p{L}/u) || char == "_"
}

function is_id_continue(char){
    return char.match(/\p{L}/u) || "-_:".includes(char) || char.match(/\d/)
}

function is_whitespace(s){
    for(let char of s){
        if(! ' \n\r\t'.includes(char)){
            return false
        }
    }
    return s.length > 0
}

var model = 'model',
    errors = 'errors'

$B.addToImported('pyexpat',
    {
        create_parser,
        ParserCreate: create_parser,
        model,
        error,
        errors,
        XML_PARAM_ENTITY_PARSING_NEVER,
        XML_PARAM_ENTITY_PARSING_UNLESS_STANDALONE,
        XML_PARAM_ENTITY_PARSING_ALWAYS
    }
)

})(__BRYTHON__)