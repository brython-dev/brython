;(function($B){

var _b_ = $B.builtins

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

var ops = '.,:;+-*/%~^|&=<>[](){}@',
    op2 = ['**', '//', '>>', '<<'],
    augm_op = '+-*/%~^|&=<>@',
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

function get_line_at(src, pos){
    // Get the line in source code src starting at position pos
    var end = src.substr(pos).search(/[\r\n]/)
    return end == -1 ? src.substr(pos) : src.substr(pos, end)
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
            return $B.unicode_tables.Nd[ord(char)] !== undefined
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

$B.tokenizer = function*(src){
    var unicode_tables = $B.unicode_tables,
        whitespace = ' \t\n',
        operators = '*+-/%&^~=<>',
        allowed_after_identifier = ',.()[]:;',
        string_prefix = /^(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)$/,
        bytes_prefix = /^(b|B|br|Br|bR|BR|rb|rB|Rb|RB)$/
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
        line_num = 0,
        line_start = 1,
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
        switch(state){
            case "line_start":
                line = get_line_at(src, pos - 1)
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
                            line = get_line_at(src, pos)
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
                        if(src[pos] && unicode_tables.Nd[ord(src[pos])]){
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
                            line_num++
                            pos += mo[0].length
                            line_start = pos + 1
                            line = get_line_at(src, pos)
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
                            line = get_line_at(src, pos)
                        }
                        break
                    default:
                        if(unicode_tables.XID_Start[ord(char)]){
                            // start name
                            state = 'NAME'
                            name = char
                        }else if(unicode_tables.Nd[ord(char)]){
                            state = 'NUMBER'
                            num_type = ''
                            number = char
                        }else if(ops.indexOf(char) > -1){
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
                        }else if(char == '!' && src[pos] == '='){
                          yield Token('OP', '!=',
                              [line_num, pos - line_start],
                              [line_num, pos - line_start + 2],
                              line)
                          pos++
                        }else if(char == ' ' || char == '\t'){
                            // ignore
                        }else{
                            yield Token('ERRORTOKEN', char,
                                [line_num, pos - line_start],
                                [line_num, pos - line_start + 1],
                                line)
                        }
              }
              break

            case 'NAME':
                if(unicode_tables.XID_Continue[ord(char)]){
                    name += char
                }else if(char == '"' || char == "'"){
                    if(string_prefix.exec(name) || bytes_prefix.exec(name)){
                        // prefixed string, like r"...", b"..." etc.
                        state = 'STRING'
                        quote = char
                        triple_quote = src[pos] == quote && src[pos + 1] == quote
                        prefix = name
                        escaped = false
                        string_start = [line_num,
                            pos - line_start - name.length, line_start]
                        if(triple_quote){
                          pos += 2
                        }
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
                                triple_quote_line = line
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
                        line = get_line_at(src, pos)
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
                            unicode_tables.Nd[ord(src[pos])]){
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
            throw SyntaxError(
                `unterminated string literal (detected at line ${line_num})`)
    }

    if(! src.endsWith('\n') && char != ' ' && state != line_start){
        yield Token('NEWLINE', '', [line_num, pos - line_start + 1],
            [line_num, pos - line_start + 2], '')
        line_num++
    }

    while(indents.length > 0){
        indents.pop()
        yield Token('DEDENT', '', [line_num, 0], [line_num, 0], '')
    }
    yield Token('ENDMARKER', '', [line_num, 0], [line_num, 0], '')

}
})(__BRYTHON__)