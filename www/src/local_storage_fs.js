// the function below can be used to create a file like object to read/write
// data to local storage.  This function overrides the builtin open function
function $local_storage_open( ) {
    // first argument is file : can be a string, or an instance of a DOM File object
    // other arguments : 
    // - mode can be 'r' (text, default) or 'rb' (binary)
    // - encoding if mode is 'rb'
    var $ns=__BRYTHON__.args('open',3,
        {file:null, mode:null, encoding:null},['file','mode','encoding'],
        arguments,{mode:'r',encoding:'utf-8'},'args','kw')
    for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
    if(args.length>0){var mode=args[0]}
    if(args.length>1){var encoding=args[1]}

    if (mode == 'rb' || mode == 'r') {
       if (localStorage[file] === undefined) {
          throw IOError.$factory('File not found: ' + file)
       }
       var $res=localStorage[file]
       var lines=$res.split('\n')
       var res=new Object(), counter=0;
       res.__enter__ = function(){return res}
       res.__exit__ = function(){return false}
       res.__getattr__ = function(attr){return res[attr]}
       res.__iter__ = function(){return iter(lines)}
       res.__len__ = function(){return lines.length}
       res.closed=false;
       res.readable = function() {return true}
       res.close = function() {res.closed=true}
       res.read=function(nb) {
           if (nb === undefined) {
              return $res
           } else {
             counter+=nb;
             return $res.substring(counter-nb, nb);
           }
       }
       res.readline = function(limit){
           if(res.closed){throw ValueError.$factory('I/O operation on closed file')}
           var line = ''
           if(limit===undefined||limit===-1){limit=null}
           while(true){
                if(counter>=$res.length-1){break}
                else{
                    var car = $res.charAt(counter)
                    if(car=='\n'){counter++;return line}
                    else{
                        line += car
                        if(limit!==null && line.length>=limit){return line}
                        counter++
                    }
                }
           }
           return line
       }
       res.readlines = function(hint){
            if(res.closed){throw ValueError.$factory('I/O operation on closed file')}
            var x = $res.substr(counter).split('\n')
            if(hint && hint!==-1){
                var y=[],size=0
                while(true){
                    var z = x.shift()
                    y.push(z)
                    size += z.length
                    if(size>hint || x.length==0){return y}
                }
            }else{return x}
       }
       res.seek = function(offset,whence){
            if(res.closed){throw ValueError.$factory('I/O operation on closed file')}
            if(whence===undefined){whence=0}
            if(whence===0){counter = offset}
            else if(whence===1){counter += offset}
            else if(whence===2){counter = $res.length+offset}
       }
       res.seekable = function(){return true}
       res.tell = function(){return counter}
       res.writeable = function(){return false}

       return res;
    } 

    if (mode == 'w' || mode == 'wb') {
       localStorage[file]='';
       var res=new Object();
       res.closed=false;
       res.writable = function() {return true}
       res.close = function() {res.closed=true}
       res.write=function(data) {
          localStorage[file]+=data;
       }
       return res;
    }

    throw IOError.$factory("Invalid mode: " + mode);
}
