;(function($B) {
var _b_ = $B.builtins
var awaitable = $B.make_class("awaitable")

$B.make_async = function(func){
    return function(){
        return {
            __repr__: function(){return '<coroutine object>'},
            __str__: function(){return '<coroutine object>'},
            send: function(){
                var res = func()
                if(res.__class__ !== awaitable.$dict){
                    throw _b_.StopIteration(res)
                }
            }
        }
    }
}

})(__BRYTHON__)
