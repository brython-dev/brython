var unicode_tables = __BRYTHON__.unicode_tables

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

function get_comment(src, pos, line_num, line_start, token_name){
    var start = pos,
        ix
    var t = []
    while(true){
        if(pos >= src.length || (ix = '\r\n'.indexOf(src[pos])) > -1){
            t.push(['COMMENT', src.substring(start - 1, pos),
                 [line_num, start - line_start],
                 [line_num, pos - line_start + 1]])
            if(ix !== undefined){
                var nb = 1
                if(src[pos] == '\r' && src[pos + 1] == '\n'){
                    nb++
                }
                t.push([token_name, src.substr(pos, nb),
                    [line_num, pos - line_start + 1],
                    [line_num, pos - line_start + nb + 1]])
                pos += nb
            }
            return {t, pos}
        }
        pos++
    }
}

function* tokenizer(src){
    var whitespace = ' \t\n',
        operators = '*+-/%&^~=<>',
        allowed_after_identifier = ',.()[]:;',
        string_prefix = /^(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)$/,
        bytes_prefix = /^(b|B|br|Br|bR|BR|rb|rB|Rb|RB)$/
    var state = "line_start",
        char,
        cp,
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
        line_start = 1

    yield ['ENCODING', 'utf-8', [0, 0], [0, 0]]

    while(pos < src.length){
        char = src[pos]
        cp = src.charCodeAt(pos)
        if(cp >= 0xD800 && cp <= 0xDBFF){
            cp = ord(src.substr(pos, 2))
            char = src.substr(pos, 2)
            pos++
        }
        pos++
        switch(state){
            case "line_start":
                line_start = pos
                line_num++
                if(char == "\n"){
                    yield ['NL', '\n', [line_num, 0], [line_num, 1]]
                    continue
                }else if(char == '\r' && src[pos] == '\n'){
                    yield ['NL', '\r\n', [line_num, 0], [line_num, 2]]
                    pos++
                    continue
                }else if(char == '#'){
                    comment = get_comment(src, pos, line_num, line_start, 'NL')
                    for(var item of comment.t){
                        yield item
                    }
                    pos = comment.pos
                    state = 'line_start'
                    continue
                }
                // count number of whitespaces
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
                      var comment = get_comment(src, pos + 1, line_num, line_start, 'NL')
                      for(var item of comment.t){
                          yield item
                      }
                      pos = comment.pos
                      continue
                  }else if(src[pos] == '\n'){
                      // whitespace-only line
                      yield ['NL', '', [line_num, pos - line_start + 1],
                        [line_num, pos - line_start + 2]]
                      pos++
                      continue
                  }else if(src[pos] == '\r' && src[pos + 1] == '\n'){
                      yield ['NL', '', [line_num, pos - line_start + 1],
                        [line_num, pos - line_start + 3]]
                      pos += 2
                      continue
                  }
                  if(indents.length == 0 || indent > $last(indents)){
                    indents.push(indent)
                    yield ['INDENT', '', [line_num, 0], [line_num, indent]]
                  }else if(indent < $last(indents)){
                    var ix = indents.indexOf(indent)
                    if(ix == -1){
                      throw Error('IndentationError line ' + line_num)
                    }
                    for(var i = indents.length - 1; i > ix; i--){
                      indents.pop()
                      yield ['DEDENT', '', [line_num, indent],
                          [line_num, indent]]
                    }
                  }
                  state = null
                }else{
                  // dedent all
                  while(indents.length > 0){
                    indents.pop()
                    yield ['DEDENT', '', [line_num, indent], [line_num, indent]]
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
                        string_start = [line_num, pos - line_start]
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
                            token_name)
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
                            yield ['OP', op,
                                [line_num, pos - line_start - op.length + 1],
                                [line_num, pos - line_start + 1]]
                        }
                        break
                    case '\\':
                        if(src[pos] == '\n'){
                            line_num++
                            pos++
                            line_start = pos + 1
                        }else if(src.substr(pos, 2) == '\r\n'){
                            line_num++
                            pos += 2
                            line_start = pos + 1
                        }else{
                            yield ['unknown', char]
                        }
                        break
                    case '\r':
                        var token_name = braces.length > 0 ? 'NL': 'NEWLINE'
                        if(src[pos] == '\n'){
                            yield [token_name, char + src[pos],
                                [line_num, pos - line_start],
                                [line_num, pos - line_start + 2]]
                            pos++
                        }else{
                            yield [token_name, char,
                                [line_num, pos - line_start],
                                [line_num, pos - line_start + 1]]
                        }
                        if(token_name == 'NEWLINE'){
                            state = 'line_start'
                        }else{
                            line_num++
                            line_start = pos + 1
                        }
                        break
                    case '\n':
                        var token_name = braces.length > 0 ? 'NL': 'NEWLINE'
                        yield [token_name, char,
                            [line_num, pos - line_start],
                            [line_num, pos - line_start + 1]]
                        if(token_name == 'NEWLINE'){
                            state = 'line_start'
                        }else{
                            line_num++
                            line_start = pos + 1
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
                            yield ['OP', op,
                                [line_num, pos - line_start - op.length + 1],
                                [line_num, pos - line_start + 1]]
                        }else if(char == '!' && src[pos] == '='){
                          yield ['OP', '!=',
                              [line_num, pos - line_start],
                              [line_num, pos - line_start + 2]]
                          pos++
                        }else{
                            if(char != ' '){
                                yield ['unknown', char + '(' + ord(char) + ')']
                            }
                        }
                        break
              }
              break

            case 'NAME':
                if(unicode_tables.XID_Continue[ord(char)]){
                    name += char
                }else if(char == '"' || char == "'"){
                    if(string_prefix.exec(name) ||
                            bytes_prefix.exec(name)){
                        state = 'STRING'
                        quote = char
                        triple_quote = src[pos] == quote && src[pos + 1] == quote
                        prefix = name
                        escaped = false
                        string_start = [line_num, pos - line_start - 1]
                        if(triple_quote){
                          pos += 2
                        }
                        string = ''
                    }else{
                        yield ['NAME', name,
                            [line_num, pos - line_start - name.length],
                            [line_num, pos - line_start]]
                        state = null
                        pos--
                    }
                }else{
                    yield ['NAME', name,
                        [line_num, pos - line_start - name.length],
                        [line_num, pos - line_start]]
                    state = null
                    pos--
                }
                break

            case 'STRING':
                switch(char){
                    case quote:
                        if(! escaped){
                            // string end
                            if(! triple_quote){
                                var full_string = prefix + quote + string +
                                  quote
                                yield ['STRING', full_string, string_start,
                                  [line_num, pos - line_start + 1]]
                                state = null
                            }else if(char + src.substr(pos, 2) ==
                                    quote.repeat(3)){
                                var full_string = prefix + quote.repeat(3) + 
                                    string + quote.repeat(3)
                                yield ['STRING', full_string, string_start,
                                  [line_num, pos - line_start + 3]]
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
                    case '\n':
                        string += char
                        line_num++
                        line_start = pos + 1
                        escaped = false
                        break
                    case '\\':
                        string += char
                        escaped = !escaped
                        break
                    default:
                        escaped = false
                        string += char
                        break
                }
                break

            case 'NUMBER':
                if(num_type == '' && unicode_tables.Nd[ord(char)]){
                    number += char
                }else if(num_type == 'b' && '01'.indexOf(char) > -1){
                    number += char
                }else if(num_type == 'o' && '01234567'.indexOf(char) > -1){
                    number += char
                }else if(num_type == 'x' &&
                        '0123456789abcdef'.indexOf(char.toLowerCase()) > -1){
                    number += char
                }else if(char == '_'){
                    if(number.endsWith('_')){
                        throw Error('SyntaxError: consecutive _ in number')
                    }
                    number += char
                }else if(char == '.' && number.indexOf(char) == -1){
                    number += char
                }else if(char.toLowerCase() == 'e' &&
                        number.toLowerCase().indexOf('e') == -1){
                    number += char
                }else if((char == '+' || char == '-') &&
                        number.toLowerCase().endsWith('e')){
                    number += char
                }else if(char.toLowerCase() == 'j'){
                    number += char
                    yield ['NUMBER', number,
                        [line_num, pos - line_start - number.length + 1],
                        [line_num, pos - line_start + 1]]
                    state = null
                }else{
                    yield ['NUMBER', number,
                        [line_num, pos - line_start - number.length],
                        [line_num, pos - line_start]]
                    state = null
                    pos--
                }
                break
        }
    }

    switch(state){
        case 'line_start':
            line_num++
            break
        case 'NAME':
            yield ['NAME', name,
                [line_num, pos - line_start - name.length + 1],
                [line_num, pos - line_start + 1]]
    
            break
        case 'NUMBER':
            yield ['NUMBER', number,
              [line_num, pos - line_start - number.length + 1],
              [line_num, pos - line_start + 1]]
            break
        case 'STRING':
            throw Error("unterminated string")
    }
    if(state != 'line_start'){
        yield ['NEWLINE', '', [line_num, pos - line_start + 1],
            [line_num, pos - line_start + 2]]
        line_num++
    }
    while(indents.length > 0){
        indents.pop()
        yield ['DEDENT', '', [line_num, 0], [line_num, 0]]
    }
    yield ['ENDMARKER', '', [line_num, 0], [line_num, 0]]

}
