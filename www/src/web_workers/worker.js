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
    
    var scripts = [
        '/brython.js',
        '/brython_stdlib.js'
    ]
    
    // Determine which Brython scripts to load
    if (options.imports) scripts = options.imports;
    else if (options.import_dist) scripts = ['/brython_webworker_dist.js'];
        
    // Add the base urls 
    for(i=0;i<scripts.length;i++) scripts[i] = base_url+scripts[i]
    
    // Load the Brython scripts
    importScripts.apply(null,scripts)
    
    self.__BRYTHON__.brython(options)
    if(options.indexedDB && __BRYTHON__.has_indexedDB &&
            __BRYTHON__.hasOwnProperty("VFS")){
        __BRYTHON__.tasks.push([__BRYTHON__.idb_open])
    }
    console.log("BRYTHON PATH", __BRYTHON__.brython_path + " " + base_url)
}

var run_python = function(src, url) {
    self.__BRYTHON__.run_script(src, '__main__', true)
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
    $B._ENV = $B.jsobj2pyobj(data.env)
    $B._WORKER = $B.jsobj2pyobj(self)
    $B._WORKER_CLASS = data.worker_class
}

var error_handler = function(evt) {
    if (evt.error !== undefined) {
        var err = self.__BRYTHON__.exception(evt.error)
        var name = self.__BRYTHON__.class_name(err)
        var trace = self.__BRYTHON__.builtins.getattr(err, 'info')
        trace += "\n" + name + ": " + err.args

        self.postMessage({'type':'status', 'status':S_TERMINATED, 'error':trace})
        self.close()
        evt.preventDefault()
    } else {
        // MDN says ErrorEvent.error is experimental and doesn't provide info about browser support;
        // however the actual specs don't say that
        console.warn("No error information available for worker error")
    }
}

self.addEventListener('error', error_handler, false);

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
