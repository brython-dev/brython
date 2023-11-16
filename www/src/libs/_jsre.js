(function($B){

    var _b_ = $B.builtins

    var MatchObject = $B.make_class("Match",
        function(jsmatch, string, pattern){
            return {
                __class__: MatchObject,
                jsmatch: jsmatch,
                string: string
            }
        }
    )
    MatchObject.item = function(self, rank){
        return self.jsmatch[rank]
    }
    MatchObject.group = function(self){
        var res = []
        for(var i = 0, _len_i = arguments.length; i < _len_i; i++){
            if(self.jsmatch[arguments[i]] === undefined){res.push(_b_.None)}
            else{res.push(self.jsmatch[arguments[i]])}
        }
        if(arguments.length == 1){return res[0]}
        return _b_.tuple.$factory(res)
    }
    MatchObject.groups = function(self, _default){
        if(_default === undefined){_default = _b_.None}
        var res = []
        for(var i = 1, _len_i = self.length; i < _len_i; i++){
            if(self.jsmatch[i] === undefined){res.push(_default)}
            else{res.push(self.jsmatch[i])}
        }
        return _b_.tuple.$factory(res)
    }
    MatchObject.start = function(self){
        return self.index
    }
    MatchObject.end = function(self){
        return self.length - self.index
    }

    $B.set_func_names(MatchObject, '_jsre')

    var obj = {
        __str__: function(){return "<module 're'>"}
    }
    obj.A = obj.ASCII = 256
    obj.I = obj.IGNORECASE = 2 // 'i'
    obj.L = obj.LOCALE = 4
    obj.M = obj.MULTILINE = 8 // 'm'
    obj.S = obj.DOTALL = 16
    obj.U = obj.UNICODE = 32
    obj.X = obj.VERBOSE = 64
    obj._is_valid = function(pattern) {
        if ($B.$options.re == 'pyre'){return false}  //force use of python's re module
        if ($B.$options.re == 'jsre'){return true}   //force use of brythons re module
        // FIXME: Improve

        if(! $B.$isinstance(pattern, _b_.str)){
           // this is probably a SRE_PATTERN, so return false, and let
           // python's re module handle this.
           return false
        }
        var is_valid = false
        try{
            new RegExp(pattern)
            is_valid = true
        }
        catch(e){}
        if(! is_valid){return false}  //if js won't parse the pattern return false

        // using reference http://www.regular-expressions.info/
        // to compare python re and javascript regex libraries

        // look for things javascript does not support
        // check for name capturing group
        var mylist = ['?P=', '?P<', '(?#', '(?<=', '(?<!', '(?(']
        for(var i = 0, _len_i = mylist.length; i < _len_i; i++) {
           if (pattern.indexOf(mylist[i]) > -1) return false
        }

        var re_list=['\{,\d+\}']
        for(var i=0, _len_i = re_list.length; i < _len_i; i++) {
           var _re = new RegExp(re_list[i])
           if (_re.test(pattern)){return false}
        }

        // it looks like the pattern has passed all our tests so lets assume
        // javascript can handle this pattern.
        return true
    }
    var $SRE_PatternDict = {
        __class__:_b_.type,
        $infos:{
            __name__:'SRE_Pattern'
        }
    }
    $SRE_PatternDict.__mro__ = [_b_.object]
    $SRE_PatternDict.findall = function(self, string){
        return obj.findall(self.pattern, string, self.flags)
    }
    $SRE_PatternDict.finditer = function(self, string){
        return obj.finditer(self.pattern, string, self.flags)
    }
    $SRE_PatternDict.match = function(self, string){
        return obj.match(self.pattern, string, self.flags)
    }
    $SRE_PatternDict.search = function(self, string){
        return obj.search(self.pattern, string, self.flags)
    }
    $SRE_PatternDict.sub = function(self,repl,string){
        return obj.sub(self.pattern,repl,string,self.flags)
    }
    $B.set_func_names($SRE_PatternDict, "_jsre")
    // TODO: groups
    // TODO: groupindex
    function normflags(flags){
        return ((flags & obj.I)? 'i' : '') + ((flags & obj.M)? 'm' : '');
    }
    // TODO: fullmatch()
    // TODO: split()
    // TODO: subn()
    obj.compile = function(pattern, flags){
        return {
            __class__: $SRE_PatternDict,
            pattern: pattern,
            flags: normflags(flags)
        }
    }
    obj.escape = function(string){
        // Escape all the characters in pattern except ASCII letters, numbers
        // and '_'. This is useful if you want to match an arbitrary literal
        // string that may have regular expression metacharacters in it.
        var res = ''
        var ok = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
        for(var i = 0, _len_i = string.length; i < _len_i; i++){
            if(ok.search(string.charAt(i))>-1){res += string.charAt(i)}
        }
        return res
    }
    obj.findall = function(pattern, string, flags){
        var $ns=$B.args('re.findall', 2,
            {pattern:null, string:null}, ['pattern', 'string'],
            arguments,{}, 'args', 'kw') ,
            args = $ns['args'] ,
            _flags = 0;
        if(args.length>0){var flags = args[0]}
        else{var _flags = $B.$getattr($ns['kw'], 'get')('flags', 0)}

        var flags = normflags()
        flags += 'gm'
        var jsp = new RegExp(pattern,flags),
            jsmatch = string.match(jsp)
        if(jsmatch === null){return []}
        return jsmatch
    }
    obj.finditer = function(pattern, string, flags){
        var $ns=$B.args('re.finditer', 2,
            {pattern:null, string:null}, ['pattern', 'string'],
            arguments,{},'args','kw'),
            args = $ns['args'],
            _flags = 0;
        if(args.length>0){var flags=args[0]}
        else{var _flags = $B.$getattr($ns['kw'], 'get')('flags', 0)}

        var flags = normflags()
        flags += 'gm'
        var jsp = new RegExp(pattern, flags),
            jsmatch = string.match(jsp);
        if(jsmatch === null){return []}

        var _list = []
        for(var j = 0, _len_j = jsmatch.length; j < _len_j; j++) {
            var mo = {}
            mo._match=jsmatch[j]
            mo.group = function(){
               var res = []
               for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                   if(jsmatch[arguments[i]] === undefined){res.push(_b_.None)}
                   else{res.push(jsmatch[arguments[i]])}
               }
               if(arguments.length == 1){return res[0]}
               return _b_.tuple.$factory(res)
            }
            mo.groups = function(_default){
               if(_default === undefined){_default = _b_.None}
               var res = []
               for(var i = 1, _len_i = jsmatch.length; i < _len_i; i++){
                  if(jsmatch[i] === undefined){res.push(_default)}
                  else{res.push(jsmatch[i])}
               }
               return _b_.tuple.$factory(res)
            }
            mo.start = function(){return mo._match.index}
            mo.end = function(){return mo._match.length - mo._match.index}
            mo.string = string
            _list.push(mo)
        }
        return _list
    }
    obj.search = function(pattern, string){
        var $ns = $B.args('re.search', 2,
            {pattern:null, string:null},['pattern', 'string'],
            arguments, {}, 'args', 'kw')
        var args = $ns['args']
        if(args.length>0){var flags = args[0]}
        else{var flags = $B.$getattr($ns['kw'], 'get')('flags', '')}
        flags = normflags(flags)
        var jsp = new RegExp(pattern, flags)
        var jsmatch = string.match(jsp)
        if(jsmatch === null){return _b_.None}
        return MatchObject.$factory(jsmatch, string, pattern)
    }
    obj.sub = function(pattern, repl, string){
        var $ns=$B.args('re.search', 3,
            {pattern: null, repl: null, string: null},
            ['pattern', 'repl', 'string'],
            arguments,{}, 'args', 'kw')
        for($var in $ns){eval("var " + $var + "=$ns[$var]")}
        var args = $ns['args']
        var count = _b_.dict.get($ns['kw'], 'count', 0)
        var flags = _b_.dict.get($ns['kw'], 'flags', '')
        if(args.length > 0){var count = args[0]}
        if(args.length > 1){var flags = args[1]}
        flags = normflags(flags)
        if(typeof repl == "string"){
            // backreferences are \1, \2... in Python but $1,$2... in Javascript
            repl = repl.replace(/\\(\d+)/g, '$$$1')
        }else if(typeof repl == "function"){
            // the argument passed to the Python function is the match object
            // the arguments passed to the Javascript function are :
            // - the matched substring
            // - the matched groups
            // - the offset of the matched substring inside the string
            // - the string being examined
            var $repl1 = function(){
                var mo = Object()
                mo.string = arguments[arguments.length - 1]
                var matched = arguments[0];
                var start = arguments[arguments.length - 2]
                var end = start + matched.length
                mo.start = function(){return start}
                mo.end = function(){return end}
                groups = []
                for(var i = 1, _len_i = arguments.length-2; i < _len_i; i++){
                    groups.push(arguments[i])
                }
                mo.groups = function(_default){
                    if(_default === undefined){_default = _b_.None}
                    var res = []
                    for(var i = 0, _len_i = groups.length; i < _len_i; i++){
                        if(groups[i] === undefined){res.push(_default)}
                        else{res.push(groups[i])}
                    }
                    return res
                }
                mo.group = function(i){
                    if(i==0){return matched}
                    return groups[i-1]
                }
                return repl(mo)
            }
        }
        if(count == 0){flags += 'g'}
        var jsp = new RegExp(pattern, flags)
        if(typeof repl == 'function'){return string.replace(jsp, $repl1)}
        else{return string.replace(jsp, repl)}
    }
    obj.match = (function(search_func){
        return function(){
            // match is like search but pattern must start with ^
            var pattern = arguments[0]
            if(pattern.charAt(0) != '^'){pattern = '^'+pattern}
            var args = [pattern]
            for(var i = 1, _len_i = arguments.length; i < _len_i; i++){
                args.push(arguments[i])
            }
            return search_func.apply(null, args)
        }
    })(obj.search)

    $B.addToImported('_jsre', obj)
}
)(__BRYTHON__)
