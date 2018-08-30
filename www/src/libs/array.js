var $module = (function($B){

var _b_ = $B.builtins,
    $s = [],
    i
for(var $b in _b_){$s.push('var ' + $b +' = _b_["'+$b+'"]')}
eval($s.join(';'))

var typecodes = {
    'b': Int8Array,    // signed char, 1 byte
    'B': UInt8Array,   // unsigned char, 1
    'u': null,         // Py_UNICODE Unicode character, 2 (deprecated)
    'h': Int16Array,   // signed short, 2
    'H': UInt16Array,  // unsigned short, 2
    'i': Int16Array,   //  signed int, 2
    'I': UInt16Array,  // unsigned int, 2
    'l': Int32Array,   // signed long, 4
    'L': UInt32Array,  // unsigned long, 4
    'q': null,         // signed long, 8 (not implemented)
    'Q': null,         // unsigned long, 8 (not implemented)
    'f': Float32Array, // float, 4
    'd': Float64Array  // double float, 8
}

_mod = {
    array: function(){
        var missing = {},
            $ = $B.args("array", 2, {typecode: null, initializer: null},
            ["typecode", "initializer"], arguments, {initializer: missing},
            null, null),
            typecode = $.typecode,
            initializer = $.initializer
            if(! typecodes.hasOwnProperty(typecode)){
                throw _b_.ValueError.$factory("bad typecode (must be b, " +
                    "B, u, h, H, i, I, l, L, q, Q, f or d)")
            }
            if(typecodes[typecode] === null){
                throw _b_.NotImplementedError.$factory("type code " +
                    typecode + "is not implemented")
            }
            return Object.create(typecodes[typecode])
    }
}

return _mod

})(__BRYTHON__)
