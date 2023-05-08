;(function($B) {
var _b_ = $B.builtins

var coroutine = $B.coroutine = $B.make_class("coroutine")

coroutine.close = function(self){}
coroutine.send = function(self){
    if(! _b_.isinstance(self, coroutine)){
        var msg = "object is not a coroutine"
        if(typeof self == "function" && self.$infos && self.$infos.__code__ &&
                self.$infos.__code__.co_flags & 128){
            msg += '. Maybe you forgot to call the async function ?'
        }
        throw _b_.TypeError.$factory(msg)
    }
    var res = self.$func.apply(null, self.$args)
    // restore frames after resolution
    res.then(function(){if(self.$frames){$B.frames_stack = self.$frames}}).
        catch(function(err){if(self.$frames){$B.frames_stack = self.$frames}})
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
    return f
}

// "x = await coro" is translated into "x = await $B.promise(coro)"

$B.promise = function(obj){
    if(obj.__class__ === coroutine){
        // store current frames stack, to be able to restore it when the
        // promise resolves
        obj.$frames = $B.frames_stack.slice()
        return coroutine.send(obj)
    }
    if(typeof obj == "function"){
        return obj()
    }
    return obj
}

})(__BRYTHON__)
