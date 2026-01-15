;(function($B) {

"use strict";

var _b_ = $B.builtins

var coroutine = $B.coroutine



/* coroutine start */
coroutine.tp_repr = function(self){
    if(self.$func.$function_infos){
        return "<coroutine " + self.$func.$function_infos[$B.func_attrs.name] + ">"
    }else{
        return "<coroutine object>"
    }
}

$B.coroutine.tp_finalize = function(self){

}

$B.coroutine.am_await = function(self){

}

var coroutine_funcs = $B.coroutine.tp_funcs = {}

coroutine_funcs.__class_getitem__ = function(self){

}

coroutine_funcs.__name___get = function(self){

}

coroutine_funcs.__name___set = function(self){

}

coroutine_funcs.__qualname___get = function(self){

}

coroutine_funcs.__qualname___set = function(self){

}

coroutine_funcs.__sizeof__ = function(self){

}

coroutine_funcs.close = function(self){
    self.$sent = true // avoids RuntimeWarning
}

coroutine_funcs.cr_await_get = function(self){

}

coroutine_funcs.cr_await_set = function(self){

}

coroutine_funcs.cr_code_get = function(self){

}

coroutine_funcs.cr_code_set = function(self){

}

coroutine_funcs.cr_frame_get = function(self){

}

coroutine_funcs.cr_frame_set = function(self){

}

coroutine_funcs.cr_origin = function(self){

}

coroutine_funcs.cr_running_get = function(self){

}

coroutine_funcs.cr_running_set = function(self){

}

coroutine_funcs.cr_suspended_get = function(self){

}

coroutine_funcs.cr_suspended_set = function(self){

}

coroutine_funcs.send = function(self){
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

coroutine_funcs.throw = function(self){

}

$B.coroutine.tp_methods = ["send", "throw", "close", "__sizeof__"]

$B.coroutine.classmethods = ["__class_getitem__"]

$B.coroutine.tp_members = ["cr_origin"]

$B.coroutine.tp_getset = ["__name__", "__qualname__", "cr_await", "cr_running", "cr_frame", "cr_code", "cr_suspended"]

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
        return coroutine.tp_funcs.send(obj)
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
