var $module=(function($B){

var _b_ = $B.builtins,
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

var error = $B.make_class("error", _b_.Exception.$factory)
error.__bases__ = [_b_.Exception]
$B.set_func_names(error, "binascii")

function decode(bytes, altchars, validate){
    var output = [],
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4

    var alphabet = make_alphabet(altchars)

    var input = bytes.source

    // If validate is set, check that all characters in input
    // are in the alphabet
    var _input = ''
    var padding = 0
    for(var i = 0, len = input.length; i < len; i++){
        var car = String.fromCharCode(input[i])
        var char_num = alphabet.indexOf(car)
        if(char_num == -1){
            if(validate){throw error.$factory("Non-base64 digit found: " +
                car)}
        }else if(char_num == 64 && i < input.length - 2){
            if(validate){throw error.$factory("Non-base64 digit found: " +
                car)}
        }else if(char_num == 64 && i >= input.length - 2){
            padding++
            _input += car
        }else{
            _input += car
        }
    }
    input = _input
    if(_input.length == padding){return _b_.bytes.$factory([])}
    if( _input.length % 4 > 0){throw error.$factory("Incorrect padding")}

    var i = 0
    while(i < input.length){

        enc1 = alphabet.indexOf(input.charAt(i++))
        enc2 = alphabet.indexOf(input.charAt(i++))
        enc3 = alphabet.indexOf(input.charAt(i++))
        enc4 = alphabet.indexOf(input.charAt(i++))

        chr1 = (enc1 << 2) | (enc2 >> 4)
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
        chr3 = ((enc3 & 3) << 6) | enc4

        output.push(chr1)

        if(enc3 != 64){output.push(chr2)}
        if(enc4 != 64){output.push(chr3)}

    }
    // return Python bytes
    return _b_.bytes.$factory(output)
}


var hex2int = {},
    hex = '0123456789abcdef'
for(var i = 0; i < hex.length; i++){
    hex2int[hex[i]] = i
    hex2int[hex[i].toUpperCase()] = i
}

function make_alphabet(altchars){
    var alphabet = _keyStr
    if(altchars !== undefined && altchars !== _b_.None){
        // altchars is an instance of Python bytes
        var source = altchars.source
        alphabet = alphabet.substr(0,alphabet.length-3) +
            _b_.chr(source[0]) + _b_.chr(source[1]) + '='
    }
    return alphabet
}

var module = {
    a2b_base64: function(){
        var $ = $B.args("a2b_base64", 2, {s: null, strict_mode: null}, 
                ['s', 'strict_mode'],
                arguments, {strict_mode: false}, null, null)
        var bytes
        if(_b_.isinstance($.s, _b_.str)){
            bytes = _b_.str.encode($.s, 'ascii')
        }else if(_b_.isinstance($.s, [_b_.bytes, _b_.bytearray])){
            bytes = $.s
        }else{
            throw _b_.TypeError.$factory('wrong type: ' + $B.class_name($.s))
        }
        return decode(bytes)
    },
    a2b_hex: function(){
        var $ = $B.args("a2b_hex", 1, {s: null}, ['s'],
                arguments, {}, null, null),
            s = $.s
        if(_b_.isinstance(s, _b_.bytes)){
            s = _b_.bytes.decode(s, 'ascii')
        }
        if(typeof s !== "string"){
            throw _b_.TypeError.$factory("argument should be bytes, " +
                "buffer or ASCII string, not '" + $B.class_name(s) + "'")
        }

        var len = s.length
        if(len % 2 == 1){
            throw _b_.TypeError.$factory('Odd-length string')
        }

        var res = []
        for(var i = 0; i < len; i += 2){
            res.push((hex2int[s.charAt(i)] << 4) + hex2int[s.charAt(i + 1)])
        }
        return _b_.bytes.$factory(res)
    },
    b2a_base64: function(){
        var $ = $B.args("b2a_base64", 1, {data: null}, ['data'],
                arguments, {}, null, "kw")
        var newline = false
        if($.kw && _b_.dict.$contains_string($.kw, 'newline')){
            newline = _b_.dict.$getitem_string($.kw, 'newline')
        }

        var string = $B.to_bytes($.data),
            res = btoa(String.fromCharCode.apply(null, string))
        if(newline){res += "\n"}
        return _b_.bytes.$factory(res, "ascii")
    },
    b2a_hex: function(obj){
        var string = $B.to_bytes(obj),
            res = []
        function conv(c){
            if(c > 9){
                c = c + 'a'.charCodeAt(0) - 10
            }else{
                c = c + '0'.charCodeAt(0)
            }
            return c
        }
        string.forEach(function(char){
            res.push(conv((char >> 4) & 0xf))
            res.push(conv(char & 0xf))
        })
        return _b_.bytes.$factory(res)
    },
    b2a_uu: function(obj){
        var string = _b_.bytes.decode(obj, 'ascii')
        var len = string.length,
            res = String.fromCharCode((0x20 + len) & 0x3F)
        while(string.length > 0){
            var s = string.slice(0, 3)
            while(s.length < 3){s.push(String.fromCharCode(0))}
            var A = s[0],
                B = s[1],
                C = s[2]
            var a = (A >> 2) & 0x3F,
                b = ((A << 4) | ((B >> 4) & 0xF)) & 0x3F,
                c = (((B << 2) | ((C >> 6) & 0x3)) & 0x3F),
                d = C & 0x3F
            res += String.fromCharCode(0x20 + a, 0x20 + b, 0x20 + c, 0x20 + d)
            string = string.slice(3)
        }
        return _b_.bytes.$factory(res + "\n", "ascii")
    },
    error: error
}

module.hexlify = module.b2a_hex
module.unhexlify = module.a2b_hex

return module
}
)(__BRYTHON__)