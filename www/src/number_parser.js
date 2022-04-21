(function($B){

function test_num(num_lit){
    var len = num_lit.length,
        pos = 0,
        char,
        elt = null,
        subtypes = {b: 'binary', o: 'octal', x: 'hexadecimal'},
        digits_re = /[_\d]/

    function error(message){
        throw SyntaxError(message)
    }
    function check(elt){
      if(elt.value.length == 0){
        var t = subtypes[elt.subtype] || 'decimal'
        error("invalid " + t + " literal")
      }else if(elt.value[elt.value.length - 1].match(/[\-+_]/)){
        var t = subtypes[elt.subtype] || 'decimal'
        error("invalid " + t + " literal")
      }else{
        // remove underscores
        elt.value = elt.value.replace(/_/g, "")
        // set length
        elt.length = pos
        return elt
      }
    }

    while(pos < len){
      var char = num_lit[pos]
      if(char.match(digits_re)){
        if(elt === null){
            elt = {value: char}
        }else{
            if(char == '_' && elt.value.match(/[._+\-]$/)){
                // consecutive underscores
                error('consecutive _ at ' + pos)
            }else if(char == '_' && elt.subtype == 'float' &&
                    elt.value.match(/e$/i)){
                // consecutive underscores
                error('syntax error')
            }else if(elt.subtype == 'b' && !(char.match(/[01_]/))){
              error(`invalid digit '${char}' in binary literal`)
            }else if(elt.subtype == 'o' && !(char.match(/[0-7_]/))){
              error(`invalid digit '${char}' in octal literal`)
            }else if(elt.subtype === undefined && elt.value.startsWith("0") &&
                !char.match(/[0_]/)){
              error("leading zeros in decimal integer literals are not" +
                " permitted; use an 0o prefix for octal integers")
            }
            elt.value += char
        }
        pos++
      }else if(char.match(/[oxb]/i)){
        if(elt.value == "0"){
          elt.subtype = char.toLowerCase()
          if(elt.subtype == "x"){
              digits_re = /[_\da-fA-F]/
          }
          elt.value = ''
          pos++
        }else{
          error("invalid char " + char)
        }
      }else if(char == '.'){
        if(elt === null){
          error("invalid char in " + num_lit + " pos " + pos + ": " + char)
        }else if(elt.subtype === undefined){
          elt.subtype = "float"
          if(elt.value.endsWith('_')){
            error("invalid decimal literal")
          }
          elt.value = elt.value.replace(/_/g, "") + char
          pos++
        }else{
          return check(elt)
        }
      }else if(char.match(/e/i)){
        if(num_lit[pos + 1] === undefined){
          error("nothing after e")
        }else if(elt && subtypes[elt.subtype] !== undefined){
          // 0b01e5 is invalid
          error("syntax error")
        }else if(elt && elt.value.endsWith('_')){
            // 1_e2 is invalid
            error("syntax error")
        }else if(num_lit[pos + 1].match(/[+\-0-9_]/)){
          if(elt && elt.value){
            if(elt.exp){
              elt.length = pos
              return elt
            }
            elt.subtype = 'float'
            elt.value += char
            elt.exp = true
            pos++
          }else{
            error("unexpected e")
          }
        }else{
          return check(elt)
        }
      }else if(char.match(/[\+\-]/i)){
          if(elt === null){
            elt = {value: char}
            pos++
          }else if(elt.value.search(/e$/i) > -1){
            elt.value += char
            pos++
          }else{
            return check(elt)
          }
      }else if(char.match(/j/i)){
          if(elt && (! elt.subtype || elt.subtype == "float")){
            elt.imaginary = true
            check(elt)
            elt.length++ // for "j"
            return elt
          }else{
            error("invalid syntax")
          }
      }else{
        break
      }
    }
    return check(elt)
}


$B.prepare_number = function(n){
    // n is a numeric literal
    // return an object {type: <int | float | imaginary>, value}
    n = n.replace(/_/g, "")
    if(n.startsWith('.')){
        if(n.endsWith("j")){
            return {type: 'imaginary',
                value: $B.prepare_number(n.substr(0, n.length - 1))}
        }else{
            return {type: 'float', value: n}
        }
        pos = j
    }else if(n.startsWith('0') && n != '0'){
        // octal, hexadecimal, binary
        var num = test_num(n),
            base
        if(num.imaginary){
            return {type: 'imaginary', value: $B.prepare_number(num.value)}
        }
        if(num.subtype == 'float'){
            return {type: num.subtype, value: num.value}
        }
        if(num.subtype === undefined){
            base = 10
        }else{
            base = {'b': 2, 'o': 8, 'x': 16}[num.subtype]
        }
        if(base !== undefined){
            return{type: 'int', value: [base, num.value]}
        }
    }else{
        var num = test_num(n)
        if(num.subtype == "float"){
            if(num.imaginary){
                return {
                    type: 'imaginary',
                    value: $B.prepare_number(num.value)
                }
            }else{
               return {
                   type: 'float',
                   value: num.value
               }
           }
        }else{
            if(num.imaginary){
                return {
                    type: 'imaginary',
                    value: $B.prepare_number(num.value)
                }
            }else{
                return {
                   type: 'int',
                   value: [10, num.value]
               }
           }
       }
    }
}

})(__BRYTHON__)