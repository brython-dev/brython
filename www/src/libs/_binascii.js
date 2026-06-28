(function($B) {

var _b_ = $B.builtins,
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

const BASE64_PAD = '='

const ASCII85_ALPHABET = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu'
const BASE32HEX_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUV'
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const BASE85_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~'
const BINHEX_ALPHABET = '!"#$%&\'()*+,-012345689@ABCDEFGHIJKLMNPQRSTUVXYZ[`abcdefhijklmpqr'
const CRYPT_ALPHABET = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const URLSAFE_BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const UU_ALPHABET = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_'
const Z85_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#'

const reversed_cache = {}

var error = $B.make_type("error", [_b_.ValueError])

$B.set_func_names(error, "binascii")
$B.finalize_type(error)

function decode(bytes, altchars, validate) {
    var output = [],
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4

    var alphabet = make_alphabet(altchars)

    var input = bytes.source

    // If validate is set, check that all characters in input
    // are in the alphabet
    var _input = ''
    var padding = 0
    for (var i = 0, len = input.length; i < len; i++) {
        var car = String.fromCharCode(input[i])
        var char_num = alphabet.indexOf(car)
        if (char_num == -1) {
            if (validate) {
                $B.RAISE(error, "Non-base64 digit found: " + car)
            }
        } else if (char_num == 64 && i < input.length - 2) {
            if (validate) {
                $B.RAISE(error, "Non-base64 digit found: " + car)
            }
        } else if (char_num == 64 && i >= input.length - 2) {
            padding++
            _input += car
        } else {
            _input += car
        }
    }
    input = _input
    if (_input.length == padding) {
        return _b_.bytes.$factory([])
    }
    if ( _input.length % 4 > 0) {
        $B.RAISE(error, "Incorrect padding")
    }

    var i = 0
    while (i < input.length) {

        enc1 = alphabet.indexOf(input.charAt(i++))
        enc2 = alphabet.indexOf(input.charAt(i++))
        enc3 = alphabet.indexOf(input.charAt(i++))
        enc4 = alphabet.indexOf(input.charAt(i++))

        chr1 = (enc1 << 2) | (enc2 >> 4)
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
        chr3 = ((enc3 & 3) << 6) | enc4

        output.push(chr1)

        if (enc3 != 64) {output.push(chr2)}
        if (enc4 != 64) {output.push(chr3)}

    }
    // return Python bytes
    return _b_.bytes.$factory(output)
}

function bin(x, size) {
    let b = x.toString(2)
    return '0'.repeat(size - b.length) + b
}

function base64_decode(bytes, alphabet, padded) {
    if (bytes.length % 4 !== 0) {
        if (bytes[bytes.length - 1] == 10) {
            bytes.pop()
        }
        if (padded && bytes.length % 4 !== 0){
            $B.RAISE(error, "Incorrect padding")
        }
    }
    let reversed = reversed_cache[alphabet]
    if (reversed === undefined) {
        reversed = {}
        let i = 0
        for (let char of alphabet) {
            reversed[char.charCodeAt(0)] = i++
        }
        reversed_cache[alphabet] = reversed
    }

    let res = []
    for (let i = 0, len = bytes.length; i < len; i += 4) {
        let c1 = reversed[bytes[i]]
        let c2 = reversed[bytes[i + 1]]
        let c3 = reversed[bytes[i + 2]]
        let c4 = reversed[bytes[i + 3]]
        let x1 = (c1 << 2) + (c2 >> 4)
        let x2 = ((c2 & 0b1111) << 4) + (c3 >> 2)
        let x3 = ((c3 & 0b11) << 6) + c4
        res.push(x1)
        res.push(x2)
        res.push(x3)
    }
    return $B.fast_bytes(res)
}
/*
        [table_b2a_base64[( A >> 2                    ) & 0x3F],
         table_b2a_base64[((A << 4) | ((B >> 4) & 0xF)) & 0x3F],
         table_b2a_base64[((B << 2) | ((C >> 6) & 0x3)) & 0x3F],
         table_b2a_base64[( C                         ) & 0x3F]])
*/       
function base64_encode(bytes, alphabet, padded) {
    let s = bytes
    let padding = BASE64_PAD
    let conv = ''
    for (let i = 0, len = s.length; i < len; i += 3) {
        let A = s[i]
        let x1 = (A >> 2) & 0x3f
        conv += alphabet[x1]
        let x2 = A << 4
        if (i + 1 == len) {
            conv += alphabet[x2 & 0x3f] + (padded ? padding.repeat(2) : '')
        } else {
            let B = s[i + 1]
            x2 += (B >> 4) & 0xf
            conv += alphabet[x2 & 0x3f]
            let x3 = B << 2
            if (i + 2 == len) {
                conv += alphabet[x3 & 0x3f] + (padded ? padding : '')
            } else {
                let C = s[i + 2]
                x3 += (C >> 6) & 0x3
                conv += alphabet[x3 & 0x3f]
                let x4 = C & 0x3f
                conv += alphabet[x4]
            }
        }
    }
    return conv
}

var hex2int = {},
    hex = '0123456789abcdef'
for (var i = 0; i < hex.length; i++) {
    hex2int[hex[i]] = i
    hex2int[hex[i].toUpperCase()] = i
}

function make_alphabet(altchars) {
    var alphabet = _keyStr
    if (altchars !== undefined && altchars !== _b_.None) {
        // altchars is an instance of Python bytes
        var source = altchars.source
        alphabet = alphabet.substr(0,alphabet.length-3) +
            _b_.chr(source[0]) + _b_.chr(source[1]) + '='
    }
    return alphabet
}

var module = {
    a2b_base64: function() {
        var [args, kw] = $B.parse_args_kw('a2b_base64', arguments)
        if (args.length != 1) {
            $B.RAISE(_b_.TypeError,
                `a2b_base64() takes exactly 1 positional argument ` +
                `(${args.length} given)`
            )
        }
        let string = args[0]
        // ignorechars,
        let padded = true,
            alphabet = BASE64_ALPHABET,
            strict_mode = true,
            canonical = false
        for (let entry of _b_.dict.$iter_items(kw)) {
            switch (entry.key) {
                case 'strict_mode':
                    strict_mode = entry.value
                    break
                case 'alphabet':
                    alphabet = entry.value
                    if (! $B.exact_type(alphabet, _b_.bytes)) {
                        $B.RAISE(_b_.TypeError,
                            `a2b_base64() argument 'alphabet' must be ` +
                            `bytes, not ${$B.class_name(alphabet)}`
                        )
                    }
                    alphabet = _b_.bytes.tp_funcs.decode(alphabet, 'ascii')
                    break
                case 'padded':
                    padded = $B.$bool(entry.value)
                    break
                case 'canonical':
                    canonical = entry.value
                    break
                case 'ignorechars':
                    ignorechars = entry.value
                    break
                default:
                    $B.RAISE(_b_.TypeError,
                        `a2b_base64() got an unexpected keyword argument ` +
                        `'${entry.key}'`
                    )
            }
        }
        var bytes
        if ($B.is_str(string)) {
            bytes = _b_.str.encode(string, 'ascii')
        } else if ($B.$isinstance(string, [_b_.bytes, _b_.bytearray])) {
            bytes = string
        } else {
            $B.RAISE(_b_.TypeError, 'wrong type: ' + $B.class_name(string))
        }
        let bytes_list = $B.to_bytes(bytes)
        return base64_decode(bytes_list, alphabet, padded)
    },
    a2b_hex: function() {
        var $ = $B.args("a2b_hex", 1, {s: null}, arguments)
        var s = $.s
        if ($B.is_bytes(s)) {
            s = $B.bytes_decode(s, 'ascii')
        }
        if (typeof s !== "string") {
            $B.RAISE(_b_.TypeError, "argument should be bytes, " +
                "buffer or ASCII string, not '" + $B.class_name(s) + "'")
        }

        var len = s.length
        if (len % 2 == 1) {
            $B.RAISE(_b_.TypeError, 'Odd-length string')
        }

        var res = []
        for (var i = 0; i < len; i += 2) {
            res.push((hex2int[s.charAt(i)] << 4) + hex2int[s.charAt(i + 1)])
        }
        return _b_.bytes.$factory(res)
    },
    b2a_base64: function() {
        let $ = $B.args("b2a_base64", 1, {data: null}, arguments, null, null,
                    "kw")
        let newline = $B.str_dict_get($.kw, 'newline', true)
        let alphabet = $B.str_dict_get($.kw, 'alphabet', $B.NULL)
        if (alphabet === $B.NULL) {
            alphabet = BASE64_ALPHABET
        } else {
            if (! $B.exact_type(alphabet, _b_.bytes)) {
                $B.RAISE(_b_.TypeError,
                    `a bytes-like object is required, not ` +
                    `'${$B.class_name(alphabet)}'`
                )
            }
            alphabet = _b_.bytes.tp_funcs.decode(alphabet, 'ascii')
            if (alphabet.length !== 64) {
                $B.RAISE(_b_.ValueError, 'alphabet must have length 64')
            }
        }
        let padded = $B.str_dict_get($.kw, 'padded', true)
        var bytes_list = $B.to_bytes($.data)

        var res = base64_encode(bytes_list, alphabet, padded) //btoa(s)

        if (newline) {
            res += "\n"
        }
        return _b_.bytes.$factory(res, "ascii")
    },
    b2a_hex: function(obj) {
        var string = $B.to_bytes(obj),
            res = []
        function conv(c) {
            if (c > 9) {
                c = c + 'a'.charCodeAt(0) - 10
            } else {
                c = c + '0'.charCodeAt(0)
            }
            return c
        }
        for (let char of string) {
            res.push(conv((char >> 4) & 0xf))
            res.push(conv(char & 0xf))
        }
        return _b_.bytes.$factory(res)
    },
    b2a_uu: function(obj) {
        var string = $B.bytes_decode(obj, 'ascii')
        var len = string.length,
            res = String.fromCharCode((0x20 + len) & 0x3F)
        while (string.length > 0) {
            var s = string.slice(0, 3)
            while (s.length < 3) {s.push(String.fromCharCode(0))}
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

$B.addToImported('_binascii', module)

}
)(__BRYTHON__)