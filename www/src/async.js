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
            if(err.$frame_obj){
                $B.frame_obj = err.$frame_obj
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
    // check if obj is an instance of Promise or supports the Thenable interface
    if(obj instanceof Promise || typeof obj.then == "function"){
        return obj
    }
    var awaitable = $B.$getattr(obj, '__await__', null)
    if(awaitable !== null){
        // must be an iterator
        awaitable = $B.$call(awaitable)()
        if($B.$getattr(awaitable, '__next__', null) === null){
            throw _b_.TypeError.$factory('__await__() returned non-iterator' +
                ` of type '${$B.class_name(awaitable)}'`)
        }
        return awaitable
    }
    throw _b_.TypeError.$factory(`object ${$B.class_name(obj)} ` +
        `can't be used in 'await' expression`)
}

})(__BRYTHON__)
