;(function($B){

// Implementation of generators
//
// The original generator function is transformed into another function
// that returns iterators
//
// For each iteration at rank r, a function F(r) is run and returns a
// 2-element list : [value, yield_node_id] where value is the yielded value
// and yield_node_id identifies the node in the function tree structure where
// the value was yielded
//
// For the first iteration, the function F(0) is built from the original
// generator function
//
// For the iteration r+1 it is built from the function F(r), taking into
// account yield_node_id :
// - if it is the same as in the previous iteration, F(r+1) = F(r)
// - else the new function is built to run the rest of the function after the
//   yielding node

var _b_ = $B.builtins
var bltns = $B.InjectBuiltins()
eval(bltns)

// Class used for "return" inside a generator function
var $GeneratorReturn = {}
$B.generator_return = function(value){
    return {__class__: $GeneratorReturn, value: value}
}

$B.generator = $B.make_class("generator",
    function(func, name){
        // func is a Javascript generator, created by "function* "
        // name is the optional generator name (eg "zip" in 
        // py_builtin_functions.js)
        var res = function(){
            var gen = func.apply(null, arguments)
            gen.$name = name || 'generator'
            gen.$func = func
            gen.$has_run = false
            gen.__class__ = $B.generator
            if(func.$has_yield_in_cm){
                var locals = $B.last($B.frames_stack)[1]
                locals.$close_generators = locals.$close_generators || []
                locals.$close_generators.push(gen)
            }
            return gen
        }
        res.$infos = func.$infos
        res.$is_genfunc = true
        res.$name = name
        return res
    }
)

$B.generator.__iter__ = function(self){
    return self
}

$B.generator.__next__ = function(self){
    return $B.generator.send(self, _b_.None)
}

$B.generator.__str__ = function(self){
    return '<' + self.$name + ' object>'
}

$B.generator.close = function(self){
    try{
        $B.generator.$$throw(self, _b_.GeneratorExit.$factory())
    }catch(err){
        if(! $B.is_exc(err, [_b_.GeneratorExit, _b_.StopIteration])){
            throw _b_.RuntimeError.$factory("generator ignored GeneratorExit")
        }
    }
}

$B.generator.send = function(self, value){
    // Set attribute $has_run. It is used in py_utils.js/$B.leave_frame()
    // to decide if a generator with "yield" inside context managers must
    // be applied method .return()
    self.$has_run = true
    if(self.$finished){
        throw _b_.StopIteration.$factory(value)
    }
    if(self.gi_running === true){
        throw _b_.ValueError.$factory("generator already executing")
    }
    self.gi_running = true
    try{
        var res = self.next(value)
    }catch(err){
        self.$finished = true
        throw err
    }
    if(res.value && res.value.__class__ === $GeneratorReturn){
        self.$finished = true
        throw _b_.StopIteration.$factory(res.value.value)
    }
    self.gi_running = false
    if(res.done){
        throw _b_.StopIteration.$factory(res.value)
    }
    return res.value
}

$B.generator.$$throw = function(self, type, value, traceback){
    var exc = type

    if(exc.$is_class){
        if(! _b_.issubclass(type, _b_.BaseException)){
            throw _b_.TypeError.$factory("exception value must be an " +
                "instance of BaseException")
        }else if(value === undefined){
            exc = $B.$call(exc)()
        }else if(_b_.isinstance(value, type)){
            exc = value
        }
    }else{
        if(value === undefined){
            value = exc
        }else{
            exc = $B.$call(exc)(value)
        }
    }
    if(traceback !== undefined){exc.$traceback = traceback}
    var res = self.throw(exc)
    if(res.done){
        throw _b_.StopIteration.$factory("StopIteration")
    }
    return res.value
}

$B.set_func_names($B.generator, "builtins")

$B.async_generator = $B.make_class("async_generator",
    function(func){
        var f = function(){
            var res = func.apply(null, arguments)
            res.__class__ = $B.async_generator
            return res
        }
        return f
    }
)

var ag_closed = {}

$B.async_generator.__aiter__ = function(self){
    return self
}

$B.async_generator.__anext__ = function(self){
    return $B.async_generator.asend(self, _b_.None)
}

//$B.async_generator.__dir__ = generator.__dir__

$B.async_generator.aclose = function(self){
    self.$finished = true
    return _b_.None
}

$B.async_generator.asend = async function(self, value){
    if(self.$finished){
        throw _b_.StopAsyncIteration.$factory(value)
    }
    if(self.ag_running === true){
        throw _b_.ValueError.$factory("generator already executing")
    }
    self.ag_running = true
    try{
        var res = await self.next(value)
    }catch(err){
        self.$finished = true
        throw err
    }
    if(res.done){
        throw _b_.StopAsyncIteration.$factory(value)
    }
    if(res.value.__class__ === $GeneratorReturn){
        self.$finished = true
        throw _b_.StopAsyncIteration.$factory(res.value.value)
    }
    self.ag_running = false
    return res.value
}

$B.async_generator.athrow = async function(self, type, value, traceback){
    var exc = type

    if(exc.$is_class){
        if(! _b_.issubclass(type, _b_.BaseException)){
            throw _b_.TypeError.$factory("exception value must be an " +
                "instance of BaseException")
        }else if(value === undefined){
            value = $B.$call(exc)()
        }
    }else{
        if(value === undefined){
            value = exc
        }else{
            exc = $B.$call(exc)(value)
        }
    }
    if(traceback !== undefined){exc.$traceback = traceback}
    await self.throw(value)
}

$B.set_func_names($B.async_generator, "builtins")

function rstrip(s, strip_chars){
    var _chars = strip_chars || " \t\n";
    var nstrip = 0, len = s.length;
    while(nstrip < len && _chars.indexOf(s.charAt(len-1-nstrip)) > -1) nstrip ++;
    return s.substr(0, len-nstrip)
}

})(__BRYTHON__)
