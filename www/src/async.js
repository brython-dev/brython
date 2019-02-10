;(function($B) {
var _b_ = $B.builtins

var coroutine = $B.coroutine = $B.make_class("coroutine")
var future = $B.make_class("future")

coroutine.close = function(self){}
coroutine.send = function(self){
    return self.$func.apply(null, self.$args)
}

$B.set_func_names(coroutine, "builtins")

$B.make_async = function(func){
    var f = function(){
        var args = arguments
        return {
            __class__: coroutine,
            $args: args,
            $func: func
        }
    }
    f.$infos = func.$infos
    return f
}

$B.promise = function(obj){
    if(obj.__class__ === $B.JSObject){
        return obj.js
    }else if(obj.__class__ === coroutine){
        return coroutine.send(obj)
    }
    if(typeof obj == "function"){
        return obj()
    }
    return obj
}

$B.awaitable = function(obj){
    if(obj instanceof Response){
        return $B.JSObject.$factory(obj)
    }
    return obj
}

})(__BRYTHON__)
