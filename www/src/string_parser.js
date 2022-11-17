(function($B){

var _b_ = $B.builtins

var s_escaped = 'abfnrtvxuU"0123456789' + "'" + '\\',
    is_escaped = {}
for(var i = 0; i < s_escaped.length; i++){
    is_escaped[s_escaped.charAt(i)] = true
}

function string_error(token, msg){
    var a = {
        lineno: token.start[0],
        col_offset: token.start[1],
        end_lineno: token.end[0],
        end_col_offset: token.end[1]
    }
    $B.Parser.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, msg)
}

function test_escape(token, context, text, string_start, antislash_pos){
    // Test if the escape sequence starting at position "antislah_pos" in text
    // is is valid
    // $pos is set at the position before the string quote in original string
    // string_start is the position of the first character after the quote
    // text is the content of the string between quotes
    // antislash_pos is the position of \ inside text
    var seq_end,
        mo
    // 1 to 3 octal digits = Unicode char
    mo = /^[0-7]{1,3}/.exec(text.substr(antislash_pos + 1))
    if(mo){
        return [String.fromCharCode(parseInt(mo[0], 8)), 1 + mo[0].length]
    }
    switch(text[antislash_pos + 1]){
        case "x":
            var mo = /^[0-9A-F]{0,2}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 2){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                // $pos = string_start + seq_end + 2
                string_error(token,
                     ["(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\xXX escape"])
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
        case "u":
            var mo = /^[0-9A-F]{0,4}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 4){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                string_error(token,
                     ["(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape"])
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
        case "U":
            var mo = /^[0-9A-F]{0,8}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 8){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                string_error(token,
                     ["(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape"])
            }else{
                var value = parseInt(mo[0], 16)
                if(value > 0x10FFFF){
                    string_error(token, 'invalid unicode escape ' + mo[0])
                }else if(value >= 0x10000){
                    return [SurrogatePair(value), 2 + mo[0].length]
                }else{
                    return [String.fromCharCode(value), 2 + mo[0].length]
                }
            }
    }
}

