;(function($B) {
var _b_ = $B.builtins

var coroutine = $B.coroutine = $B.make_class("coroutine")

coroutine.close = function(self){}
coroutine.send = function(self){
    return self.$func.apply(null, self.$args)
}
coroutine.__repr__ = coroutine.__str__ = function(self){
    if(self.$func.$infos){
        return "<coroutine " + self.$func.$infos.__name__ + ">"
    }else{
        return "<coroutine object>"
    }
}

$B.set_func_names(coroutine, "builtins")

$B.make_async = func => {
    if(func.$is_genfunc){
        return func
    }
    var f = function(){
        var args = arguments,
            stack = $B.deep_copy($B.frames_stack)
        return {
            __class__: coroutine,
            $args: args,
            $func: func,
            $stack: stack
        }
    }
    f.$infos = func.$infos
    return f
}

// "x = await coro" is translated into "x = await $B.promise(coro)"

$B.promise = function(obj){
    if(obj.__class__ === coroutine){
        return coroutine.send(obj)
    }
    if(typeof obj == "function"){
        return obj()
    }
    return obj
}

})(__BRYTHON__)
