(function($B){

var _b_ = $B.builtins

var code = $B.code

var co_attrs = [
    "co_argcount",
    "co_posonlyargcount",
    "co_kwonlyargcount",
    "co_stacksize",
    "co_flags",
    "co_nlocals",
    "co_consts",
    "co_names",
    "co_filename",
    "co_name",
    "co_qualname",
    "co_firstlineno",
    "co_linetable",
    "co_exceptiontable"
]

function code_eq(self, other){
    for(var attr of co_attrs){
        if(! $B.is_or_equals(self[attr], other[attr])){
            return false
        }
    }
    return true
}

/* code start */
$B.code.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, $B.code)){
        return _b_.NotImplemented
    }
    switch(op){
        case '__eq__':
            return code_eq(self, other)
        case '__ne__':
            return ! code_eq(self, other)
        default:
            return _b_.NotImplemented
    }
}

$B.code.tp_repr = function(self){
    return `<code object ${self.co_name}, file '${self.co_filename}', ` +
        `line ${self.co_firstlineno || 1}>`
}

$B.code.tp_hash = function(self){
    return _b_.object.tp_hash(self)
}

$B.code.tp_new = function(cls, args, kw){
    return {
        ob_type: cls,
        dict: $B.empty_dict()
    }
}

var code_funcs = $B.code.tp_funcs = {}

code_funcs.__replace__ = function(self){
    $B.RAISE(_b_.NotImplementedError)
}

code_funcs.__sizeof__ = function(self){
    return 216
}

code_funcs._co_code_adaptive_get = function(self){
    return _b_.None
}

code_funcs._co_code_adaptive_set = _b_.None

code_funcs._varname_from_oparg = function(self){
    $B.RAISE(_b_.NotImplementedError)
}

code_funcs.co_argcount = function(self){
    return self.co_argcount
}

code_funcs.co_branches = function(self){
    console.log('get co branches', self)
}

code_funcs.co_cellvars_get = function(self){
    return self.co_cellvars
}

code_funcs.co_cellvars_set = _b_.None

code_funcs.co_code_get = function(self){
    return self.co_code
}

code_funcs.co_code_set = _b_.None

code_funcs.co_freevars_get = function(self){
    return self.co_freevars
}

code_funcs.co_freevars_set = _b_.None

code_funcs.co_lines = function(self){
    return _b_.NotImplemented
}

code_funcs.co_lnotab_get = function(self){
    return _b_.None
}

code_funcs.co_lnotab_set = _b_.None

code_funcs.co_positions = function(self){
    return self.co_positions()
}

code_funcs.co_varnames_get = function(self){
    return self.co_varnames
}

code_funcs.co_varnames_set = _b_.None

code_funcs.replace = function(self){
    var $ = $B.args('replace', 1, {self: null}, ['self'], arguments, {}, null, 'kw')
    var self = $.self
    var expected = ['co_argcount', 'co_branches', 'co_cellvars', 'co_code',
        'co_consts', 'co_exceptiontable', 'co_filename', 'co_firstlineno',
        'co_flags', 'co_freevars', 'co_kwonlyargcount', 'co_lines',
        'co_linetable', 'co_lnotab', 'co_name', 'co_names', 'co_nlocals',
        'co_positions', 'co_posonlyargcount', 'co_qualname', 'co_stacksize',
        'co_varnames']
    $B.set_expected_kwargs(self, expected, $.kw)
    return self
}

$B.code.tp_methods = [
    "__sizeof__", "co_lines", "co_branches", "co_positions", "replace",
    "_varname_from_oparg", "__replace__"
]

$B.code.tp_members = [
    ["co_argcount",        $B.TYPES.INT,     'co_argcount',        1],
    ["co_posonlyargcount", $B.TYPES.INT,     'co_posonlyargcount', 1],
    ["co_kwonlyargcount",  $B.TYPES.INT,     'co_kwonlyargcount',  1],
    ["co_stacksize",       $B.TYPES.INT,     'co_stacksize',       1],
    ["co_flags",           $B.TYPES.INT,     'co_flags',           1],
    ["co_nlocals",         $B.TYPES.INT,     'co_nlocals',         1],
    ["co_consts",          $B.TYPES.OBJECT, 'co_consts',          1],
    ["co_names",           $B.TYPES.OBJECT, 'co_names',           1],
    ["co_filename",        $B.TYPES.OBJECT, 'co_filename',        1],
    ["co_name",            $B.TYPES.OBJECT, 'co_name',            1],
    ["co_qualname",        $B.TYPES.OBJECT, 'co_qualname',        1],
    ["co_firstlineno",     $B.TYPES.INT,     'co_firstlineno',     1],
    ["co_linetable",       $B.TYPES.OBJECT, 'co_linetable',       1],
    ["co_exceptiontable",  $B.TYPES.OBJECT, 'co_exceptiontable',  1],
]

$B.code.tp_getset = [
    "co_lnotab", "_co_code_adaptive", "co_varnames", "co_cellvars", "co_freevars",
    "co_code"
]

/* code end */

$B.set_func_names(code, "builtins")

})(__BRYTHON__)