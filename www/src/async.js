;(function($B) {
var _b_ = $B.builtins
var awaitable = $B.make_class("awaitable")
var coroutine = $B.make_class("coroutine")

coroutine.close = function(self){}
coroutine.send = function(self){
    var res = self.$func()
    if(res.__class__ !== awaitable){
        throw _b_.StopIteration(res)
    }
}

$B.make_async = function(func){
    var res = function(){
        return {
            __class__: coroutine,
            $func: func,
            close: function(){},
            send: function(){
                var res = func()
                if(res.__class__ !== awaitable){
                    throw _b_.StopIteration(res)
                }
            }
        }
    }
    res.$infos = func.$infos
    return res
}

})(__BRYTHON__)
