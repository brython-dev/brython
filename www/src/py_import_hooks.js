;(function($B) {
  var _b_=$B.builtins,
      // Static binding in function closure needed for import hooks
      // to stick to builtin cache even if module is overriden in sys.modules
      $sys = $B.imported['_sys'];

  /**
   * [Import spec] [PEP 302] Brython import machinery
   * 
   * @param mod_name        {string}    name of module to load
   * @param origin          {string}    name of module context invoking the import
   * @param _path           {list}      Brython's None for top-level modules
   *                                    Value of parent package's __path__
   * @param module          {module}    [Optional] Existing module, for reload only
   */
  function import_hooks(mod_name, origin, _path, module) {
    // Default argument binding
    if (is_none(module)) {
        module = undefined;
    }

    var _meta_path=_b_.getattr($sys, 'meta_path');

    var spec = undefined;
    for (var i=0, _len_i = _meta_path.length; i < _len_i && is_none(spec); i++) {
        var _finder=_meta_path[i];
        spec=_b_.getattr(_b_.getattr(_finder, 'find_spec'),
                         '__call__')(_finder, mod_name, _path, undefined);
    } //for

    if (is_none(spec)) {
        // No import spec found
        throw _b_.ImportError(mod_name);
    }

    var _loader = _b_.getattr(spec, 'loader', _b_.None),
        _sys_modules = $B.imported,
        _spec_name = _b_.getattr(spec, 'name');
    // Import spec represents a match
    if (is_none(module)) {
        // Create module object
        if (!is_none(_loader)) {
            var create_module = _b_.getattr(_loader, 'create_module', _b_.None);
            if (!is_none(create_module)) {
                module = _b_.getattr(create_module, '__call__')(_loader, spec);
            }
        }
        if (is_none(module)) {
            // FIXME : Initialize __doc__ and __package__
            module = $B.$ModuleDict.$factory(mod_name);
            var mod_desc = _b_.getattr(spec, 'origin');
            if (_b_.getattr(spec, 'has_location')) {
                mod_desc = "from '" + mod_desc + "'";
            }
            else {
                mod_desc = '(' + mod_desc + ')';
            }
            module.toString = module.__repr__ = module.__str__ =
                    function(){return "<module '" + mod_name + "' " + mod_desc + ">"}
        }
    }
    module.__name__ = _spec_name;
    module.__loader__ = _loader;
    module.__package__ = _b_.getattr(spec, 'parent', '');
    module.__spec__ = spec;
    var locs = _b_.getattr(spec, 'submodule_search_locations');
    // Brython-specific var
    if (module.$is_package = !is_none(locs)) {
        module.__path__ = locs;
    }
    if (_b_.getattr(spec, 'has_location')) {
        module.__file__ = _b_.getattr(spec, 'origin')
        $B.$py_module_path[module.__name__] = module.__file__;
    }
    var cached = _b_.getattr(spec, 'cached');
    if (!is_none(cached)) {
        module.__cached__ = cached;
    }

    if (is_none(_loader)) {
        if (!is_none(locs)) {
            $B.modules[_spec_name] = _sys_modules[_spec_name] = module;
        }
        else {
            throw _b_.ImportError(mod_name);
        }
    }
    else {
        var exec_module = _b_.getattr(_loader, 'exec_module', _b_.None);
        if (is_none(exec_module)) {
            // FIXME : Remove !!! Backwards compat in CPython
            module = _b_.getattr(_b_.getattr(_loader, 'load_module'),
                                 '__call__')(_loader, _spec_name);
        }
        else {
            $B.modules[_spec_name] = _sys_modules[_spec_name] = module;
            try { _b_.getattr(exec_module, '__call__')(_loader, module) }
            catch (e) {
                delete $B.modules[_spec_name];
                delete _sys_modules[_spec_name];
                throw e;
           }
        }
    }

    return _sys_modules[_spec_name];
  }

window.import_hooks=import_hooks
})(__BRYTHON__)
