(function($B){

var _b_ = $B.builtins

const XML_PARAM_ENTITY_PARSING_NEVER = 0,
      XML_PARAM_ENTITY_PARSING_UNLESS_STANDALONE = 1,
      XML_PARAM_ENTITY_PARSING_ALWAYS = 2

const FAIL = {}

const xml_entities = {
    '&gt;': '>',
    '&lt;': '<',
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&'
    }

var xmlparser = $B.make_class('xmlparser',
    function(encoding, namespace_separator, intern){
        return {
            __class__: xmlparser,
            encoding,
            namespace_separator,
            intern,
            buffer_text: false,
            _buffer: '',
            _state: 'data',
            _data_buffer: '',
            _initialized: false,
            _maybe_entity: null,
            _element_stack: [],
            _chunk_size: 2 << 14
        }
    }
)

xmlparser._handle_stack = function(self){
    if(! (self._element instanceof ELEMENT)){
        return
    }
    if(self._element.name === undefined){
        console.log('name undefined', self._element)
        alert()
    }
    if(self._element.is_end){
        if(self._element_stack.length == 0){
            raise_error(self, 'no opening tag for closing ' + self._element.name)
        }else{
            var expected = $B.last(self._element_stack)
            if(expected !== self._element.name){
                console.log('error handle stack, stack', self._element_stack, self._element)
                raise_error(self, `tag mismatch, ` +
                    `expected closing tag ${expected}, ` +
                    `got: ${self._element.name}`)
            }
            self._element_stack.pop()
            if(self._element_stack.length == 0){
                flush_char_data(self)
            }
        }
    }else if(! self._element.self_closing){
        self._element_stack.push(self._element.name)
    }
}

xmlparser.CharacterDataHandler = _b_.None

xmlparser.CommentHandler = _b_.None

xmlparser.EndElementHandler = _b_.None

function check_entity(parser, pos){
    var entity = parser._maybe_entity
    var decimal = /&#(\d+);$/.exec(entity)
    if(decimal){
        return _b_.chr(parseInt(decimal[1]))
    }
    var hexa = /&#x(\d+);$/.exec(entity)
    if(hexa){
        return _b_.chr(parseInt(hexa[1], 16))
    }
    var xml_entity = xml_entities[entity]
    if(xml_entity){
        return xml_entity
    }
    raise_error_known_position(parser, `unknown entity: "${entity}"`, pos)
}

function flush_char_data(parser){
    var buf = parser._data_buffer
    if(buf.length > 0){
        let handler = parser._handlers.CharacterDataHandler
        if(handler !== _b_.None){
            handler(buf)
        }
    }
    parser._data_buffer = ''
}

function flush_final_char_data(parser){
    var buf = parser._data_buffer
    for(var i = 0; i < buf.length; i++){
        if(! buf[i].match(/\s/)){
            var pos = parser._pos - buf.length + i - 1
            console.log('rest', buf)
            var msg = `junk after document element: line 1, column ${pos}`
            raise_error(parser, msg)
        }
    }
}

const encoding_re = /<\?xml .*encoding\s*=\s*"(.*?)"/

const handler_names = [
    'CharacterDataHandler',
    'CommentHandler',
    'StartElementHandler',
    'EndElementHandler'
    ]

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
    if(! self._initialized){
        if(data[0] != '<'){
            throw Error("XML or text declaration not at start of entity")
        }
        self._initialized = true
    }
    self._buffer = data
    self._buffer_length = _b_.len(data)
    self._pos = 0

    var handlers = self._handlers = {}
    for(var handler_name of handler_names){
        let handler = $B.$getattr(self, handler_name)
        if(handler !== _b_.None){
            handlers[handler_name] = $B.$call(handler)
        }else{
            handlers[handler_name] = _b_.None
        }
    }

    for(var token of xmlparser.xml_tokenizer(self)){
        if(token instanceof ELEMENT){
            if(! token.is_declaration && ! token.is_end){
                if(handlers.StartElementHandler !== _b_.None){
                    flush_char_data(self)
                    handlers.StartElementHandler(token.name, token.attrs)
                }
                if(token.self_closing &&
                            handlers.EndElementHandler !== _b_.None){
                    handlers.EndElementHandler(token.name)
                }
            }else if(token.is_end &&
                    handlers.EndElementHandler !== _b_.None){
                flush_char_data(self)
                handlers.EndElementHandler(token.name)
            }
        }else if(token instanceof DATA &&
                handlers.CharacterDataHandler !== _b_.None){
            handlers.CharacterDataHandler(token.value)
        }else if(token instanceof COMMENT &&
                handlers.CommentHandler !== _b_.None){
            flush_char_data(self)
            handlers.CommentHandler(token.value)
        }
    }
    flush_final_char_data(self)
    if(isfinal){
        self.finished = true
    }
}

xmlparser.ParseFile = function(){
    var $ = $B.args('ParseFile', 2,
                {self: null, file: null},
                ['self', 'file'], arguments,
                {}, null, null),
        self = $.self,
        file = $.file
    var reader = $B.$call($B.$getattr(file, 'read'))
    while(true){
        var data = reader(self._chunk_size)
        if(data.length == 0){
            return xmlparser.Parse(self, data, true)
        }else{
            xmlparser.Parse(self, data, false)
        }
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

xmlparser.StartElementHandler = _b_.None

xmlparser.xml_tokenizer = function*(self){
    // convert bytes to string
    self._element = new DOCUMENT(self)
    while(self._pos < self._buffer_length){
        var char = self._buffer[self._pos]
        self._element = self._element.feed(char)
        if(self._element.closed){
            yield self._element
        }
        self._pos++
    }
    console.log('fini')
}

$B.set_func_names(xmlparser, 'expat')

function raise_error_known_position(parser, message, pos){
    message += ' at position ' + pos
    var ix = pos
    while(ix >= 0 && parser._buffer[ix] !== '\n'){
        ix--
    }
    message += '\n' + parser._buffer.substring(ix, pos + 1)
    message += '\n' + ' '.repeat(pos - ix - 1) + '^'
    throw error.$factory(message)
}

function raise_error(parser, message){
    throw error.$factory(message)
}

function raise_error1(element, char){
    var head = element
    while(head.origin){
        head = head.origin
    }
    console.log(head)
    var cls = element.constructor.name,
        message = cls + ' expected ' + element.expect +
            ', got: ' + char
    var pos = head.parser._pos
    raise_error_known_position(head.parser, message, pos)
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

function expect_chars(element, char, stop){
    var res
    if(! element.hasOwnProperty('expected_chars')){
        element.expected_chars = ''
    }
    if(is_char(char)){
        element.expected_chars += char
        if(stop){
            var end_pos = element.expected_chars.length - stop.length
            var tail = element.expected_chars.substr(end_pos)
            if(tail == stop){
                res = {value: element.expected_chars.substr(0, end_pos)}
                delete element.expected_chars
                return res
            }
        }
    }else{
        res = {value: element.expected_chars}
        if(element.expected_pos == literal.length){
            delete element.expected_pos
            return {value: literal}
        }
    }
    return {value: null}
}


function expect_name(element, char){
    if(! element.hasOwnProperty('expected_name')){
        if(is_id_start(char)){
            element.expected_name = char
        }else if(! is_whitespace(char)){
            raise_error(element.parser, 'expected name start, got: ' + char)
        }
    }else if(is_id_continue(char)){
        element.expected_name += char
    }else if(is_whitespace(char)){
        var res = {value: element.expected_name}
        delete element.expected_name
        return res
    }else{
        raise_error(element.parser, 'name expected id, got: ' + char)
    }
    return {}
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

function get_parser(element){
    while(element.origin){
        element = element.origin
    }
    return element.parser
}

function get_pos(element){
    while(element.origin){
        element = element.origin
    }
    return element.parser._pos
}

/*
document  ::=  prolog element Misc*

prolog       ::=  XMLDecl? Misc* (doctypedecl Misc*)?
XMLDecl      ::=  '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
Misc         ::=  Comment | PI | S
Comment  ::=  '<!--' ((Char - '-') | ('-' (Char - '-')))* '-->'
PI        ::=  '<?' PITarget (S (Char* - (Char* '?>' Char*)))? '?>'
doctypedecl    ::=  '<!DOCTYPE' S Name (S ExternalID)? S? ('[' intSubset ']' S?)? '>'
*/
function DOCUMENT(parser){
    this.parser = parser
    this.expect = 'prolog'
    this.names = []
}

DOCUMENT.prototype.feed = function(char){
    if(this.expect == 'prolog'){
        this.expect = 'element'
        return (new prolog(this)).feed(char)
        if(char !== '<'){
            raise_error(this.parser, 'expected <')
        }
        this.expect = 'name_start_or_special'
    }else if(this.expect == 'name_start_or_special'){
        if(char == '!'){
            this.expect = 'comment_or_doctype'
        }else if(char == '?'){
            this.expect = 'xmldecl_or_pi'
        }else if(is_id_start(char)){
            this.expect = 'prolog'
            return new ELEMENT(this).feed(char)
        }else{
            raise_error1(this, char)
        }
    }else if(this.expect == 'comment_or_doctype'){
        if(char == '-'){
            this.expect = 'comment'
        }else if(char == 'D'){
            this.expect = 'DOCTYPE'
            return this.feed(char)
        }else{
            raise_error('expected comment or DOCTYPE, got: ' + char)
        }
    }else if(this.expect == 'DOCTYPE'){
        var res = expect_literal(this, 'DOCTYPE', char)
        if(res.value){
            return new DOCTYPE(this.parser, this)
        }
    }else if(this.expect == 'xmldecl_or_pi'){
        var res = expect_name(this, char)
        if(res.value){
            if(res.value == 'xml'){
                this.expect = 'prolog'
                return new XMLDECL(this.parser, this)
            }else{
                this.expect = 'prolog'
                var pi = new PI(this.parser, this)
                pi.name = res.value
                pi.expect = 'content'
                return pi
            }
        }
        return this
    }else if(this.expect == 'comment'){
        if(char == '-'){
            this.expect = 'prolog'
            return new COMMENT(this.parser, this)
        }else{
            raise_error(this.parser, 'DOCUMENT, expected -, got: ' + char)
        }
    }else{
        raise_error(this.parser, 'DOCUMENT, unhandled expect: ' + this.expect)
    }
    return this
}

/*
prolog       ::=  XMLDecl? Misc* (doctypedecl Misc*)?
*/
function prolog(origin){
    this.origin = origin
    this.expect = 'XMLDecl?'
}

prolog.prototype.feed = function(char){
    if(this.expect == 'XMLDecl?'){
        return (new XMLDecl(this)).feed(char)
    }
    return this
}

/*
XMLDecl      ::=  '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
*/
function XMLDecl(origin){
    this.origin = origin
    this.expect = '<?xml'
}

XMLDecl.prototype.feed = function(char){
    if(this.expect == '<?xml'){
        var res = expect_literal(this, '<?xml', char)
        if(res.value){
            console.log('found value', res.value)
            this.expect = 'EncodingDecl?'
            return new VersionInfo(this)
        }
    }else if(this.expect == 'EncodingDecl?'){
        return new EncodingDecl(this)
    }else{
        raise_error1(this, 'unhandled expect: ' + this.expect)
    }
    return this
}

/*
VersionInfo  ::=  S 'version' Eq ("'" VersionNum "'" | '"' VersionNum '"')
*/
function VersionInfo(origin){
    this.origin = origin
    this.expect = 'S'
}

VersionInfo.prototype.feed = function(char){
    if(this.expect == 'S'){
        this.expect = 'version'
        return (new S(this)).feed(char)
    }else if(this.expect == 'version'){
        var res = expect_literal(this, 'version', char)
        if(res.value){
            this.expect = "'"
            return new Eq(this)
        }
    }else if(this.expect == "'"){
        var parser = get_parser(this),
            save_pos = parser._pos
        var res = expect_literal(this, "'", char)
        console.log('res', res)
        if(res === FAIL){
            parser._pos = save_pos
            this.expect = '"'
            return this.feed(parser._buffer[save_pos])
        }else if(res.value){
            this.quote = res.value
            this.expect = 'VersionNum1'
        }
    }else if(this.expect == '"'){
        var res = expect_literal(this, '"', char)
        console.log('res', res)
        if(res === FAIL){
            raise_error1(this, char)
        }else if(res.value){
            this.quote = res.value
            this.expect = 'VersionNum2'
        }
    }else if(this.expect == 'VersionNum1'){
        var res = expect_chars(this, char, "'")
        if(res.value){
            console.log('VersionInfo complete')
            return this.origin
        }else if(res === FAIL){
            raise_error1(this, char)
        }
    }else if(this.expect == 'VersionNum2'){
        var res = expect_chars(this, char, '"')
        if(res.value){
            console.log('VersionInfo complete')
            return this.origin
        }else if(res === FAIL){
            raise_error1(this, char)
        }
    }else{
        raise_error1(this, 'unhandled expect: ' + this.expect)
    }
    return this
}

function S(origin){
    this.origin = origin
}

S.prototype.feed = function(char){
    if(! is_whitespace(char)){
        return this.origin.feed(char)
    }
    return this
}

/*
Eq           ::=  S? '=' S?
*/

function Eq(origin){
    this.origin = origin
    this.expect = 'S1'
}

Eq.prototype.feed = function(char){
    if(this.expect == 'S1'){
        this.expect = '='
        return (new S(this)).feed(char)
    }else if(this.expect == '='){
        var res = expect_literal(this, '=', char)
        if(res){
            this.expect = 'S2'
        }
    }else if(this.expect == 'S2'){
        this.expect = 'end'
        return (new S(this)).feed(char)
    }else if(this.expect == 'end'){
        return this.origin.feed(char)
    }
    return this
}

function Quote(origin){
    this.origin = origin
}

Quote.prototype.feed = function(char){
    if(char == '"' || char == "'"){
        this.quote = char
    }else{
        raise_error1(this, char)
    }
    return this
}
/*
doctypedecl    ::=  '<!DOCTYPE' S Name (S ExternalID)? S? ('[' intSubset ']' S?)? '>'
intSubset      ::=  (markupdecl | DeclSep)*
markupdecl     ::=  elementdecl | AttlistDecl | EntityDecl | NotationDecl
                 |  PI | Comment
DeclSep        ::=  PEReference | S
*/

function DOCTYPE(parser, origin){
    this.parser = parser
    this.origin = origin
    this.expect = 'element_start'
}

DOCTYPE.prototype.feed = function(char){
    console.log('DOCTYPE feed', this.expect, 'char', char)
    if(this.expect == 'element_start'){
        var res = expect_name(this, char)
        if(res.value){
            this.name = res.value
            this.expect = 'external_id_or_[_or_>'
        }
    }else if(this.expect == 'external_id_or_[_or_>'){
        if(char == '['){
            this.expect = '>'
            return new intSubset(this)
        }else if(char == '>'){
            this.expect == 'no_whitespace'
        }else if(char == 'S' || char == 'P'){
            this.expect = '[_or_>'
            var res = new ExternalID(this)
            return res.feed(char)
        }else{
            raise_error(this.parser, 'DOCTYPE expected SYSTEM, PUBLIC, [ or >, got: ' + char)
        }
    }else if(this.expect == '[_or_>'){
        if(char == '['){
            this.expect = '>'
            return new intSubset(this)
        }else if(char == '>'){
            this.expect = 'no_whitespace'
        }else if(! is_whitespace(char)){
            raise_error(this.parser, 'DOCTYPE expected [ or >, got: ' + char)
        }
    }else if(this.expect == '>'){
        if(! is_whitespace(char)){
            if(char == '>'){
                this.expect = 'no_whitespace'
            }else{
                raise_error(this.parser, 'DOCTYPE expected >, got: ' + char)
            }
        }
    }else if(this.expect = 'no_whitespace'){
        if(! is_whitespace(char)){
            return this.origin.feed(char)
        }
    }
    return this
}

/*
XMLDecl      ::=  '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
VersionInfo  ::=  S 'version' Eq ("'" VersionNum "'" | '"' VersionNum '"')
Eq           ::=  S? '=' S?
VersionNum   ::=  '1.0'
EncodingDecl  ::=  S 'encoding' Eq ('"' EncName '"' | "'" EncName "'" )
EncName       ::=  [A-Za-z] ([A-Za-z0-9._] | '-')*
SDDecl  ::=  S 'standalone' Eq
             (("'" ('yes' | 'no') "'") | ('"' ('yes' | 'no') '"'))
*/
function XMLDECL(parser, origin){
    this.parser = parser
    this.expect = 'version_info'
    this.origin = origin
}

XMLDECL.prototype.feed = function(char){
    switch(this.expect){
        case 'version_info':
            var res = expect_literal(this, 'version', char)
            if(res.value){
                this.expect = 'eq'
                this.attr_name = 'version'
            }
            break
        case 'eq':
            if(char == '='){
                this.expect = 'quote'
            }else if(! is_whitespace(char)){
                raise_error(this.parser, 'expect =, got: ' + char)
            }
            break
        case 'quote':
            if(is_quote(char)){
                this.expect = char
                this.quoted = ''
            }else if(! is_whitespace(char)){
                raise_error(this.parser, 'expected quote, got: ' + char)
            }
            break
        case '"':
        case "'":
            var res = expect_literal(this, this.expect, char)
            if(res.value){
                this[this.attr_name] = this.quoted
                this.expect = 'encoding_or_sd_or_close'
            }else{
                this.quoted += char
            }
            break
        case 'encoding_or_sd_or_close':
            switch(char){
                case 'e':
                    if(! this.hasOwnProperty('encoding')){
                        this.expect = 'encoding'
                        return this.feed(char)
                    }
                    break
                case 's':
                    if(! this.hasOwnProperty('standalone')){
                        this.expect = 'standalone'
                        return this.feed(char)
                    }
                    break
                case '?':
                    this.expect = '>'
                    break
                default:
                    if(! is_whitespace(char)){
                        raise_error(this.parser,
                            'expected encoding, standalone or ?, got: ' + char)
                    }
            }
            break
        case 'encoding':
        case 'standalone':
            var res = expect_literal(this, this.expect, char)
            if(res.value){
                this.attr_name = this.expect
                this.expect = 'eq'
            }
            break
        case '>':
            if(char == '>'){
                this.closed = true
            }else if(! is_whitespace(char)){
                if(this.closed){
                    return this.origin.feed(char)
                }
                raise_error(this.parser, 'expected >, got: ' + char)
            }
            break
        default:
            raise_error(this.parser, 'unhandled case: ' + this.expect)
    }
    return this
}

/*
PI        ::=  '<?' PITarget (S (Char* - (Char* '?>' Char*)))? '?>'
PITarget  ::=  Name - (('X' | 'x') ('M' | 'm') ('L' | 'l'))
*/
function PI(parser, origin){
    this.parser = parser
    this.origin = origin
    this.expect = 'pi_target'
}

PI.prototype.feed = function(char){
    if(this.expect == 'pi_target'){
        var res = expect_name(this, char)
        if(res.value){
            this.pi_target = res.value
            this.expect = 'content'
        }
    }else if(this.expect == 'content'){
        var res = expect_chars(this, char, '?>')
        if(res.value){
            this.content = res.value
            this.closed = true
            this.expect = 'no_whitespace'
        }
    }else if(this.expect == 'no_whitespace'){
        if(! is_whitespace(char)){
            return this.origin.feed(char)
        }
    }
    return this
}

function CDATA(){
    this.content = ''
    this.expect = ']'
    this.level = 1
}

CDATA.prototype.feed = function(char){
    switch(this.expect){
        case ']':
            if(char == '>'){
                throw Error('closed without closing ]')
            }else if(char == '['){
                this.level++
            }else if(char == ']'){
                if(this.level == 1){
                    this.expect = '>'
                }else{
                    this.level--
                }
            }else{
                this.content += char
            }
            break
        case '>':
            if(char != '>'){
                console.log('-- error', this, 'char', char)
                throw Error('expected ">", got: ' + char)
            }
            this.closed = true
            break
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
        }else if(char == '['){
            return new CDATA()
        }else{
            throw Error('expected name, got ' + char)
        }
    }else if(this.expect == 'name_continue'){
        if(is_id_continue(char)){
            this.name += char
        }else{
            console.log('DD, name', this.name)
            if(this.name == 'DOCTYPE'){
                return new DOCTYPE(this.parser)
            }else if(this.name == 'ENTITY'){
                return new ENTITY(this.parser)
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

function COMMENT(parser, origin){
    this.parser = parser
    this.origin = origin
    this.value = ''
    this.expect = '-->'
}

COMMENT.prototype.feed = function(char){
    if(this.expect == '-->'){
        var res = expect_chars(this, char, '-->')
        if(res.value){
            this.content = res.value
            this.expect = 'no_whitespace'
        }
    }else if(this.expect == 'no_whitespace'){
        if(! is_whitespace(char)){
            return this.origin.feed(char)
        }
    }
    return this
}

/*
element       ::=  EmptyElemTag  | STag content ETag
STag          ::=  '<' Name (S Attribute)* S? '>'
Attribute     ::=  Name Eq AttValue
ETag          ::=  '</' Name S? '>'
content       ::=  CharData?
                   ((element | Reference | CDSect | PI | Comment) CharData?)*
EmptyElemTag  ::=  '<' Name (S Attribute)* S? '/>'
*/

function ELEMENT(origin) {
    this.origin = origin
    this.expect = '?_/_or_name_start'
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

ELEMENT.prototype.feed = function(char){
    console.log('ELEMENT feed, expects', this.expect, 'char', char)
    if(this.expect == 'name_start'){
        if(char == '?'){
            if(this.is_declaration){
                throw Error('already got ?')
            }
            this.is_declaration = true
        }else if(char == '/'){
            if(this.is_end){
                throw Error('already got /')
            }
            this.is_end = true
        }else if(is_id_start(char)){
            this.name = char
            this.expect = 'name_continue'
        }
    }else if(this.expect == 'name_continue'){
        if(is_id_continue(char)){
            this.name += char
        }else{
            // end of element name
            if(this.is_declaration){
                if(this.name == 'xml'){
                    this.is_xml_header = true
                }else{
                    return new PROCESSING_INSTRUCTION(this.parser, this.name)
                }
            }
            if(is_whitespace(char)){
                this.expect = 'attr_name_start'
            }else if(char == '>'){
                this.closed = true
            }else if(char == '/'){
                this.self_closing = true
                this.expect = '>'
            }else{
                throw Error('unexpected at end of element name: ' + char)
            }
        }
    }else if(this.expect == 'attr_name_start'){
        if(char == '/'){
            this.self_closing = true
        }else if(char == '>'){
            this.expect = 'no_whitespace'
        }else if(is_id_start(char)){
            this.attr_name = char
            this.expect = 'attr_name_continue'
        }else if(char == '?' && this.is_declaration){
            this.expect = '>'
        }else if(! is_whitespace(char)){
            throw Error('expected attribute name, got: ' + char)
        }
    }else if(this.expect == 'attr_name_continue'){
        if(is_id_continue(char)){
            this.attr_name += char
        }else if(char == '='){
            this.add_attribute_name(this.attr_name)
            this.expect = 'attr_value_start'
            this.attr_value = ''
        }else if(is_whitespace(char)){
            this.add_attribute_name(this.attr_name)
            this.expect = '='
        }else if(char == '>'){
            this.add_attribute_name(this.attr_name)
            this.closed = true
        }else{
            throw Error('unexpected character in attribute name: ' + char)
        }
    }else if(this.expect == '='){
        if(char == '='){
            this.expect = 'attr_value_start'
        }else if(! is_whitespace(char)){
            raise_error1(this, char)
        }
    }else if(this.expect == 'attr_value'){
        if(char == '='){
            this.expect = 'attr_value_start'
            this.attr_value = ''
        }else if(char == '>'){
            this.closed = true
        }else if(is_id_start(char)){
            this.attr_name = char
            this.expect = 'attr_name_continue'
        }else if(! is_whitespace(char)){
            throw Error('expected attribute value or name, got: ' + char)
        }
    }else if(this.expect == 'attr_value_start'){
        if(char == '"' || char == "'"){
            this.expect = 'quote'
            this.quote = char
            this.attr_value = ''
        }else if(! is_whitespace(char)){
            throw Error('unexpect attribute value start: ' + char)
        }
    }else if(this.expect == "quote"){
        if(char == this.quote){
            this.set_attribute_value(this.attr_value)
            this.expect = 'attr_name_start'
        }else{
            this.attr_value += char
        }
    }else if(this.expect == '>'){
        if(char == '>'){
            this.closed = true
        }else{
            throw Error('expected >, got: ' + char)
        }
    }else if(this.expect == 'attr_name'){
        if(char instanceof Name){
            if(_b_.dict.__contains__(this.attrs, char.value)){
                throw Error('duplicate value ' + char.value)
            }
            _b_.dict.$setitem(this.attrs, char.value, _b_.None)
            this.last_attr = char.value
        }else if(char.value == '?' && this.is_declaration){
            if(this.question_mark){
                throw Error('already ?')
            }
            this.question_mark = true
        }else if(char == END){
            if(this.is_declaration && ! this.question_mark){
                throw Error('missing ')
            }
        }else if(char instanceof Punctuation && char.value == '/'){
            this.no_end = true
            this.expect = END
        }else{
            throw Error('expected attribute name, got ' + char)
        }
    }else if(this.expect == 'attr_value'){
        _b_.dict.$setitem(this.attrs, this.last_attr, char)
        this.expect = 'attr_name'
    }else if(this.expect == END){
        // after "/"
        if(char != END){
            throw Error('nothing after /')
        }
    }else if(this.expect == 'no_whitespace'){
        if(! is_whitespace(char)){
            return this.origin.feed(char)
        }
    }else{
        raise_error1(this, char)
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

/*
EntityDecl        ::=  GEDecl | PEDecl
PEDecl            ::=  '<!ENTITY' S '%' S Name S PEDef S? '>'
PEDef             ::=  EntityValue | ExternalID
*/
function ENTITY(parser){
    this.parser = parser
}

ENTITY.prototype.feed = function(char){
    if(! is_whitespace(char)){
        if(is_id_start(char)){
            return new GEDecl(this.parser, char)
        }else if(char == "%"){
            return new PEDecl(this.parser)
        }
        throw Error('unexpected after ENTITY: ' + char)
    }
}

/*
GEDecl            ::=  '<!ENTITY' S Name S EntityDef S? '>'
EntityDef         ::=  EntityValue | (ExternalID NDataDecl?)
ExternalID        ::=  'SYSTEM' S SystemLiteral
                    |  'PUBLIC' S PubidLiteral S SystemLiteral
NDataDecl         ::=  S 'NDATA' S Name
EntityValue    ::=  '"' ([^%&"] | PEReference | Reference)* '"'
                 |  "'" ([^%&'] | PEReference | Reference)* "'"

*/
function GEDecl(parser, char){
    this.parser = parser
    this.expect = 'name_continue'
    this.name = char
    this.state = 'name'
}

GEDecl.prototype.feed = function(char){
    switch(this.expect){
        case 'name_start':
            if(is_id_start(char)){
                if(this.state == 'NDATA'){
                    this.ndata_name = char
                }
                this.expect = 'name_continue'
            }else if(! is_whitespace(char)){
                throw Error('GEDecl expected name start, got: ' + char)
            }
            break
        case 'name_continue':
            if(is_id_continue(char)){
                if(this.state == 'name'){
                    this.name += char
                }else if(this.state == 'NDATA'){
                    this.ndata_name += char
                }
            }else if(is_whitespace(char)){
                if(this.state == 'NDATA'){
                    this.expect = '>'
                }else{
                    this.expect = 'entity_def'
                }
            }else if(char == '>' && this.state == 'NDATA'){
                this.closed = true
            }else{
                throw Error('GEDecl expected name, got: ' + char)
            }
            break
        case 'entity_def':
            if(is_quote(char)){
                this.quoted = ''
                this.state = this.expect
                this.expect = char
            }else if(char == 'S' || char == 'P'){
                this.expect = char == 'S' ? 'SYSTEM' : 'PUBLIC'
                this.expect_pos = 1
                this.external_id = this.expect
            }else if(! is_whitespace(char)){
                throw Error('GEDCL expect quote, SYSTEM or PUBLIC, got: ' + char)
            }
            break
        case 'SYSTEM':
        case 'PUBLIC':
            if(char == this.expect[this.expect_pos]){
                this.expect_pos++
                if(this.expect_pos == this.expect.length){
                    this.expect = this.expect == 'SYSTEM' ? 'system_literal' :
                                                            'pubid_literal'
                }
            }else{
                throw Error(`GEDecl expected ${this.expect}, got: ${char}`)
            }
            break
        case 'NDATA':
            if(char == this.expect[this.expect_pos]){
                this.expect_pos++
                if(this.expect_pos == this.expect.length){
                    this.expect = 'name_start'
                    this.ndata_name = ''
                    this.state = 'NDATA'
                }
            }else{
                throw Error(`GEDecl expected ${this.expect}, got: ${char}`)
            }
            break
        case '"':
        case "'":
            if(this.state == 'entity_def'){
                if(char == this.expect){
                    this.entity_def = this.quoted
                    this.expect = '>'
                }else{
                    this.quoted += char
                }
            }else if(this.state == 'system_literal'){
                if(char == this.expect){
                    this.system_literal = this.quoted
                    this.expect = 'n_data_decl_or_close'
                }else{
                    this.quoted += char
                }
            }
            break
        case 'system_literal':
            if(is_quote(char)){
                this.expect = char
                this.state = 'system_literal'
                this.quoted = ''
            }else if(! is_whitespace(char)){
                throw Error('GEDecl expected SystemLiteral, got: ' + char)
            }
            break
        case '>':
            if(! is_whitespace(char)){
                if(char == '>'){
                    this.closed = true
                }else{
                    throw Error('GEDecl expected >, got: ' + char)
                }
            }
            break
        case 'n_data_decl_or_close':
            if(char == '>'){
                this.closed = true
            }else if(char == 'N'){
                this.expect = 'NDATA'
                this.expect_pos = 1
            }else if(! is_whitespace(char)){
                throw Error('GEDecl expected NDATA or >, got: ' + char)
            }
            break
        default:
            console.log(this.parser._buffer.substr(0, this.parser._pos))
            throw Error('pas fini...')
    }
    return this
}

/*
ExternalID        ::=  'SYSTEM' S SystemLiteral
                    |  'PUBLIC' S PubidLiteral S SystemLiteral
*/
function ExternalID(origin){
    this.origin = origin
    this.expect = 'first'
}

ExternalID.prototype.feed = function(char){
    if(this.expect == 'first'){
        if(! is_whitespace(char)){
            if(char == 'S'){
                this.expect = 'SYSTEM'
                return this.feed(char)
            }else if(char == 'P'){
                this.expect = 'PUBLIC'
                return this.feed(char)
            }else{
                raise_error(this, 'ExternalID expected SYSTME or PUBLIC, got: ' + char)
            }
        }
    }else if(this.expect == 'SYSTEM' || this.expect == 'PUBLIC'){
        var res = expect_literal(this, this.expect, char)
        if(res.value){
            this.type = this.expect
            if(this.type == 'SYSTEM'){
                this.expect = '[_or_>'
                return new SystemLiteral(this)
            }else{
                this.expect = 'system_after_pubid'
                return new PubidLiteral(this)
            }
        }
    }else if(this.expect == 'system_after_pubid'){
        if(! is_whitespace(char)){
            this.expect = '[_or_>'
            return (new SystemLiteral(this)).feed(char)
        }
    }else if(this.expect == '[_or_>'){
        if(char == '['){
            this.expect = '>'
            return new intSubset(this)
        }else if(char == '>'){
            return this.origin.feed(char)
        }else{
            raise_error1(this, char)
        }
    }else if(this.expect == '>'){
        if(char == '>'){
            this.expect = 'no_whitespace'
        }else if(! is_whitespace(char)){
            raise_error1(this, char)
        }
    }else if(this.expect == 'no_whitespace'){
        if(! is_whitespace(char)){
            console.log('return to origin', this.origin, 'char', char)
            return this.origin.feed(char)
        }
    }
    return this
}

/*
PubidLiteral   ::=  '"' PubidChar* '"' | "'" (PubidChar - "'")* "'"
PubidChar      ::=  #x20 | #xD | #xA | [a-zA-Z0-9]
                 |  [-'()+,./:=?;!*#@$_%]
*/
function PubidLiteral(origin){
    this.origin = origin
    this.expect = 'quote'
}


function is_pubid_char(char){
    /*
#x20 | #xD | #xA | [a-zA-Z0-9]
                 |  [-'()+,./:=?;!*#@$_%]
*/
    return char.match(new RegExp("[a-zA-Z0-9-'()+,./:=?;!*#@$_%]")) ||
        ' \n\r'.includes(char)
}

PubidLiteral.prototype.feed = function(char){
    if(this.expect == 'quote'){
        if(is_quote(char)){
            this.expect = char
            this.content = ''
        }else if(! is_whitespace(char)){
            raise_error1(this, char)
        }
    }else if(this.expect == 'no_whitespace'){
        if(! is_whitespace(char)){
            return this.origin.feed(char)
        }
    }else{
        if(char == this.expect){
            this.expect = 'no_whitespace'
        }else if(is_pubid_char(char)){
            this.content += char
        }else{
            console.log('PubidLiteral expects', this.expect, 'char', char)
            console.log(is_pubid_char(char))
            raise_error1(this, char)
        }
    }
    return this
}

function SystemLiteral(origin){
    this.origin = origin
    this.expect = 'quote'
}

SystemLiteral.prototype.feed = function(char){
    console.log('SystemLiteral expects', this.expect, 'char', char)
    if(this.expect == 'quote'){
        if(is_quote(char)){
            this.expect = char
            this.content = ''
        }else if(! is_whitespace(char)){
            raise_error1(this, char)
        }
    }else if(this.expect == 'no_whitespace'){
        if(! is_whitespace(char)){
            return this.origin.feed(char)
        }
    }else{
        if(char == this.expect){
            this.expect = 'no_whitespace'
        }else{
            this.content += char
        }
    }
    return this
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

function is_quote(char){
    return char == '"' || char == "'"
}

function is_char(char){
    // #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
    var cp = char.codePointAt(0)
    return ([0x9, 0xa, 0xd].includes(cp)) ||
            (0x20 <= cp && cp <= 0xd7ff) ||
            (0xe000 <= cp && cp <= 0xfffd) ||
            (0x10000 <= cp && cp <= 0x10ffff)
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