var $module = (function($B){

var _b_ = $B.builtins
function js2py(js){
    switch(typeof js){
        case "object":
            if(js === null){
                return _b_.None
            }else if(Array.isArray(js)){
                var res = _b_.list.$factory()
                js.forEach(function(item){
                    res.push(js2py(item))
                })
            }else{
                var res = _b_.dict.$factory()
                Object.keys(js).forEach(function(key){
                    res.$string_dict[key] = js2py(js[key])
                })
            }
            return res
        default:
            return js
    }
}

return  {
    loads : function(){
        var $ = $B.args('loads', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return js2py(JSON.parse($.obj))
    },
    load : function(){
        var $ = $B.args('load', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return $module.loads(obj.$content);
    },
    dumps : function(){
        var $ = $B.args('dumps', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return JSON.stringify($B.pyobj2jsobj($.obj))
    }
}

})(__BRYTHON__)
