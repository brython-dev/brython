var $module=(function($B){

var _b_ = $B.builtins

var $s = []
for(var $b in _b_){$s.push('var ' + $b +' = _b_["'+$b+'"]')}
eval($s.join(';'))

var $mod = {

    __getattr__ : function(attr){
        if(attr == 'new'){return hash.$factory}
        return this[attr]
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
    if($B.VFS !== undefined){
        // use file in brython_stdlib.js
        var lib = $B.VFS["crypto_js.rollups." + alg]
        if (lib===undefined){
            throw _b_.ImportError.$factory("can't import hashlib." + alg)
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
    var res = $B.$download_module(module, $B.brython_path + 'libs/crypto_js/rollups/' + alg + '.js');

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
    if(!_b_.isinstance(obj, _b_.bytes)){
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

var hash = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    $infos:{
        __name__: 'hash'
    }
}

hash.update = function(self, msg){
    self.hash.update(bytes2WordArray(msg))
}

hash.copy = function(self){
    return self.hash.clone()
}

hash.digest = function(self){
    var obj = self.hash.clone().finalize().toString(),
        res = []
    for(var i = 0; i < obj.length; i += 2){
        res.push(parseInt(obj.substr(i, 2), 16))
    }
    return _b_.bytes.$factory(res)
}

hash.hexdigest = function(self) {
    return self.hash.clone().finalize().toString()
}

hash.$factory = function(alg, obj) {
    var res = {
        __class__: hash
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
            $B.CryptoJS.algo[ALG] === undefined){$get_CryptoJS_lib(alg)}

        res.hash = $B.CryptoJS.algo[ALG].create()
        if(obj !== undefined){
            res.hash.update(bytes2WordArray(obj))
        }
        break
      default:
        throw $B.builtins.AttributeError.$factory('Invalid hash algorithm: ' + alg)
    }

    return res
}

return $mod

})(__BRYTHON__)
