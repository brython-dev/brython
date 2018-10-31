// Private interface to the profiling instrumentation implemented in py_utils.js.
// Uses local a copy of the eval function from py_builtin_functions.js

var $module=(function($B) {
    eval($B.InjectBuiltins());
    return {
        brython:$B,
        data:$B.$profile_data,
        start:$B.$profile.start,
        stop:$B.$profile.stop,
        pause:$B.$profile.pause,
        status:$B.$profile.status,
        clear:$B.$profile.clear,
        elapsed:$B.$profile.elapsed,
        run:function(src,_globals,_locals,nruns) {
            var current_frame = $B.frames_stack[$B.frames_stack.length-1]
            if(current_frame!==undefined){
                var current_locals_id = current_frame[0].replace(/\./,'_'),
             current_globals_id = current_frame[2].replace(/\./,'_')
            }

            var is_exec = true,
                leave = false

            // code will be run in a specific block
            var globals_id = '$profile_'+$B.UUID(),
             locals_id

             if(_locals===_globals){
                 locals_id = globals_id
             }else{
                 locals_id = '$profile_'+$B.UUID()
             }
             // Initialise the object for block namespaces
             eval('var $locals_'+globals_id+' = {}\nvar $locals_'+locals_id+' = {}')

             // Initialise block globals

            // A _globals dictionary is provided, set or reuse its attribute
            // globals_id
            _globals.globals_id = _globals.globals_id || globals_id
            globals_id = _globals.globals_id

            if(_locals === _globals || _locals === undefined){
                locals_id = globals_id
                parent_scope = $B.builtins_scope
            }else{
                // The parent block of locals must be set to globals
                parent_scope = {
                    id: globals_id,
                    parent_block: $B.builtins_scope,
                    binding: {}
                }
                for(var attr in _globals.$string_dict){
                    parent_scope.binding[attr] = true
                }
            }

            // Initialise block globals
            if(_globals.$jsobj){var items = _globals.$jsobj}
            else{var items = _globals.$string_dict}
            for(var item in items){
                item1 = to_alias(item)
                try{
                    eval('$locals_' + globals_id + '["' + item1 +
                        '"] = items[item]')
                }catch(err){
                    console.log(err)
                    console.log('error setting', item)
                    break
                }
            }

             // Initialise block locals
            var items = _b_.dict.items(_locals), item
            if(_locals.$jsobj){var items = _locals.$jsobj}
            else{var items = _locals.$string_dict}
            for(var item in items){
                item1 = to_alias(item)
                try{
                    eval('$locals_' + locals_id + '["' + item[0] + '"] = item[1]')
                }catch(err){
                    console.log(err)
                    console.log('error setting', item)
                    break
                }
            }
             //var nb_modules = Object.keys(__BRYTHON__.modules).length
             //console.log('before exec', nb_modules)

            console.log("call py2js", src, globals_id, locals_id, parent_scope)
            var root = $B.py2js(src, globals_id, locals_id, parent_scope),
                js, gns, lns

             try{

                 var js = root.to_js()

                     var i,res,gns;
                     for(i=0;i<nruns;i++) {
                         res = eval(js)
                         gns = eval('$locals_'+globals_id)
                     }

                     // Update _locals with the namespace after execution
                     if(_locals!==undefined){
                         var lns = eval('$locals_'+locals_id)
                         var setitem = getattr(_locals,'__setitem__')
                         for(var attr in lns){
                             if(attr.charAt(0)=='$'){continue}
                             setitem(attr, lns[attr])
                         }
                     }else{
                         for(var attr in lns){current_frame[1][attr] = lns[attr]}
                     }

                     if(_globals!==undefined){
                         // Update _globals with the namespace after execution
                         var setitem = getattr(_globals,'__setitem__')
                         for(var attr in gns){
                             if(attr.charAt(0)=='$'){continue}
                             setitem(attr, gns[attr])
                         }
                     }else{
                         for(var attr in gns){
                             current_frame[3][attr] = gns[attr]
                         }
                     }

                     // fixme: some extra variables are bleeding into locals...
                     /*  This also causes issues for unittests */
                     if(res===undefined) return _b_.None
                         return res
             }catch(err){
                 if(err.$py_error===undefined){throw $B.exception(err)}
                 throw err
             }finally{

                 delete __BRYTHON__.modules[globals_id]
                 delete __BRYTHON__.modules[locals_id]
                 $B.clear_ns(globals_id)
                 $B.clear_ns(locals_id)

                 if(!is_exec && leave_frame){
                     // For eval(), the finally clause with "leave_frame" was removed
                     // so we must execute it here
                     $B.frames_stack.pop()
                 }
             }
        }
    }
})(__BRYTHON__)
