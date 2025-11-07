// Implementation of unicodedata
(function($B){

    var _b_ = $B.builtins

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

    function _info(chr){
        var ord = _b_.ord(chr),
            hex = ord.toString(16).toUpperCase()
        while(hex.length < 4){hex = "0" + hex}
        var re = new RegExp("^" + hex +";(.+?);(.*?);(.*?);(.*?);(.*?);(.*);(.*);(.*)$",
                "m"),
            search = re.exec($B.unicodedb)
        if(search === null){
            return null
        }else{
            return {
                name: search[1],
                category: search[2],
                combining: search[3],
                bidirectional: search[4],
                decomposition: search[5],
                decimal: search[6],
                digit: search[7],
                numeric: search[8]
            }
        }
    }

    function bidirectional(chr){
        var search = _info(chr)
        if(search === null){
            console.log("error", chr, hex)
            $B.RAISE(_b_.KeyError, chr)
        }
        return search.bidirectional
    }

    function category(chr){
        // Returns the general category assigned to the character chr as
        // string.
        if(/\p{Cn}/u.test(chr.charAt(0))){
            return "Cn"
        }
        var search = _info(chr)
        if(search === null){
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return search.category
    }

    function combining(chr){
        // Returns the general category assigned to the character chr as
        // string.
        var search = _info(chr)
        if(search === null){
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return parseInt(search.combining)
    }

    function decimal(chr, _default){
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if(search === null){
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return parseInt(search.decimal)
    }

    function decomposition(chr, _default){
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if(search === null){
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return search.decomposition
    }

    function digit(chr, _default){
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if(search === null){
            console.log("error", chr)
            $B.RAISE(_b_.KeyError, chr)
        }
        return parseInt(search.digit)
    }

    function lookup(name){
        // Look up character by name. If a character with the given name is
        // found, return the corresponding character. If not found, KeyError
        // is raised.
        var re = new RegExp("^([0-9A-F]+);" +
            name + ";(.*)$", "m")
        search = re.exec($B.unicodedb)
        if(search === null){
            $B.RAISE(_b_.KeyError, "undefined character name '" +
                name + "'")
        }
        var res = parseInt(search[1], 16)
        return _b_.chr(res)
    }

    function name(chr, _default){
        // Returns the name assigned to the character chr as a string. If no
        // name is defined, default is returned, or, if not given, ValueError
        // is raised.
        var search = _info(chr)
        if(search === null){
            if(_default){return _default}
            $B.RAISE(_b_.KeyError, "undefined character name '" +
                chr + "'")
        }
        return search.name
    }

    function normalize(form, unistr){
        if(! ["NFC", "NFD", "NFKC", "NFKD"].includes(form)){
            $B.RAISE(_b_.ValueError, 'invalid normalization form')
        }
        return unistr.normalize(form)
    }

    function numeric(chr, _default){
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if(search === null){
            if(_default){return _default}
            $B.RAISE(_b_.KeyError, chr)
        }
        var parts = search.numeric.split('/'),
            value
        if(parts.length == 1){
            value = parseFloat(search.numeric)
        }else{
            value = parseInt(parts[0]) / parseInt(parts[1])
        }
        return $B.fast_float(value)
    }

    var module = {
        bidirectional: bidirectional,
        category: category,
        combining: combining,
        decimal: decimal,
        decomposition: decomposition,
        digit: digit,
        lookup: lookup,
        name: name,
        normalize: normalize,
        numeric: numeric,
        unidata_version: "11.0.0"
    }
    module.ucd_3_2_0 = {}
    for(var key in module){
        if(key == "unidata_version"){
            module.ucd_3_2_0[key] = '3.2.0'
        }else{
            module.ucd_3_2_0[key] = module[key] // approximation...
        }
    }
    $B.addToImported('unicodedata', module)

})(__BRYTHON__)