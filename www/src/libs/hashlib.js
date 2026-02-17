(function($B){

var _b_ = $B.builtins

var block_size = {
    md5: 64,
    sha1: 64,
    sha224: 64,
    sha256: 64,
    sha384: 128,
    sha512: 128
}

var $mod = {

    __getattr__ : function(attr){
        if(attr == 'new'){
            return hash.$factory
        }
        throw $B.attr_error(attr, $mod)
    },
    md5: function(obj){return hash.$factory('md5', obj)},
    sha1: function(obj){return hash.$factory('sha1', obj)},
    sha224: function(obj){return hash.$factory('sha224', obj)},
    sha256: function(obj){return hash.$factory('sha256', obj)},
    sha384: function(obj){return hash.$factory('sha384', obj)},
    sha512: function(obj){return hash.$factory('sha512', obj)},

    algorithms_guaranteed: ['md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
    algorithms_available:  ['md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512']
}

//todo: eventually move this function to a "utility" file or use ajax module?
function $get_CryptoJS_lib(alg){
    if($B.VFS !== undefined && $B.VFS.hashlib){
        // use file in brython_stdlib.js
        var lib = $B.VFS["crypto_js.rollups." + alg]
        if (lib === undefined){
            $B.RAISE(_b_.ImportError, "can't import hashlib." + alg)
        }
        var res = lib[1]
        try{
            eval(res + "; $B.CryptoJS = CryptoJS;")
            return
        }catch(err){
            throw Error("JS Eval Error",
                "Cannot eval CryptoJS algorithm '" + alg + "' : error:" + err)
        }
    }

    var module = {__name__: 'CryptoJS', $is_package: false}
    var res = $B.$download_module(module, 
        $B.brython_path + 'libs/crypto_js/rollups/' + alg + '.js')

    try{
        eval(res + "; $B.CryptoJS = CryptoJS;")
    }catch(err){
        throw Error("JS Eval Error",
            "Cannot eval CryptoJS algorithm '" + alg + "' : error:" + err)
    }
}

function bytes2WordArray(obj){
    // Transform a bytes object into an instance of class WordArray
    // defined in CryptoJS
    if(!$B.$isinstance(obj, _b_.bytes)){
        throw _b_.TypeError("expected bytes, got " + $B.class_name(obj))
    }

    var words = []
    for(var i = 0; i < obj.source.length; i += 4){
        var word = obj.source.slice(i, i + 4)
        while(word.length < 4){word.push(0)}
        var w = word[3] + (word[2] << 8) + (word[1] << 16) + (word[0] << 24)
        words.push(w)
    }
    return {words: words, sigBytes: obj.source.length}
}

var hash = $B.make_type('hash')

hash.$factory = function(alg, obj) {
    var res = {
        ob_type: hash,
        dict: $B.empty_dict()
    }

    switch(alg) {
      case 'md5':
      case 'sha1':
      case 'sha224':
      case 'sha256':
      case 'sha384':
      case 'sha512':
        var ALG = alg.toUpperCase()
        if($B.Crypto === undefined ||
                $B.CryptoJS.algo[ALG] === undefined){
            $get_CryptoJS_lib(alg)
        }
        var _hash = $B.CryptoJS.algo[ALG].create()
        if(obj !== undefined){
            _hash.update(bytes2WordArray(obj))
        }
        $B.str_dict_set(res.dict, 'hash', _hash)
        break
      default:
        $B.RAISE_ATTRIBUTE_ERROR('Invalid hash algorithm: ' + alg, obj, alg)
    }
    $B.str_dict_set(res.dict, 'digest_size', _hash._hash.sigBytes)
    $B.str_dict_set(res.dict, 'block_size', block_size[alg])
    return res
}

hash.tp_new = function(cls, ...args){
    var obj = hash.$factory(...args)
    obj.ob_type = cls
    return obj
}

var hash_funcs = hash.tp_funcs = {}

hash_funcs.update = function(self, msg){
    $B.str_dict_get(self.dict, 'hash').update(bytes2WordArray(msg))
}

hash_funcs.copy = function(self){
    return $B.str_dict_get(self.dict, 'hash').clone()
}

hash_funcs.digest = function(self){
    var hash_value = $B.str_dict_get(self.dict, 'hash')
    var obj = hash_value.clone().finalize().toString(),
        res = []
    for(var i = 0; i < obj.length; i += 2){
        res.push(parseInt(obj.substr(i, 2), 16))
    }
    return _b_.bytes.$factory(res)
}

hash_funcs.hexdigest = function(self) {
    return $B.str_dict_get(self.dict, 'hash').clone().finalize().toString()
}


hash.tp_methods = ["copy", "digest", "hexdigest", "update"]

$B.finalize_type(hash)

$B.addToImported('hashlib', $mod)

})(__BRYTHON__)
