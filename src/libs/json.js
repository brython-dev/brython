var $module = (function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

//for(var $py_builtin in _b_) eval("var "+$py_builtin+"=_b_[$py_builtin]")

function _py(obj){
    if(obj===null){return None}
    if(isinstance(obj,list)){
        var res = []
        for(var i=0;i<obj.length;i++){
            res.push(_py(obj[i]))
        }
        return res
    }
    if(obj.__class__!==undefined){
        if(obj.__class__===list){
            for(var i=0;i<obj.length;i++){
                obj[i] = _py(obj[i])
            }
        }
        return obj
    }
    if(typeof obj==='object' && obj.__class__===undefined){
        // transform JS object into a Python dict
        var res = dict()
        for(var attr in obj){
            getattr(res,'__setitem__')(attr,_py(obj[attr]))
        }
        return res
    }
    return $B.JSObject(obj)
}
function _js(obj){
    // obj is a Python object
    if (isinstance(obj,[int,str])) return obj
    if(obj===None) return null
    if(obj===True) return true
    if(obj===False) return false
    if(isinstance(obj,float)) return obj.value
    if(isinstance(obj,[list,tuple])){
        var res = []
        for(var i=0;i<obj.length;i++){res.push(_js(obj[i]))}
        return res
    }
    if(isinstance(obj,dict)){
        var res = new Object()
        for(var i=0;i<obj.$keys.length;i++){
            res[_js(obj.$keys[i])]=_js(obj.$values[i])
        }
        return res
    }
    throw _b_.TypeError(str(obj)+' is not JSON serializable')
}

return  {
    loads : function(json_obj){return _py(JSON.parse(json_obj))},
    dumps : function(obj){return JSON.stringify(_js(obj))},
}

})(__BRYTHON__)
