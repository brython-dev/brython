
self.addEventListener('message', function(ev){
    var reqs = [],
        running = true,
        found = []
    function callback(ev){
        req = ev.target
        if(req.readyState==4){
            if(req.status==200){
                found.push({name:req.module_name, 
                    url:req.responseURL, 
                    src:req.responseText})
            }else{
                found.push({name:req.module_name, 
                    url:req.responseURL,
                    src:null,
                    status:req.status})
            }
        }
    }
    for(var module_name in ev.data){
        var req = new XMLHttpRequest()
        req.onreadystatechange = callback
        req.module_name = module_name
        req.open('GET', ev.data[module_name].url, false)
        req.send()
    }
    postMessage(found)
}
)