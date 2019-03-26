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

    function decimal(chr, _default){
        // Returns the decimal value assigned to the character chr as integer.
        // If no such value is defined, default is returned, or, if not given,
        // ValueError is raised.
        var ord = _b_.ord(chr),
            hex = ord.toString(16)
        while(hex.length < 4){hex = "0" + hex}
        var re = new RegExp("^" + hex +";(.*)$", "m")
        search = re.exec($B.unicodedb)
        if(search === null){
            if(_default){return _default}
            throw _b_.KeyError.$factory("undefined character name '" +
                name + "'")
        }else{
            var name = search[1],
                re = new RegExp("DIGIT (.+)$"),
                search = re.exec(name)
            if(search === null){
                throw _b_.ValueError.$factory("not a decimal")
            }
            var digit = search[1]
            return ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE",
                "SIX", "SEVEN", "EIGHT", "NINE"].indexOf(digit)
        }
    }

    function lookup(name){
        // Look up character by name. If a character with the given name is
        // found, return the corresponding character. If not found, KeyError
        // is raised.
        var re = new RegExp("^([0-9A-F]+);" +
            name + "$", "m")
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
        var ord = _b_.ord(chr),
            hex = ord.toString(16)
        while(hex.length < 4){hex = "0" + hex}
        var re = new RegExp("^" + hex +";(.*)$", "m")
        search = re.exec($B.unicodedb)
        if(search === null){
            if(_default){return _default}
            throw _b_.KeyError.$factory("undefined character name '" +
                name + "'")
        }
        return search[1]
    }

    function numeric(chr, _default){
        var res = decimal(chr, _default)
        return new Number(res)
    }
    return {
        decimal: decimal,
        digit: decimal,
        lookup: lookup,
        name: name,
        numeric: numeric
    }

})(__BRYTHON__)