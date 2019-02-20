// multiprocessing
var $module = (function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}

var Process = {
    __class__:_b_.type,
    __mro__: [_b_.object],
    $infos:{
        __name__:'Process'
    },
    $is_class: true
}

var $convert_args=function(args) {
    var _list=[]
    for(var i=0, _len_i = args.length; i < _len_i; i++) {
      var _a=args[i]
      if(isinstance(_a, str)){_list.push("'"+_a+"'")} else {_list.push(_a)}
    }

    return _list.join(',')
}

Process.is_alive = function(self){return self.$alive}

Process.join = function(self, timeout){
   // need to block until process is complete
   // could probably use a addEventListener to execute all existing code
   // after this join statement

   self.$worker.addEventListener('message', function (e) {
        var data=e.data
        if (data.stdout != '') { // output stdout from process
           $B.stdout.write(data.stdout)
        }
   }, false);
}

Process.run = function(self){
   //fix me
}

Process.start = function(self){
   self.$worker.postMessage({target: self.$target,
                             args: $convert_args(self.$args),
                          //   kwargs: self.$kwargs
                           })
   self.$worker.addEventListener('error', function(e) { throw e})
   self.$alive=true
}

Process.terminate = function(self){
   self.$worker.terminate()
   self.$alive=false
}

// variables
//name
//daemon
//pid
//exitcode

Process. $factory = function(){
    //arguments group=None, target=None, name=None, args=(), kwargs=()

    var $ns=$B.args('Process',0,{},[],arguments,{},null,'kw')
    var kw=$ns['kw']

    var target=_b_.dict.get($ns['kw'],'target',None)
    var args=_b_.dict.get($ns['kw'],'args',tuple.$factory())

    var worker = new Worker('/src/web_workers/multiprocessing.js')

    var res = {
        __class__:Process,
        $worker: worker,
        name: $ns['name'] || None,
        $target: target+'',
        $args: args,
        //$kwargs: $ns['kw'],
        $alive: false
    }
    return res
}

$B.set_func_names(Process, "multiprocessing")

var Pool = $B.make_class("Pool")

Pool.__enter__ = function(self){}
Pool.__exit__ = function(self){}

Pool.__str__ = Pool.toString = Pool.__repr__=function(self){
   return '<object Pool>'
}

Pool.map = function(){

   var $ns=$B.args('Pool.map', 3,
       {self:null, func:null, fargs:null}, ['self', 'func', 'fargs'],
       arguments,{},'args','kw')
   var func=$ns['func']
   var fargs=$ns['fargs']

   var _results=[]

   fargs=iter(fargs)

   var _pos=0
   console.log(self.$processes)
   _workers=[]
   for(var i=0; i < self.$processes; i++) {
       _workers[i] = new Worker('/src/web_workers/multiprocessing.js')
       var arg

       try{arg=getattr(fargs, '__next__')()}
       catch(err) {
          if (err.__class__ !== _b_.StopIteration) throw err
       }
       console.log(arg)
       _workers[i].finished=false
       _workers[i].postMessage({target: func+'', pos: _pos,
                             args: $convert_args([arg])})
       _pos++

       _workers[i].addEventListener('message', function(e) {
           _results[e.data.pos]=e.data.result
           if (_results.length == args.length) return _results

           try {
               arg=getattr(fargs, '__next__')()
               e.currentTarget.postMessage({target: func+'', pos: _pos,
                                            args: $convert_args([arg])})
               _pos++
           } catch(err) {
               if (err.__class__ !== _b_.StopIteration) throw err
               this.finished=true
           }
       }, false);
   }
}

Pool.apply_async = function(){

   var $ns=$B.$MakeArgs('apply_async', 3,
       {self:null, func:null, fargs:null}, ['self', 'func', 'fargs'],
       arguments,{},'args','kw')
   var func=$ns['func']
   var fargs=$ns['fargs']

   fargs=iter(fargs)

   async_result = {}
   async_result.get=function(timeout){
                      console.log(results)
                      console.log(fargs)
                      return this.results}
   async_result.results=[]

   var _pos=0

   _workers=[]
   for(var i=0; i < self.$processes; i++) {
       _workers[i] = new Worker('/src/web_workers/multiprocessing.js')
       var arg

       try{arg=getattr(fargs, '__next__')()}
       catch(err) {
          if (err.__class__ !== _b_.StopIteration) throw err
       }
       //console.log(arg)
       //_workers[i].finished=false
       _workers[i].postMessage({target: func+'', pos: _pos,
                             args: $convert_args([arg])})
       _pos++

       _workers[i].addEventListener('message', function(e) {
           async_result.results[e.data.pos]=e.data.result
           //if (_results.length == args.length) return _results

           try {
               arg=getattr(fargs, '__next__')()
               e.currentTarget.postMessage({target: func+'', pos: _pos,
                                            args: $convert_args([arg])})
               _pos++
           } catch(err) {
               if (err.__class__ !== _b_.StopIteration) throw err
               this.finished=true
           }
       }, false);
   }

   console.log("return", async_result)
   return async_result
}

Pool.$factory = function(){
    console.log("pool")
    console.log(arguments)
    var $ns=$B.args('Pool',1,
        {processes:null},['processes'],arguments,{},'args','kw')
    //var kw=$ns['kw']

    var processes=$ns['processes']

    if (processes == None) {
       // look to see if we have stored cpu_count in local storage
       // maybe we should create a brython config file with settings,etc..??

       // if not there use a tool such as Core Estimator to calculate number of cpu's
       // http://eligrey.com/blog/post/cpu-core-estimation-with-javascript
    }

    console.log(processes)
    var res = {
        __class__:Pool,
        $processes:processes
    }
    return res
}

$B.set_func_names(Pool, "multiprocessing")

return {Process:Process, Pool:Pool}

})(__BRYTHON__)
