(function() {
    var scripts = document.getElementsByTagName("script")
    //get last script that was executed (ie, this one!!!!!) and read 
    // data-brython-options if it exists..
    var options = scripts[scripts.length-1].getAttribute("data-brython-options")

    //figure out "root" path so we know where brython source file are located
    var src = scripts[scripts.length-1].getAttribute("src")
    var _path =src.split('/')
    _path.pop()
    _path = _path.join('/') + '/'

    var _obj

    if (options == null || options == '') {
       _obj={debug:0}
    } else {
       try {
         _obj=JSON.parse(options)
       } catch(e) {
         console.log(e)   // display an error to show that options cannot be parsed.
       }
    }

    if (_obj.debug == 0 || _obj.debug==1) {
       var _s = document.createElement('script');
       _s.src = _path + "brython_dist.js";
       _s.onload = function() { brython(_obj) };
       document.head.appendChild(_s);
    } else {  // we will "import" each script individually so things can
              // be debugged much easier by programmers/developers.

       var _files=['brython_builtins', 'version_info', 'identifiers_re',
                   'py2js', 'py_object', 'py_type', 'py_utils',
                   'py_generator', 'py_builtin_functions',
                   'py_bytes', 'py_set', 'js_objects', 'stdlib_paths',
                   'py_import', 'py_string', 'py_int', 'py_float', 
                   'py_complex', 'py_dict', 'py_list', 'py_dom']

       for (var i=0; i < _files.length; i++) {
           var _s = document.createElement('script');
           _s.src = _path + _files[i] + '.js'
           document.head.appendChild(_s);
       }

       document.body.onload = function() { brython(_obj) };
    } // end of if-else
})();
