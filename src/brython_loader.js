(function() {
    function import_file(path, pos) {
     
       // we will "import" each script individually so things can
       // be debugged much easier by programmers/developers.

       if (pos >= _files.length) {
          window.onload=function() {brython(_brython)}
          return
       }
      
       var _s = document.createElement('script')
       //_s.setAttribute('type', 'text/javascript')
       _s.setAttribute('src', path + _files[pos] + '.js')
       _s.onload=function() {import_file(path, pos+1)}

       document.head.appendChild(_s)
    }

    function parse_options(json_string) {
       if (json_string === undefined || json_string == null || json_string == '') {
          return {}
       }
          
       try {
         return JSON.parse(json_string)
       } catch(e) {
         console.log(e)   // display an error to show that options cannot be parsed.
       }

       return {}
    }

    var scripts = document.getElementsByTagName("script")
    //get last script that was executed (ie, this one!!!!!)
    var script = scripts[scripts.length-1]

    // read data-brython-options (or data-loader-options) if it exists..
    var _loader=parse_options(script.getAttribute("data-loader-options"))
    var _brython=parse_options(script.getAttribute("data-brython-options"))

    //figure out "root" path so we know where brython source file(s) are located
    var src = scripts[scripts.length-1].getAttribute("src")
    var _path =src.split('/')
    _path.pop()
    _path = _path.join('/') + '/'

    if (_loader.dist == true) {
       var _s = document.createElement('script');
       _s.src = _path + "brython_dist.js";
       _s.onload= function() { brython(_brython) };
       document.head.appendChild(_s);
       return
    }

    var _files=[]
    if (_loader.debug === undefined || _loader.debug==0) {  // just load brython.js
       _files.append("brython")
    } else {
      
       //import_file(_path,0)
        var py_files=['brython_builtins', 'version_info', 'identifiers_re',
                'py2js', 'py_object', 'py_type', 'py_utils',
                'py_generator', 'py_builtin_functions',
                'py_bytes', 'py_set', 'js_objects', 'stdlib_paths',
                'py_import', 'py_string', 'py_int', 'py_float', 
                'py_complex', 'py_dict', 'py_list', 'py_dom']


        for (var i=0; i < py_files.length; i++) {
            _files.push(py_files[i])
        }
    }  

    // look at other loader options to see if we can/should do something else.

    if (_loader.VFS && _loader.VFS == true) {
       _files.push('py_VFS')
    }

    import_file(_path,0)

})();
