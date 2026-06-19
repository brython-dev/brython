"use strict";
(function($B) {

let _b_ = $B.builtins

/* sentinel start */
_b_.sentinel.tp_richcompare = function(self) {

}

_b_.sentinel.nb_or = function(self) {

}

_b_.sentinel.tp_repr = function(self) {
    return self.repr
}

_b_.sentinel.tp_hash = _b_.object.tp_hash

_b_.sentinel.tp_new = function(cls, args, kw) {
    if (args.length != 1){
        $B.RAISE(_b_.TypeError,
            `sentinel expected 1 argument, got ${args.length}`
        )
    }
    let __name__ = args[0]
    let repr = __name__
    for (var entry of _b_.dict.$iter_items(kw)) {
        if (entry.key == 'repr') {
            repr = entry.value
        } else {
            $B.RAISE(_b_.TypeError,
                `sentinel() got an unexpected keyword argument '${entry.key}'`
            )
        }
    }
    let frame = $B.frame_obj.frame
    let module = frame[2] // module name
    return {
        ob_type: _b_.sentinel,
        module,
        name,
        repr
    }
}

var sentinel_funcs = _b_.sentinel.tp_funcs = {}

sentinel_funcs.__copy__ = function(self) {
    return self
}

sentinel_funcs.__deepcopy__ = function(self) {
    return self
}

sentinel_funcs.__reduce__ = function(self) {
    return self.name
}

_b_.sentinel.tp_methods = ["__copy__", "__deepcopy__", "__reduce__"]

_b_.sentinel.tp_members = [
    ["__name__", $B.TYPES.OBJECT, "name",  1],
    ["__module__", $B.TYPES.OBJECT, "module",  0],
]

/* sentinel end */

})(__BRYTHON__);

