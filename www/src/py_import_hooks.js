;(function($B) {
  var _b_=$B.builtins

  function import_hooks(mod_name, origin, package) {
    var module = {name:mod_name,__class__:$B.$ModuleDict}

    //mod_path = mod_name.replace(/\./g,'/')
    $B.$import('sys', '__main__')
    var $globals=$B.vars['__main__']
    var sys=$globals['sys']
    var _meta_path=_b_.getattr(sys, 'meta_path')
    var _path=_b_.getattr(sys, 'path')
    for (var i=0, _len_i = _meta_path.length; i < _len_i; i++) {
        var _mp=_meta_path[i]
        for (var j=0, _len_j = _path.length; j < _len_j; j++) {
            try {
              var _finder= _b_.getattr(_mp, '__call__')(mod_name, _path[j])
              var _loader=_b_.getattr(_b_.getattr(_finder, 'find_module'), '__call__')()
            } catch (e) {
              if (e.__name__ == 'ImportError') { 
                 // this import hook won't work
                 // for this path, lets try the next path.
                 continue
              } else {
                throw e
              } 
            }

            if (_loader == _b_.None) continue   // finder cannot handle this
            // we have a hit.. lets see if the loader can retrieve the module
            return _b_.getattr(_b_.getattr(_loader, 'load_module'), '__call__')(mod_name)
        }//for
    } //for
    return null
  }

window.import_hooks=import_hooks
})(__BRYTHON__)
