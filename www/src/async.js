;(function($B) {

"use strict";

var _b_ = $B.builtins

var coroutine = $B.coroutine = $B.make_builtin_class("coroutine")

coroutine.close = function(self){
    self.$sent = true // avoids RuntimeWarning
}

coroutine.send = function(self){
    self.$sent = true
    if(! $B.$isinstance(self, coroutine)){
        var msg = "object is not a coroutine"
        if(typeof self == "function" && self.$function_infos &&
                self.$function_infos[$B.func_attrs.flags] & 128){
            msg += '. Maybe you forgot to call the async function ?'
        }
        $B.RAISE(_b_.TypeError, msg)
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

coroutine.tp_repr = function(self){
    if(self.$func.$function_infos){
        return "<coroutine " + self.$func.$function_infos[$B.func_attrs.name] + ">"
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
        var res = {
            ob_type: coroutine,
            $args: args,
            $func: func
        }
        if($B.frame_obj !== null){
            var frame = $B.frame_obj.frame
            frame.$coroutine = res
            res.$lineno = frame.$lineno
        }
        return res
    }
    f.$function_infos = func.$function_infos
    f.$is_func = true
    f.$is_async = true
    f.$args_parser = func.$args_parser
    return f
}

// "x = await coro" is translated into "x = await $B.promise(coro)"

$B.promise = function(obj){
    if($B.exact_type(obj, coroutine)){
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
        // store current frames stack, to be able to restore it when the
        // promise resolves
        obj.frame_obj = $B.frame_obj
        return obj.then(function(x){
            $B.frame_obj = obj.frame_obj
            return $B.jsobj2pyobj(x)
        }).catch(function(err){
            $B.frame_obj = obj.frame_obj
            throw $B.exception(err)
        })
    }
    var awaitable = $B.$getattr(obj, '__await__', null)
    if(awaitable !== null){
        // must be an iterator
        awaitable = $B.$call(awaitable)
        if($B.$getattr(awaitable, '__next__', null) === null){
            $B.RAISE(_b_.TypeError, '__await__() returned non-iterator' +
                ` of type '${$B.class_name(awaitable)}'`)
        }
        return awaitable
    }
    $B.RAISE(_b_.TypeError, `object ${$B.class_name(obj)} ` +
        `can't be used in 'await' expression`)
}

})(__BRYTHON__);
