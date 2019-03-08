;(function($B) {
var _b_ = $B.builtins
  // Static binding in function closure needed for import hooks
  // to stick to builtin cache even if module is overriden in sys.modules
  //$sys = $B.imported['sys'];

/**
* [Import spec] [PEP 302] Brython import machinery
*
* @param mod_name        {string}    name of module to load
* @param origin          {string}    name of module context invoking the import
* @param _path           {list}      Brython's None for top-level modules
*                                    Value of parent package's __path__
* @param module          {module}    [Optional] Existing module, for reload only
*/
function import_hooks(mod_name, _path, module, blocking) {
// Default argument binding
if($B.is_none(module)){
    module = undefined
}

var _meta_path = $B.meta_path,
    _sys_modules = $B.imported,
    _loader,
    spec

for(var i = 0, len = _meta_path.length; i < len; i++){
    var _finder = _meta_path[i],
        find_spec = $B.$getattr(_finder, "find_spec", _b_.None)
    if(find_spec == _b_.None){
        // If find_spec is not defined for the meta path, try the legacy
        // method find_module()
        var find_module = $B.$getattr(_finder, "find_module", _b_.None)
        if(find_module !== _b_.None){
            _loader = find_module(mod_name, _path)
            // The loader has a method load_module()
            var load_module = $B.$getattr(_loader, "load_module")
            module = $B.$call(load_module)(mod_name)
            _sys_modules[mod_name] = module
            return module
        }
    }else{
        spec = find_spec(mod_name, _path, undefined, blocking)
        if(!$B.is_none(spec)){
            module = $B.imported[spec.name]
            if(module !== undefined){
                // If module of same name is already in imports, return it
                return _sys_modules[spec.name] = module
            }
            spec.blocking = blocking
            _loader = _b_.getattr(spec, "loader", _b_.None)
            break
        }
    }
}

if(_loader === undefined){
    // No import spec found
    var exc = _b_.ImportError.$factory("No module named " + mod_name)
    exc.name = mod_name
    throw exc
}

// Import spec represents a match
if($B.is_none(module)){
    var _spec_name = _b_.getattr(spec, "name")

    // Create module object
    if(!$B.is_none(_loader)){
        var create_module = _b_.getattr(_loader, "create_module", _b_.None)
        if(!$B.is_none(create_module)){
            module = $B.$call(create_module)(spec)
        }
    }
    if(module === undefined){throw _b_.ImportError.$factory(mod_name)}
    if($B.is_none(module)){
        // FIXME : Initialize __doc__ and __package__
        module = $B.module.$factory(mod_name)
        var mod_desc = _b_.getattr(spec, "origin")
        if(_b_.getattr(spec, "has_location")){
            mod_desc = "from '" + mod_desc + "'"
        }else{
            mod_desc = "(" + mod_desc + ")"
        }
    }
}
module.__name__ = _spec_name
module.__loader__ = _loader
module.__package__ = _b_.getattr(spec, "parent", "")
module.__spec__ = spec

var locs = _b_.getattr(spec, "submodule_search_locations")
// Brython-specific var
if(module.$is_package = !$B.is_none(locs)){
    module.__path__ = locs
}
if(_b_.getattr(spec, "has_location")){
    module.__file__ = _b_.getattr(spec, "origin")
    $B.$py_module_path[module.__name__] = module.__file__
}
var cached = _b_.getattr(spec, "cached")
if(! $B.is_none(cached)){
    module.__cached__ = cached
}

if($B.is_none(_loader)){
    if(!$B.is_none(locs)){
        _sys_modules[_spec_name] = module
    }else{
        throw _b_.ImportError.$factory(mod_name)
    }
}else{
    var exec_module = _b_.getattr(_loader, "exec_module", _b_.None)
    if($B.is_none(exec_module)){
        // FIXME : Remove !!! Backwards compat in CPython
        module = _b_.getattr(_loader, "load_module")(_spec_name)
    }else{
        _sys_modules[_spec_name] = module
        try{
            exec_module(module, blocking)
        }catch(e){
            delete _sys_modules[_spec_name]
            throw e
       }
    }
}
return _sys_modules[_spec_name]
}

$B.import_hooks = import_hooks
})(__BRYTHON__)