$B.prepare_string = function(token){
    var s = token.string,
        len = s.length,
        pos = 0,
        string_modifier,
        _type = "string",
        context = {type: 'str'} // XXX

    while(pos < len){
        if(s[pos] == '"' || s[pos] == "'"){
            quote = s[pos]
            string_modifier = s.substr(0, pos)
            if(s.substr(pos, 3) == quote.repeat(3)){
                _type = "triple_string"
                inner = s.substring(pos + 3, s.length - 3)
            }else{
                inner = s.substring(pos + quote.length,
                    len - quote.length)
            }
            break
        }
        pos++
    }
    var result = {quote}
    var mods = {r: 'raw', f: 'fstring', b: 'bytes'}
    for(var mod of string_modifier){
        result[mods[mod]] = true
    }

    var raw = context.type == 'str' && context.raw,
        string_start = pos + 1,
        bytes = false,
        fstring = false,
        sm_length, // length of string modifier
        end = null;
    if(string_modifier){
        switch(string_modifier) {
            case 'r': // raw string
                raw = true
                break
            case 'u':
                // in string literals, '\U' and '\u' escapes in raw strings
                // are not treated specially.
                break
            case 'b':
                bytes = true
                break
            case 'rb':
            case 'br':
                bytes = true
                raw = true
                break
            case 'f':
                fstring = true
                sm_length = 1
                break
            case 'fr':
            case 'rf':
                fstring = true
                sm_length = 2
                raw = true
                break
        }
        string_modifier = false
    }

    var escaped = false,
        zone = '',
        end = 0,
        src = inner
    while(end < src.length){
        if(escaped){
            if(src.charAt(end) == "a" && ! raw){
                zone = zone.substr(0, zone.length - 1) + "\u0007"
            }else{
                zone += src.charAt(end)
                if(raw && src.charAt(end) == '\\'){
                    zone += '\\'
                }
            }
            escaped = false
            end++
        }else if(src.charAt(end) == "\\"){
            if(raw){
                if(end < src.length - 1 &&
                        src.charAt(end + 1) == quote){
                    zone += '\\\\' + quote
                    end += 2
                }else{
                    zone += '\\\\'
                    end++
                }
                escaped = true
            }else{
                if(src.charAt(end + 1) == '\n'){
                    // explicit line joining inside strings
                    end += 2
                }else if(src.substr(end + 1, 2) == 'N{'){
                    // Unicode literal ?
                    var end_lit = end + 3,
                        re = new RegExp("[-a-zA-Z0-9 ]+"),
                        search = re.exec(src.substr(end_lit))
                    if(search === null){
                        string_error(token, "(unicode error) " +
                            "malformed \\N character escape", pos)
                    }
                    var end_lit = end_lit + search[0].length
                    if(src.charAt(end_lit) != "}"){
                        string_error(token, "(unicode error) " +
                            "malformed \\N character escape")
                    }
                    var description = search[0].toUpperCase()
                    // Load unicode table if not already loaded
                    if($B.unicodedb === undefined){
                        var xhr = new XMLHttpRequest
                        xhr.open("GET",
                            $B.brython_path + "unicode.txt", false)
                        xhr.onreadystatechange = function(){
                            if(this.readyState == 4){
                                if(this.status == 200){
                                    $B.unicodedb = this.responseText
                                }else{
                                    console.log("Warning - could not " +
                                        "load unicode.txt")
                                }
                            }
                        }
                        xhr.send()
                    }
                    if($B.unicodedb !== undefined){
                        var re = new RegExp("^([0-9A-F]+);" +
                            description + ";.*$", "m")
                        search = re.exec($B.unicodedb)
                        if(search === null){
                            string_error(token, "(unicode error) " +
                                "unknown Unicode character name")
                        }
                        var cp = "0x" + search[1] // code point
                        zone += String.fromCodePoint(eval(cp))
                        end = end_lit + 1
                    }else{
                        end++
                    }
                }else{
                    var esc = test_escape(token, context, src, string_start,
                                          end)
                    if(esc){
                        if(esc[0] == '\\'){
                            zone += '\\\\'
                        }else{
                            zone += esc[0]
                        }
                        end += esc[1]
                    }else{
                        if(end < src.length - 1 &&
                            is_escaped[src.charAt(end + 1)] === undefined){
                                zone += '\\'
                        }
                        zone += '\\'
                        escaped = true
                        end++
                    }
                }
            }
        }else if(src.charAt(end) == '\n' && _type != 'triple_string'){
            // In a string with single quotes, line feed not following
            // a backslash raises SyntaxError
            console.log(pos, end, src.substring(pos, end))
            string_error(token, ["EOL while scanning string literal"])
        }else{
            zone += src.charAt(end)
            end++
        }
    }
    var $string = zone,
        string = ''

    // Escape quotes inside string, except if they are
    // already escaped.
    // In raw mode, always escape.
    for(var i = 0; i < $string.length; i++){
        var $car = $string.charAt(i)
        if($car == quote){
            if(raw || (i == 0 ||
                    $string.charAt(i - 1) != '\\')){
                string += '\\'
            }else if(_type == "triple_string"){
                // Unescaped quotes in triple string are allowed
                var j = i - 1
                while($string.charAt(j) == '\\'){
                    j--
                }
                if((i - j - 1) % 2 == 0){
                    string += '\\'
                }
            }
        }
        string += $car
    }

    if(fstring){
        try{
            var re = new RegExp("\\\\" + quote, "g"),
                string_no_bs = string.replace(re, quote)
            var elts = $B.parse_fstring(string_no_bs) // in py_string.js
        }catch(err){
            string_error(token, err.message)
        }
    }

    if(bytes){
        result.value = 'b' + quote + string + quote
    }else if(fstring){
        result.value = elts
    }else{
        result.value = quote + string + quote
    }
    context.raw = raw;
    return result
}

})(__BRYTHON__)