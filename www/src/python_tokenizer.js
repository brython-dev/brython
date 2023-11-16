"use strict";
(function($B){

var _b_ = $B.builtins

$B.is_identifier = function(category, cp){
    // category is "XID_Start" or "XID_Continue"
    var table = $B.unicode_identifiers[category],
        start = 0,
        end = table.length - 1,
        len = table.length,
        ix = Math.floor(len / 2),
        nb = 0
    var first = table[start],
        item = typeof first == 'number' ? first : first[0]
    if(cp < item){
        return false
    }
    var last = table[end]
    if(typeof last == 'number'){
        if(cp > last){
            return false
        }
    }else if(last[0] + last[1] < cp){
        return false
    }

    while(true){
        nb++
        if(nb > 100){
            console.log('infinite loop for', cp)
            alert()
        }
        var item = table[ix]
        if(typeof item != 'number'){
            item = item[0]
        }
        if(item == cp){
            return true
        }else if(item > cp){
            end = ix
        }else{
            start = ix
        }
        len = Math.floor((end - start) / 2)
        if(end - start == 1){
            break
        }
        ix = start + len
    }
    return table[start][0] + table[start][1] > cp
}

const XID_Start_re = /\p{XID_Start}/u

const Other_ID_Start = [0x1885, 0x1886, 0x2118, 0x212E, 0x309B, 0x309C].map(
                           x => String.fromCodePoint(x))

function is_ID_Start(char){
    return /\p{Letter}/u.test(char) ||
           /\p{Nl}/u.test(char) ||
           char == '_' ||
           Other_ID_Start.indexOf(char) > -1

}

const Other_ID_Continue = [0x00B7, 0x0387, 0x1369, 0x1370, 0x1371, 0x19DA,
                           0x200C, 0x200D, 0x30FB, 0xFF65].
                           map(x => String.fromCodePoint(x))

function is_ID_Continue(char){
    return is_ID_Start(char) ||
           /\p{Mn}|\p{Mc}|\p{Nd}|\p{Pc}/u.test(char) ||
           Other_ID_Continue.indexOf(char) > -1
}

$B.is_XID_Start = function(cp){
    var char = String.fromCodePoint(cp)
    if(! is_ID_Start(char)){
        return false
    }
    var norm = char.normalize('NFKC')
    if(! is_ID_Start(norm[0])){
        return false
    }
    for(var char of norm.substr(1)){
        if(! is_ID_Continue(char)){
            return false
        }
    }
    return true
}

$B.is_XID_Continue = function(cp){
    var char = String.fromCodePoint(cp)
    if(! is_ID_Continue(char)){
        return false
    }
    var norm = char.normalize('NFKC')
    for(var char of norm.substr(1)){
        if(! is_ID_Continue(char)){
            return false
        }
    }
    return true
}

$B.in_unicode_category = function(category, cp){
    if(isNaN(cp)){
        return false
    }
    try{
        var re = new RegExp('\\p{' + category + '}', 'u')
        return re.test(String.fromCodePoint(cp))
    }catch(err){
        // invalid category
        return in_unicode_category(category, cp)
    }
}

function in_unicode_category(category, cp){
    // categories used internally but not valid as General Category
    // eg 'numeric' in str.isnumeric
    var table = $B.unicode[category],
        start = 0,
        end = table.length - 1,
        len = table.length,
        ix = Math.floor(len / 2),
        nb = 0
    var first = table[start],
        item = typeof first == 'number' ? first : first[0]
    if(cp < item){
        return false
    }
    var last = table[end]
    if(typeof last == 'number'){
        if(cp > last){
            return false
        }
    }else if(last[0] + last[1] < cp){
        return false
    }

    while(true){
        nb++
        if(nb > 100){
            console.log('infinite loop for', cp)
            alert()
        }
        var item = table[ix]
        if(typeof item != 'number'){
            item = item[0]
        }
        if(item == cp){
            return true
        }else if(item > cp){
            end = ix
        }else{
            start = ix
        }
        len = Math.floor((end - start) / 2)
        if(end - start == 1){
            break
        }
        ix = start + len
    }
    var step = table[start][2]
    if(step === undefined){
        return table[start][0] + table[start][1] > cp
    }
    return (table[start][0] + step * table[start][1] > cp) &&
        ((cp - table[start][0]) % step) == 0
}

const FSTRING_START = 'FSTRING_START',
      FSTRING_MIDDLE = 'FSTRING_MIDDLE',
      FSTRING_END = 'FSTRING_END'

function ord(char){
    if(char.length == 1){
        return char.charCodeAt(0)
    }
    var code = 0x10000
    code += (char.charCodeAt(0) & 0x03FF) << 10
    code += (char.charCodeAt(1) & 0x03FF)
    return code
}

function $last(array){
  return array[array.length - 1]
}

var ops = '.,:;+-*/%~^|&=<>[](){}@', // ! is valid in f-strings
    op2 = ['**', '//', '>>', '<<'],
    augm_op = '+-*/%^|&=<>@',
    closing = {'}': '{', ']': '[', ')': '('}

function Token(type, string, start, end, line){
    start = start.slice(0, 2)
    var res = {type, string, start, end, line}
    res[0] = type
    res[1] = string
    res[2] = start
    res[3] = end
    res[4] = line
    return res
}

var errors = {}

function TokenError(message, position){
    if(errors.TokenError === undefined){
        var $error_2 = {
            $name: "TokenError",
            $qualname: "TokenError",
            $is_class: true,
            __module__: "tokenize"
        }

        var error = errors.TokenError = $B.$class_constructor("TokenError",
            $error_2, _b_.tuple.$factory([_b_.Exception]),["_b_.Exception"],[])
        error.__doc__ = _b_.None
        error.$factory = function(message, position){
            return {
                __class__: error,
                msg: message,
                lineno: position[0],
                colno: position[1]
            }
        }
        error.__str__ = function(self){
            var s = self.msg
            if(self.lineno > 1){
                s += ` (${self.lineno}, ${self.colno})`
            }
            return s
        }
        $B.set_func_names(error, "tokenize")
    }
    var exc = errors.TokenError.$factory(message, position)
    console.log('error', exc.__class__, exc.args)
    return exc
}

function _get_line_at(src, pos){
    // Get the line in source code src starting at position pos
    var end = src.substr(pos).search(/[\r\n]/),
        line = end == -1 ? src.substr(pos) : src.substr(pos, end + 1)
    return line
}

function get_comment(src, pos, line_num, line_start, token_name, line){
    var start = pos,
        ix
    var t = []
    while(true){
        if(pos >= src.length || (ix = '\r\n'.indexOf(src[pos])) > -1){
            t.push(Token('COMMENT', src.substring(start - 1, pos),
                 [line_num, start - line_start],
                 [line_num, pos - line_start + 1],
                 line))
            if(ix !== undefined){
                var nb = 1
                if(src[pos] == '\r' && src[pos + 1] == '\n'){
                    nb++
                }else if(src[pos] === undefined){
                    // The comment ends the script without a NEWLINE
                    nb = 0
                }
                t.push(Token(token_name, src.substr(pos, nb),
                    [line_num, pos - line_start + 1],
                    [line_num, pos - line_start + nb + 1],
                    line))
                if(src[pos] === undefined){
                    t.push(Token('NEWLINE', '\n',
                        [line_num, pos - line_start + 1],
                        [line_num, pos - line_start + 2],
                        ''))
                }
                pos += nb
            }
            return {t, pos}
        }
        pos++
    }
}

function test_num(num_type, char){
    switch(num_type){
        case '':
            return $B.in_unicode_category('Nd', ord(char))
        case 'x':
            return '0123456789abcdef'.indexOf(char.toLowerCase()) > -1
        case 'b':
            return '01'.indexOf(char) > -1
        case 'o':
            return '01234567'.indexOf(char) > -1
        default:
            throw Error('unknown num type ' + num_type)
    }
}

$B.TokenReader = function(src, filename){
    this.tokens = []
    this.tokenizer = $B.tokenizer(src, filename)
    this.position = 0
}

$B.TokenReader.prototype.read = function(){
    if(this.position < this.tokens.length){
        var res = this.tokens[this.position]
    }else{
        var res = this.tokenizer.next()
        if(res.done){
            this.done = true
            return
        }
        res = res.value
        this.tokens.push(res)
    }
    this.position++
    return res
}

$B.TokenReader.prototype.seek = function(position){
    this.position = position
}

function nesting_level(token_modes){
    var ix = token_modes.length - 1
    while(ix >= 0){
        var mode = token_modes[ix]
        if(mode.nesting !== undefined){
            return mode.nesting
        }
        ix--
    }
}

function update_braces(braces, char){
    if('[({'.indexOf(char) > -1){
        braces.push(char)
    }else if('])}'.indexOf(char) > -1){
        if(braces.length && $last(braces) == closing[char]){
            braces.pop()
        }else{
            braces.push(char)
        }
    }
}

$B.tokenizer = function*(src, filename, mode){
    var whitespace = ' \t\n',
        operators = '*+-/%&^~=<>',
        allowed_after_identifier = ',.()[]:;',
        string_prefix = /^(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)$/,
        bytes_prefix = /^(b|B|br|Br|bR|BR|rb|rB|Rb|RB)$/

    src = src.replace(/\r\n/g, '\n').
              replace(/\r/g, '\n')
    if(mode != 'eval' && ! src.endsWith('\n')){
        src += '\n'
    }
    var lines = src.split('\n'),
        linenum = 0,
        line_at = {}

    for(var i = 0, len = src.length; i < len; i++){
        line_at[i] = linenum
        if(src[i] == '\n'){
            linenum++
        }
    }

    function get_line_at(pos){
        return lines[line_at[pos]] + '\n'
    }

    var state = "line_start",
        char,
        cp,
        mo,
        pos = 0,
        start,
        quote,
        triple_quote,
        escaped = false,
        string_start,
        string,
        prefix,
        name,
        operator,
        number,
        num_type,
        comment,
        indent,
        indents = [],
        braces = [],
        line,
        line_num = 0,
        line_start = 1,
        token_modes = ['regular'],
        token_mode = 'regular',
        save_mode = token_mode,
        fstring_buffer,
        fstring_start,
        fstring_escape,
        format_specifier,
        nesting,
        line

    yield Token('ENCODING', 'utf-8', [0, 0], [0, 0], '')

    while(pos < src.length){

        char = src[pos]
        cp = src.charCodeAt(pos)
        if(cp >= 0xD800 && cp <= 0xDBFF){
            // code point encoded by a surrogate pair
            cp = ord(src.substr(pos, 2))
            char = src.substr(pos, 2)
            pos++
        }
        pos++

        // console.log('token mode', token_mode, 'char', char)
        if(token_mode != save_mode){
            if(token_mode == 'fstring'){
                fstring_buffer = ''
                fstring_escape = false
            }else if(token_mode == 'format_specifier'){
                format_specifier = ''
            }
        }
        save_mode = token_mode

        if(token_mode == 'fstring'){
            if(char == token_mode.quote){
                if(fstring_escape){
                    fstring_buffer += '\\' + char
                    fstring_escape = false
                    continue
                }
                if(token_mode.triple_quote){
                    if(src.substr(pos, 2) != token_mode.quote.repeat(2)){
                        fstring_buffer += char
                        continue
                    }
                    char = token_mode.quote.repeat(3)
                    pos += 2
                }
                if(fstring_buffer.length > 0){
                    // emit FSTRING_MIDDLE token
                    yield Token(FSTRING_MIDDLE, fstring_buffer,
                        [line_num, fstring_start],
                        [line_num, fstring_start + fstring_buffer.length],
                        line)
                }
                yield Token(FSTRING_END, char,
                    [line_num, fstring_start + fstring_buffer.length],
                    [line_num, fstring_start + fstring_buffer.length + token_mode.quote.length],
                    line)
                // pop from token modes
                token_modes.pop()
                token_mode = $B.last(token_modes)
                state = null
                continue
            }else if(char == '{'){
                if(src.charAt(pos) == '{'){
                    // consecutive opening brackets = the "{" character
                    fstring_buffer += char
                    pos++
                    continue
                }else{
                    // emit FSTRING_MIDDLE
                    yield Token(FSTRING_MIDDLE, fstring_buffer,
                        [line_num, fstring_start],
                        [line_num, fstring_start + fstring_buffer.length],
                        line)
                    token_mode = 'regular_within_fstring'
                    state = null
                    token_modes.push(token_mode)
                }
            }else if(char == '}'){
                if(src.charAt(pos) == '}'){
                    // consecutive closing brackets = the "}" character
                    fstring_buffer += char
                    pos++
                    continue
                }else{
                    // emit closing bracket token
                    yield Token('OP', char,
                        [line_num, pos - line_start],
                        [line_num, pos - line_start + 1],
                        line)
                    console.log('emit closing bracket')
                    alert()
                    continue
                }
            }else if(char == '\\'){
                if(token_mode.raw){
                    fstring_buffer += char + char
                }else{
                    if(fstring_escape){
                        fstring_buffer += char
                    }
                    fstring_escape = ! fstring_escape
                }
                continue
            }else{
                if(fstring_escape){
                    fstring_buffer += '\\'
                }
                fstring_buffer += char
                fstring_escape = false
                continue
            }
        }else if(token_mode == 'format_specifier'){
            if(char == quote){
                if(format_specifier.length > 0){
                    // emit FSTRING_MIDDLE token
                    yield Token(FSTRING_MIDDLE, format_specifier,
                        [line_num, fstring_start],
                        [line_num, fstring_start + format_specifier.length],
                        line)
                    // pop from token modes
                    token_modes.pop()
                    token_mode = $B.last(token_modes)
                    continue
                }
            }else if(char == '{'){
                // emit FSTRING_MIDDLE
                yield Token(FSTRING_MIDDLE, format_specifier,
                    [line_num, fstring_start],
                    [line_num, fstring_start + format_specifier.length],
                    line)
                token_mode = 'regular_within_fstring'
                state = null
                token_modes.push(token_mode)
            }else if(char == '}'){
                // emit FSTRING_MIDDLE
                yield Token(FSTRING_MIDDLE, format_specifier,
                    [line_num, fstring_start],
                    [line_num, fstring_start + format_specifier.length],
                    line)
                // emit closing bracket token
                yield Token('OP', char,
                    [line_num, pos - line_start],
                    [line_num, pos - line_start + 1],
                    line)
                if(braces.length == 0 || $B.last(braces) !== '{'){
                    throw Error('wrong braces')
                }
                braces.pop()
                // pop from token modes
                token_modes.pop()
                token_mode = $B.last(token_modes)
                continue
            }else{
                format_specifier += char
                continue
            }
        }
	    
        switch(state){
	    
            case "line_start":
                line = get_line_at(pos - 1)
                line_start = pos
                line_num++
                if(mo = /^\f?(\r\n|\r|\n)/.exec(src.substr(pos - 1))){
                    // line break
                    yield Token('NL', mo[0], [line_num, 0],
                        [line_num, mo[0].length],
                        line)
                    pos += mo[0].length - 1
                    continue
                }else if(char == '#'){
                    comment = get_comment(src, pos, line_num, line_start,
                        'NL', line)
                    for(var item of comment.t){
                        yield item
                    }
                    pos = comment.pos
                    state = 'line_start'
                    continue
                }
                // count number of leading whitespaces in line
                indent = 0
                if(char == ' '){
                    indent = 1
                }else if(char == '\t'){
                    indent = 8
                }
                if(indent){
                    while(pos < src.length){
                        if(src[pos] == ' '){
                            indent++
                        }else if(src[pos] == '\t'){
                            indent += 8
                        }else{
                            break
                        }
                        pos++
                    }
                    if(pos == src.length){
                        // reach eof while counting indent
                        line_num--
                        break
                    }
                    if(src[pos] == '#'){
                        // ignore leading whitespace if line is a comment
                        var comment = get_comment(src, pos + 1, line_num,
                            line_start, 'NL', line)
                        for(var item of comment.t){
                            yield item
                        }
                        pos = comment.pos
                        continue
                    }else if(mo = /^\f?(\r\n|\r|\n)/.exec(src.substr(pos))){
                        // whitespace-only line
                        yield Token('NL', '', [line_num, pos - line_start + 1],
                          [line_num, pos - line_start + 1 + mo[0].length], line)
                        pos += mo[0].length
                        continue
                    }
                    if(indents.length == 0 || indent > $last(indents)){
                        indents.push(indent)
                        yield Token('INDENT', '', [line_num, 0],
                            [line_num, indent], line)
                    }else if(indent < $last(indents)){
                        var ix = indents.indexOf(indent)
                        if(ix == -1){
                            var error = Error('unindent does not match ' +
                                'any outer indentation level')
                            error.type = 'IndentationError'
                            error.line_num = line_num
                            throw error                      }
                        for(var i = indents.length - 1; i > ix; i--){
                            indents.pop()
                            yield Token('DEDENT', '', [line_num, indent],
                                [line_num, indent], line)
                        }
                    }
                    state = null
                }else{
                    // dedent all
                    while(indents.length > 0){
                        indents.pop()
                        yield Token('DEDENT', '', [line_num, indent],
                          [line_num, indent], line)
                    }
                    state = null
                    pos--
                }
                break

            case null:
                switch(char){
                    case '"':
                    case "'":
                        quote = char
                        triple_quote = src[pos] == char && src[pos + 1] == char
                        string_start = [line_num, pos - line_start, line_start]
                        if(triple_quote){
                            pos += 2
                        }
                        escaped = false
                        state = 'STRING'
                        string = ""
                        prefix = ""
                        break
                    case '#':
                        var token_name = braces.length > 0 ? 'NL' : 'NEWLINE'
                        comment = get_comment(src, pos, line_num, line_start,
                            token_name, line)
                        for(var item of comment.t){
                            yield item
                        }
                        pos = comment.pos
                        if(braces.length == 0){
                            state = 'line_start'
                        }else{
                            state = null
                            line_num++
                            line_start = pos + 1
                            line = get_line_at(pos)
                        }
                        break
                    case '0':
                        // special case for 0 : it starts a number, but if the
                        // next character is 'b', 'o' or 'x', it is a binary /
                        // octal / hexadecimal number, and this changes the
                        // digits that are accepted in the number literal
                        state = 'NUMBER'
                        number = char
                        num_type = ''
                        if(src[pos] &&
                                'xbo'.indexOf(src[pos].toLowerCase()) > -1){
                            number += src[pos]
                            num_type = src[pos].toLowerCase()
                            pos++
                        }
                        break
                    case '.':
                        if(src[pos] && $B.in_unicode_category('Nd', ord(src[pos]))){
                            state = 'NUMBER'
                            num_type = ''
                            number = char
                        }else{
                            var op = char
                            while(src[pos] == char){
                                pos++
                                op += char
                            }
                            var dot_pos = pos - line_start - op.length + 1
                            while(op.length >= 3){
                                // sequences of 3 consecutive dots are sent
                                // as a single token for Ellipsis
                                yield Token('OP', '...', [line_num, dot_pos],
                                    [line_num, dot_pos + 3], line)
                                op = op.substr(3)
                            }
                            for(var i = 0; i < op.length; i++){
                                yield Token('OP', '.', [line_num, dot_pos],
                                    [line_num, dot_pos + 1], line)
                                dot_pos++
                            }
                        }
                        break
                    case '\\':
                        if(mo = /^\f?(\r\n|\r|\n)/.exec(src.substr(pos))){
                            if(pos == src.length - 1){
                                yield Token('ERRORTOKEN', char,
                                    [line_num, pos - line_start],
                                    [line_num, pos - line_start + 1], line)
                                var token_name = braces.length > 0 ? 'NL': 'NEWLINE'
                                yield Token(token_name, mo[0],
                                    [line_num, pos - line_start],
                                    [line_num, pos - line_start + mo[0].length], line)
                            }
                            line_num++
                            pos += mo[0].length
                            line_start = pos + 1
                            line = get_line_at(pos)


                        }else{
                            yield Token('ERRORTOKEN', char,
                                [line_num, pos - line_start],
                                [line_num, pos - line_start + 1], line)
                        }
                        break
                    case '\n':
                    case '\r':
                        var token_name = braces.length > 0 ? 'NL': 'NEWLINE'
                        mo = /^\f?(\r\n|\r|\n)/.exec(src.substr(pos - 1))
                        yield Token(token_name, mo[0],
                            [line_num, pos - line_start],
                            [line_num, pos - line_start + mo[0].length], line)
                        pos += mo[0].length - 1
                        if(token_name == 'NEWLINE'){
                            state = 'line_start'
                        }else{
                            line_num++
                            line_start = pos + 1
                            line = get_line_at(pos)
                        }
                        break
                    default:
                        if($B.is_XID_Start(ord(char))){
                            // start name
                            state = 'NAME'
                            name = char
                        }else if($B.in_unicode_category('Nd', ord(char))){
                            state = 'NUMBER'
                            num_type = ''
                            number = char
                        }else if(ops.indexOf(char) > -1){
                            if(token_mode == 'regular_within_fstring' &&
                                    (char == ':' || char == '}')){
                                if(char == ':'){
                                    // Nesting_level(token_modes) is the number of
                                    // braces at the start of the fstring
                                    // Inside a ReplacementField, braces has the
                                    // opening '{' appended
                                    if(nesting_level(token_modes) == braces.length - 1){
                                        yield Token('OP', char,
                                            [line_num, pos - line_start - op.length + 1],
                                            [line_num, pos - line_start + 1],
                                            line)
                                        token_modes.pop()
                                        token_mode = 'format_specifier'
                                        token_modes.push(token_mode)
                                        continue
                                    }
                                }else{
                                    yield Token('OP', char,
                                        [line_num, pos - line_start - op.length + 1],
                                        [line_num, pos - line_start + 1],
                                        line)
                                    token_modes.pop()
                                    token_mode = token_modes[token_modes.length - 1]
                                    if(braces.length == 0 || $B.last(braces) !== '{'){
                                        throw Error('wrong braces')
                                    }
                                    braces.pop()
                                    continue
                                }
                            }
                            var op = char
                            if(op2.indexOf(char + src[pos]) > -1){
                                op = char + src[pos]
                                pos++
                            }
                            if(src[pos] == '=' && (op.length == 2 ||
                                    augm_op.indexOf(op) > -1)){
                                op += src[pos]
                                pos++
                            }else if((char == '-' && src[pos] == '>') ||
                                     (char == ':' && src[pos] == '=')){
                                op += src[pos]
                                pos++
                            }
                            if('[({'.indexOf(char) > -1){
                                braces.push(char)
                            }else if('])}'.indexOf(char) > -1){
                                if(braces && $last(braces) == closing[char]){
                                    braces.pop()
                                }else{
                                    braces.push(char)
                                }
                            }
                            yield Token('OP', op,
                                [line_num, pos - line_start - op.length + 1],
                                [line_num, pos - line_start + 1],
                                line)
                        }else if(char == '!'){
                            if(src[pos] == '='){
                                yield Token('OP', '!=',
                                    [line_num, pos - line_start],
                                    [line_num, pos - line_start + 2],
                                    line)
                                pos++
                            }else{
                                yield Token('OP', char,
                                    [line_num, pos - line_start],
                                    [line_num, pos - line_start + 1],
                                    line)
                            }
                        }else if(char == ' ' || char == '\t'){
                            // ignore
                        }else{
                            // invalid character
                            yield Token('ERRORTOKEN', char,
                                [line_num, pos - line_start],
                                [line_num, pos - line_start + 1],
                                line)
                        }
              }
              break

            case 'NAME':
                if($B.is_XID_Continue(ord(char))){
                    name += char
                }else if(char == '"' || char == "'"){
                    if(string_prefix.exec(name) || bytes_prefix.exec(name)){
                        // prefixed string, like r"...", b"..." etc.
                        state = 'STRING'
                        quote = char
                        triple_quote = src[pos] == quote && src[pos + 1] == quote
                        prefix = name
                        if(triple_quote){
                          pos += 2
                        }
                        if(prefix.toLowerCase().indexOf('f') > -1){
                            fstring_start = pos - line_start - name.length
                            token_mode = new String('fstring')
                            token_mode.nesting = braces.length
                            token_mode.quote = quote
                            token_mode.triple_quote = triple_quote
                            token_mode.raw = prefix.toLowerCase().indexOf('r') > -1
                            token_modes.push(token_mode)
                            var s = triple_quote ? quote.repeat(3) : quote
                            yield Token(FSTRING_START, prefix + s,
                                [line_num, fstring_start],
                                [line_num, pos - line_start],
                                line)
                            continue
                        }
                        escaped = false
                        string_start = [line_num,
                            pos - line_start - name.length, line_start]
                        string = ''
                    }else{
                        yield Token('NAME', name,
                            [line_num, pos - line_start - name.length],
                            [line_num, pos - line_start],
                            line)
                        state = null
                        pos--
                    }
                }else{
                    yield Token('NAME', name,
                        [line_num, pos - line_start - name.length],
                        [line_num, pos - line_start],
                        line)
                    state = null
                    pos--
                }
                break

            case 'STRING':
                switch(char){
                    case quote:
                        if(! escaped){
                            // string end
                            var string_line = line
                            // If the string spans over several lines, "line"
                            // is extended until the last quote
                            if(line_num > string_start[0]){
                                string_line = src.substring(
                                    string_start[2] - 1, pos + 2)
                            }
                            if(! triple_quote){
                                var full_string = prefix + quote + string +
                                  quote
                                yield Token('STRING', full_string,
                                    string_start,
                                    [line_num, pos - line_start + 1],
                                    string_line)
                                state = null
                            }else if(char + src.substr(pos, 2) ==
                                    quote.repeat(3)){
                                var full_string = prefix + quote.repeat(3) +
                                        string + quote.repeat(3)
                                // For triple-quoted strings, if it spans over
                                // several lines, "line" is extended until the
                                // last quote
                                yield Token('STRING', full_string,
                                    string_start,
                                    [line_num, pos - line_start + 3],
                                    string_line)
                                pos += 2
                                state = null
                            }else{
                                string += char
                            }
                        }else{
                            string += char
                        }
                        escaped = false
                        break
                    case '\r':
                    case '\n':
                        if(! escaped && ! triple_quote){
                            // unterminated string
                            // go back to yield whitespace as ERRORTOKEN
                            var quote_pos = string_start[1] + line_start - 1,
                                pos = quote_pos
                            while(src[pos - 1] == ' '){
                                pos--
                            }
                            while(pos < quote_pos){
                                yield Token('ERRORTOKEN', ' ',
                                    [line_num, pos - line_start + 1],
                                    [line_num, pos - line_start + 2],
                                    line)
                                pos++
                            }
                            pos++
                            yield Token('ERRORTOKEN', quote,
                                    [line_num, pos - line_start],
                                    [line_num, pos - line_start + 1],
                                    line)
                            state = null
                            pos++
                            break
                        }
                        string += char
                        line_num++
                        line_start = pos + 1
                        if(char == '\r' && src[pos] == '\n'){
                            string += src[pos]
                            line_start++
                            pos++
                        }
                        line = get_line_at(pos)
                        escaped = false
                        break
                    case '\\':
                        string += char
                        escaped = ! escaped
                        break
                    default:
                        escaped = false
                        string += char
                        break
                }
                break

            case 'NUMBER':
                if(test_num(num_type, char)){
                    number += char
                }else if(char == '_' && ! number.endsWith('.')){
                    if(number.endsWith('_')){
                        throw SyntaxError('consecutive _ in number')
                    }else if(src[pos] === undefined ||
                            ! test_num(num_type, src[pos])){
                        // eg 12_
                        yield Token('NUMBER', number,
                            [line_num, pos - line_start - number.length],
                            [line_num, pos - line_start],
                            line)
                        state = null
                        pos--
                    }else{
                        number += char
                    }
                }else if(char == '.' && number.indexOf(char) == -1){
                    number += char
                }else if(char.toLowerCase() == 'e' &&
                        number.toLowerCase().indexOf('e') == -1){
                    if('+-'.indexOf(src[pos]) > -1 ||
                            $B.in_unicode_category('Nd', ord(src[pos]))){
                        number += char
                    }else{
                        yield Token('NUMBER', number,
                            [line_num, pos - line_start - number.length],
                            [line_num, pos - line_start],
                            line)
                        state = null
                        pos--
                    }
                }else if((char == '+' || char == '-') &&
                        number.toLowerCase().endsWith('e')){
                    number += char
                }else if(char.toLowerCase() == 'j'){ // complex number
                    number += char
                    yield Token('NUMBER', number,
                        [line_num, pos - line_start - number.length + 1],
                        [line_num, pos - line_start + 1],
                        line)
                    state = null
                }else{
                    yield Token('NUMBER', number,
                        [line_num, pos - line_start - number.length],
                        [line_num, pos - line_start],
                        line)
                    state = null
                    pos--
                }
                break
        }
    }

    if(braces.length > 0){
        throw SyntaxError('EOF in multi-line statement')
    }

    switch(state){
        case 'line_start':
            line_num++
            break
        case 'NAME':
            yield Token('NAME', name,
                [line_num, pos - line_start - name.length + 1],
                [line_num, pos - line_start + 1],
                line)

            break
        case 'NUMBER':
            yield Token('NUMBER', number,
              [line_num, pos - line_start - number.length + 1],
              [line_num, pos - line_start + 1],
              line)
            break
        case 'STRING':
            var msg = `unterminated ${triple_quote ? 'triple-quoted ' : ''}` +
                `string literal (detected at line ${line_num})`
            throw SyntaxError(msg)
    }

    if(! src.endsWith('\n') && state != line_start){
        yield Token('NEWLINE', '', [line_num, pos - line_start + 1],
            [line_num, pos - line_start + 1], line +'\n')
        line_num++
    }

    while(indents.length > 0){
        indents.pop()
        yield Token('DEDENT', '', [line_num, 0], [line_num, 0], '')
    }
    yield Token('ENDMARKER', '', [line_num, 0], [line_num, 0], '')

}
})(__BRYTHON__)
