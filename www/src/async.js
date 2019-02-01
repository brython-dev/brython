;(function($B) {
var _b_ = $B.builtins
var awaitable = $B.make_class("awaitable")
var coroutine = $B.coroutine = $B.make_class("coroutine")

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
    console.log("promise", obj)
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

})(__BRYTHON__)
