;(function($B) {
var _b_ = $B.builtins

var coroutine = $B.coroutine = $B.make_class("coroutine")

coroutine.close = function(self){}
coroutine.send = function(self){
    // Set attribute $run_async of current module. This is to avoid calling
    // leave_frame() on the module, which would remove a wrong frame.
    //
    // The translation of a script ending with "aio.run(async_func())" ends
    // with
    //     if(!$locals.$run_async){$B.leave_frame()}
    // with leave_frame() popping the frame on top of $B.frames_stack
    //
    // Without this test on $run_async, $B.leave_frame() would be called when
    // the first "await" in async_func() is executed ; at this time, the top
    // frame is that of the async function currently executing, and
    // $leave_frame() would remove it, which is wrong.
    $B.last($B.frames_stack)[3].$run_async = true

    return self.$func.apply(null, self.$args)
}

$B.set_func_names(coroutine, "builtins")

$B.make_async = func => {
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

// "x = await coro" is translated into "x = await $B.promise(coro)"

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

})(__BRYTHON__)
