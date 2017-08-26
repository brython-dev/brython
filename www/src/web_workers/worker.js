// A worker script to execute python programs in a webworker


var S_CREATED = 0
var S_LOADING = 1
var S_LOADED = 2
var S_RUNNING = 3
var S_FINISHED = 4
var S_TERMINATED = 5

var get_base_url =  function() {
    var worker_url = self.location.href.split('/')
    worker_url.pop()
    worker_url.pop()
    return worker_url.join('/')
}

var init_brython = function(options) {
    // Get the base url where brython.js & al. are located
    var worker_url = self.location.href.split('/')
    worker_url.pop()
    worker_url.pop()
    var base_url = worker_url.join('/')
    
    // The following scripts make up the brython distribution
    var scripts = [
        '/brython_builtins.js', 
        '/version_info.js',
        '/py2js.js',
        '/py_object.js', 
        '/py_type.js', 
        '/py_utils.js',
        '/py_sort.js',
        '/py_builtin_functions.js', 
        '/py_exceptions.js',
        '/py_range_slice.js',
        '/py_bytes.js',
        '/py_set.js',
        '/js_objects.js',
        '/stdlib_paths.js',
        '/py_import.js',
        '/unicode.min.js',
        '/py_string.js',
        '/py_int.js', 
        '/py_long_int.js',
        '/py_float.js',
        '/py_complex.js',
        '/py_dict.js', 
        '/py_list.js',
        '/py_generator.js',
        '/py_dom.js',
        '/builtin_modules.js',
        '/py_import_hooks.js',
        '/async.js'
    ]
    
    self.__BRYTHON__ = { 
        isa_web_worker: true, 
        brython_path:base_url
    }
    
    // Determine which Brython scripts to load
    if (options.imports) scripts = options.imports;
    else if (options.import_dist) scripts = ['/brython_webworker_dist.js'];
        
    // Add the base urls 
    for(i=0;i<scripts.length;i++) scripts[i] = base_url+scripts[i]
    
    // Load the Brython scripts
    importScripts.apply(null,scripts)
    
    self.__BRYTHON__.brython(options)
    self.__BRYTHON__ = __BRYTHON__
    console.log("BRYTHON PATH", __BRYTHON__.brython_path)
}

var run_python = function(src, url) {
    self.__BRYTHON__._load_scripts([{
        name:'__main__',
        src:src,
        url:url
    }])
}

var wget = function(url) {
    var xhr = new XMLHttpRequest();
    if ( ! url.startsWith('http') && ! url.startsWith('/')) {
        url = get_base_url()+url;
    }
    xhr.open("GET", url, false);  // synchronous request
    xhr.send(null);
    if (xhr.status !== 200) {
        throw {
                message:'Error downloading '+url,
                status:xhr.status,
                response:xhr.responseText
        }
    }
    return xhr.responseText;
}

var init_os = function(data, $B) {
    var _b_=$B.builtins
    $B.__ENV = $B.jsobj2pyobj(data.env)
    $B.__WORKER = $B.jsobj2pyobj(self)
    $B.__WORKER_CLASS = data.worker_class
}

var start_handler = function(evt) {
    self.removeEventListener('message', start_handler);
    var prog = (evt.data.program.src === undefined) ? prog = wget(evt.data.program.url) : evt.data.program.src;
    evt.data.brython_options.args = evt.data.argv
    init_brython(evt.data.brython_options)
    init_os(evt.data, self.__BRYTHON__)
    self.postMessage({'type':'status', 'status':S_LOADED})
    run_python(prog, evt.data.program.url)
}
self.addEventListener('message', start_handler, false);
