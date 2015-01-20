var $module = (function($B){

eval($B.InjectBuiltins())

/*
function _py(obj){
    switch(obj) {
      case null:
        return None
      case true:
        return True
      case false:
        return False
    }

    if(isinstance(obj,list)){
        var res = []
        for(var i=0, _len_i = obj.length; i < _len_i;i++){
            res.push(_py(obj[i]))
        }
        return res
    }

    if(obj.__class__!==undefined){
        if(obj.__class__===list){
          for(var i=0, _len_i = obj.length; i < _len_i;i++){
              obj[i] = _py(obj[i])
          }
          return obj
        }
        return obj
    }

    if(obj._type_ === 'iter') { // this is an iterator
       return _b_.iter(obj.data)
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
    switch(obj) {
      case None:
        return null
      case True:
        return true
      case False:
        return false
    }

    if(isinstance(obj,[int,str])) return obj
    if(isinstance(obj,float)) return obj.value
    if(isinstance(obj,[list,tuple])){
        var res = []
        for(var i=0, _len_i = obj.length; i < _len_i;i++){res.push(_js(obj[i]))}
        return res
    }
    if(isinstance(obj,dict)){
        var res = {}
        var items = _b_.list(_b_.dict.$dict.items(obj))
        for(var i=0, _len_i = items.length; i < _len_i;i++){
            res[_js(items[i][0])]=_js(items[i][1])
        }
        return res
    }

    if (hasattr(obj, '__iter__')) {
       // this is an iterator..
       var _a=[]
       while(1) {
          try {
            _a.push(_js(next(obj)))
          } catch(err) {
            if (err.__name__ !== "StopIteration") throw err
            break
          }
       }
       return {'_type_': 'iter', data: _a}
    }

    if (hasattr(obj, '__getstate__')) {
       return getattr(obj, '__getstate__')()
    }
    if (hasattr(obj, '__dict__')) {
       return _js(getattr(obj, '__dict__'))
    }
    throw _b_.TypeError(str(obj)+' is not JSON serializable')
}
*/
return  {
    loads : function(json_obj){return $B.jsobject2pyobject(JSON.parse(json_obj))},
    dumps : function(obj){return JSON.stringify($B.pyobject2jsobject(obj))},
}

})(__BRYTHON__)
