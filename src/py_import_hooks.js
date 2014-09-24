var $B=__BRYTHON__
var _b_=$B.builtins

function import_hooks(mod_name, origin, package) {
    console.log("calling import_hooks")
    var module = {name:mod_name,__class__:$B.$ModuleDict}

    //mod_path = mod_name.replace(/\./g,'/')
    console.log($B.meta_path)
    console.log($B.path)
    for (var i=0; i < $B.meta_path.length; i++) {
        for (var j=0; j < $B.path.length; j++) {
            console.log('trying meta_path:' + $B.meta_path[i] + ' for path:' + $path[j])
            var _finder=$B.$class_constructor("finder", $B.meta_path[i], _b_.tuple([]), [],[])
            var _loader= _b_.getattr(_b_.getattr(_finder, 'find_module'), '__call__')(mod_name, $B.path[j])

            if (_loader == _b_.None) continue   // finder cannot handle this
            // we have a hit.. lets see if the loader can retrieve the module
            try {
              _module=_b_.getattr(_b_.getattr(_loader, 'load_module'), '__call__')(mod_name)
              // load_module should raise an exception if the module cannot be loaded.
              
              return $B.run_py({name: mod_name}, $B.path[j], _module) 
            } catch (e) {
              if (e.__name__ == 'ImportError') continue
              // this is a non ImportError, so it should be raised.

              throw e;
              
            } //try/catch
        }//for
    } //for
    return false
}
