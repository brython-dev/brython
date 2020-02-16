// Implementation of unicodedata

var $module = (function($B){

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
        var ord = chr.codePointAt(0),
            hex = ord.toString(16).toUpperCase()
        while(hex.length < 4){hex = "0" + hex}
        var re = new RegExp("^" + hex +";(.+?);(.*?);(.*?);(.*?);(.*?);(.*);(.*);(.*)$",
                "m"),
            search = re.exec($B.unicodedb)
        if(search === null){
            console.log("null", chr, "value", cps, value, hex,  re)
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
            throw _b_.KeyError.$factory(chr)
        }
        return search.bidirectional
    }

    function category(chr){
        // Returns the general category assigned to the character chr as
        // string.
        var search = _info(chr)
        if(search === null){
            console.log("error", chr, hex)
            throw _b_.KeyError.$factory(chr)
        }
        return search.category
    }

    function combining(chr){
        // Returns the general category assigned to the character chr as
        // string.
        var search = _info(chr)
        if(search === null){
            console.log("error", chr)
            throw _b_.KeyError.$factory(chr)
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
            throw _b_.KeyError.$factory(chr)
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
            throw _b_.KeyError.$factory(chr)
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
            throw _b_.KeyError.$factory(chr)
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
            throw _b_.KeyError.$factory("undefined character name '" +
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
            throw _b_.KeyError.$factory("undefined character name '" +
                chr + "'")
        }
        return search.name
    }

    function _norm(form, chr){
        var search = _info(chr)
        if(search === null){
            throw _b_.KeyError.$factory(chr)
        }
        switch(form){
            case "NFC":
                return chr
            case "NFD":
                var decomp = decomposition(chr),
                    parts = decomp.split(" "),
                    res = ""
                if(parts[0].startsWith("<")){
                    return chr
                }
                parts.forEach(function(part){
                    if(! part.startsWith("<")){
                        res += _b_.chr(parseInt(part, 16))
                    }
                })
                return res
            case "NFKC":
                var decomp = decomposition(chr),
                    parts = decomp.split(" ")
                if(parts[0] == "<compat>"){
                    var res = ""
                    parts.slice(1).forEach(function(part){
                        res += _b_.chr(parseInt(part, 16))
                    })
                    return res
                }
                return chr
            case "NFKD":
                var decomp = decomposition(chr),
                    parts = decomp.split(" ")
                if(parts[0] == "<compat>"){
                    var res = ""
                    parts.slice(1).forEach(function(part){
                        res += _b_.chr(parseInt(part, 16))
                    })
                    return res
                }
                return chr

            default:
                throw _b_.ValueError.$factory("invalid normalization form")
        }
    }

    function normalize(form, unistr){
        var res = ""
        for(var i = 0, len = unistr.length; i < len; i++){
            res += _norm(form, unistr.charAt(i))
        }
        return res
    }

    function numeric(chr, _default){
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var search = _info(chr)
        if(search === null){
            if(_default){return _default}
            throw _b_.KeyError.$factory(chr)
        }
        return new Number(eval(search.numeric))
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
    return module

})(__BRYTHON__)