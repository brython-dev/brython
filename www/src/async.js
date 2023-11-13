;(function($B) {

"use strict";

var _b_ = $B.builtins

var coroutine = $B.coroutine = $B.make_class("coroutine")

coroutine.close = function(self){}
coroutine.send = function(self){
    if(! $B.$isinstance(self, coroutine)){
        var msg = "object is not a coroutine"
        if(typeof self == "function" && self.$infos && self.$infos.__code__ &&
                self.$infos.__code__.co_flags & 128){
            msg += '. Maybe you forgot to call the async function ?'
        }
        throw _b_.TypeError.$factory(msg)
    }
    var res = self.$func.apply(null, self.$args)
    // restore frames after resolution
    res.then(function(){
        if(self.$frame_obj){
            $B.frame_obj = self.$frame_obj
        }
    }).
        catch(function(err){
            if(self.$frame_obj){
                $B.frame_obj = self.$frame_obj
            }
        })
    return res
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
        var args = arguments
        return {
            __class__: coroutine,
            $args: args,
            $func: func
        }
    }
    f.$infos = func.$infos
    f.$is_func = true
    f.$is_async = true
    return f
}

// "x = await coro" is translated into "x = await $B.promise(coro)"

$B.promise = function(obj){
    if(obj.__class__ === coroutine){
        // store current frames stack, to be able to restore it when the
        // promise resolves
        obj.$frame_obj = $B.frame_obj
        return coroutine.send(obj)
    }
    if(typeof obj == "function"){
        return obj()
    }
    if(obj instanceof Promise){
        return obj
    }
    // obj is a non-awaitable. Call an async function that awaits the object
    // and restores frame_obj before returning
    // cf. issue #2320
    var save_frame_obj = $B.frame_obj
    async function f(){
        await obj
        // restore frame obj
        $B.frame_obj = save_frame_obj
        return obj
    }
    f()
}

})(__BRYTHON__)
