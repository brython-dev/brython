var $module=(function($B){

var _b_ = $B.builtins,
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

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

var Base64 = {
    error: function(){return 'binascii_error'},

    encode: function(bytes, altchars){

        var input = bytes.source,
            output = "",
            chr1, chr2, chr3, enc1, enc2, enc3, enc4
        var i = 0

        var alphabet = make_alphabet(altchars)

        while(i < input.length){

            chr1 = input[i++]
            chr2 = input[i++]
            chr3 = input[i++]

            enc1 = chr1 >> 2
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
            enc4 = chr3 & 63

            if(isNaN(chr2)){
                enc3 = enc4 = 64
            }else if(isNaN(chr3)){
                enc4 = 64
            }

            output = output + alphabet.charAt(enc1) +
                alphabet.charAt(enc2) +
                alphabet.charAt(enc3) +
                alphabet.charAt(enc4)

        }
        return _b_.bytes.$factory(output, 'utf-8', 'strict')
    },


    decode: function(bytes, altchars, validate){
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
                if(validate){throw Base64.error("Non-base64 digit found: " +
                    car)}
            }else if(char_num == 64 && i < input.length - 2){
                if(validate){throw Base64.error("Non-base64 digit found: " +
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
        if( _input.length % 4 > 0){throw Base64.error("Incorrect padding")}

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
        return _b_.bytes.$factory(output, 'utf-8', 'strict')

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n")
        var utftext = "";

        for(var n = 0; n < string.length; n++){

            var c = string.charCodeAt(n)

            if(c < 128){
                utftext += String.fromCharCode(c)
            }else if((c > 127) && (c < 2048)){
                utftext += String.fromCharCode((c >> 6) | 192)
                utftext += String.fromCharCode((c & 63) | 128)
            }else{
                utftext += String.fromCharCode((c >> 12) | 224)
                utftext += String.fromCharCode(((c >> 6) & 63) | 128)
                utftext += String.fromCharCode((c & 63) | 128)
            }

        }

        return utftext
    },

    _utf8_decode: function(utftext) {
        var string = "",
            i = 0,
            c = c1 = c2 = 0

        while(i < utftext.length){

            c = utftext.charCodeAt(i)

            if(c < 128){
                string += String.fromCharCode(c)
                i++
            }else if((c > 191) && (c < 224)){
                c2 = utftext.charCodeAt(i + 1)
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
                i += 2
            }else{
                c2 = utftext.charCodeAt(i + 1)
                c3 = utftext.charCodeAt(i + 2)
                string += String.fromCharCode(
                    ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
                i += 3
            }

        }

        return string
    }

}

return {Base64:Base64}
}

)(__BRYTHON__)