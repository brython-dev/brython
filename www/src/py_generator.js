"use strict";
(function($B){

// Implementation of generators

var _b_ = $B.builtins

// Class used for "return" inside a generator function
var $GeneratorReturn = {}
$B.generator_return = function(value){
    return {
        ob_type: $GeneratorReturn,
        value: value
    }
}

$B.generator = $B.make_builtin_class("generator")
$B.generator.$factory = function(func, name){
    // func is a Javascript generator, created by "function* "
    // name is the optional generator name (eg "zip" in
    // py_builtin_functions.js)
    var res = function(){
        var gen = func.apply(null, arguments)
        gen.$name = name || 'generator'
        gen.$func = func
        gen.$has_run = false
        return {
            ob_type: $B.generator,
            js_gen: gen
        }
    }
    res.$infos = func.$infos
    res.$is_genfunc = true
    res.$name = name
    return res
}

$B.generator.tp_iter = function(self){
    return self
}

$B.generator.tp_iternext = function(self){
    return $B.generator.send(self, _b_.None)
}

$B.generator.tp_repr = function(self){
    var name = self.js_gen.$name || 'generator'
    if(self.js_gen.$func && self.js_gen.$func.$infos){
        name = self.js_gen.$func.$infos.__qualname__
    }
    return `<generator object ${name}>`
}

$B.generator.close = function(self){
    var save_frame_obj = $B.frame_obj
    if(self.$frame){
        $B.frame_obj = $B.push_frame(self.$frame)
    }
    try{
        $B.generator.throw(self, $B.EXC(_b_.GeneratorExit))
    }catch(err){
        if(! $B.is_exc(err, [_b_.GeneratorExit, _b_.StopIteration])){
            $B.frame_obj = save_frame_obj
            $B.RAISE(_b_.RuntimeError, "generator ignored GeneratorExit")
        }
    }
    $B.frame_obj = save_frame_obj
}

$B.generator.send = function(self, value){
    // Set attribute $has_run. It is used in py_utils.js/$B.leave_frame()
    // to decide if a generator with "yield" inside context managers must
    // be applied method .return()
    var gen = self.js_gen
    gen.$has_run = true
    if(gen.$finished){
        $B.RAISE(_b_.StopIteration, value)
    }
    if(gen.gi_running === true){
        $B.RAISE(_b_.ValueError, "generator already executing")
    }
    gen.gi_running = true
    // save frames before resuming the generator
    var save_frame_obj = $B.frame_obj
    // put generator frame on top of stack
    // generator expressions don't have $frame
    if(self.$frame){
        $B.frame_obj = $B.push_frame(self.$frame)
    }
    try{
        var res = gen.next(value)
    }catch(err){
        gen.$finished = true
        $B.frame_obj = save_frame_obj
        throw err
    }
    // Call leave_frame to handle context managers
    if($B.frame_obj !== null && $B.frame_obj.frame === self.$frame){
        $B.leave_frame()
    }
    // restore stack
    $B.frame_obj = save_frame_obj
    if(res.value && $B.exact_type(res.value, $GeneratorReturn)){
        gen.$finished = true
        $B.RAISE(_b_.StopIteration, res.value.value)
    }
    gen.gi_running = false
    if(res.done){
        $B.RAISE(_b_.StopIteration, res.value)
    }
    return res.value
}

$B.generator.throw = function(){
    var $ = $B.args('throw', 4,
                    {self: null, type: null, value: null, traceback: null},
                    ['self', 'type', 'value', 'traceback'],
                    arguments,
                    {value: _b_.None, traceback: _b_.None},
                    null, null),
        self = $.self,
        type = $.type,
        value = $.value,
        traceback = $.traceback
    var gen = self.js_gen,
        exc = type

    if(exc.$is_class){
        if(! _b_.issubclass(type, _b_.BaseException)){
            $B.RAISE(_b_.TypeError, "exception value must be an " +
                "instance of BaseException")
        }else if(value === undefined || value === _b_.None){
            exc = $B.$call(exc)
        }else if($B.$isinstance(value, type)){
            exc = value
        }
    }else{
        if(value === _b_.None){
            value = exc
        }else{
            exc = $B.$call(exc, value)
        }
    }
    if(traceback !== _b_.None){
        exc.$traceback = traceback
    }
    var save_frame_obj = $B.frame_obj
    if(self.$frame){
        $B.frame_obj = $B.push_frame(self.$frame)
    }
    var res = gen.throw(exc)
    $B.frame_obj = save_frame_obj
    if(res.done){
        $B.RAISE(_b_.StopIteration, res.value)
    }
    return res.value
}


$B.set_func_names($B.generator, "builtins")

$B.async_generator = $B.make_builtin_class("async_generator")
$B.async_generator.$factory = function(func){
    var f = function(){
        var gen = func.apply(null, arguments)
        var res = Object.create(null)
        res.ob_type = $B.async_generator
        res.js_gen = gen
        return res
    }
    return f
}

$B.async_generator.__aiter__ = function(self){
    return self
}

$B.async_generator.__anext__ = function(self){
    return $B.async_generator.asend(self, _b_.None)
}

//$B.async_generator.__dir__ = generator.__dir__

$B.async_generator.aclose = function(self){
    self.js_gen.$finished = true
    return _b_.None
}

$B.async_generator.asend = async function(self, value){
    var gen = self.js_gen
    if(gen.$finished){
        $B.RAISE(_b_.StopAsyncIteration, value)
    }
    if(gen.ag_running === true){
        $B.RAISE(_b_.ValueError, "generator already executing")
    }
    gen.ag_running = true
    // save frames before resuming the generator
    var save_frame_obj = $B.frame_obj
    // put generator frame on top of stack
    // generator expressions don't have $frame
    if(self.$frame){
        $B.frame_obj = $B.push_frame(self.$frame)
    }
    try{
        var res = await gen.next(value)
    }catch(err){
        gen.$finished = true
        $B.frame_obj = save_frame_obj
        throw err
    }
    // Call leave_frame to handle context managers
    if($B.frame_obj !== null && $B.frame_obj.frame === self.$frame){
        $B.leave_frame()
    }
    // restore stack
    $B.frame_obj = save_frame_obj
    if(res.done){
        $B.RAISE(_b_.StopAsyncIteration, value)
    }
    if($B.exact_type(res.value, $GeneratorReturn)){
        gen.$finished = true
        $B.RAISE(_b_.StopAsyncIteration, res.value.value)
    }
    gen.ag_running = false
    return res.value
}

$B.async_generator.athrow = async function(self, type, value, traceback){
    var gen = self.js_gen,
        exc = type

    if(exc.$is_class){
        if(! _b_.issubclass(type, _b_.BaseException)){
            $B.RAISE(_b_.TypeError, "exception value must be an " +
                "instance of BaseException")
        }else if(value === undefined){
            value = $B.$call(exc)
        }
    }else{
        if(value === undefined){
            value = exc
        }else{
            exc = $B.$call(exc, value)
        }
    }
    if(traceback !== undefined){exc.$traceback = traceback}
    var save_frame_obj = $B.frame_obj
    if(self.$frame){
        $B.frame_obj = $B.push_frame(self.$frame)
    }
    await gen.throw(value)
    $B.frame_obj = save_frame_obj
}


$B.set_func_names($B.async_generator, "builtins")

})(__BRYTHON__);
