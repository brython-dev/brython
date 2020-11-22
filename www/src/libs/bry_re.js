var $module = (function($B){

_b_ = $B.builtins

function translate(py_pattern){
    // Translate Python RE syntax to Javascript's
    return py_pattern.replace(/\(\?P</g, '(?<')
}

function str_or_bytes(string, pattern){
    if(typeof string == "string" || _b_.isinstance(string, _b_.str)){
        string = string + '' // for string subclasses
        if(typeof pattern == "string" || _b_.isinstance(pattern, _b_.str)){
            pattern = pattern + ''
        }else{
            throw _b_.TypeError.$factory(`cannot use a `+
                `${$B.class_name(pattern)} pattern on a string-like object`)
        }
        return {type: _b_.str, string, pattern}
    }else if(_b_.isinstance(string, [_b_.bytes, _b_.bytearray, _b_.memoryview])){
        if(! _b_.isinstance(pattern, [_b_.bytes, _b_.bytearray, _b_.memoryview])){
            throw _b_.TypeError(`cannot use a ${$B.class_name(pattern)}` +
                ' pattern on a bytes-like object')
        }
        return {
            type: _b_.bytes,
            string: _b_.bytes.decode(_b_.bytes.$factory(string), 'latin1'),
            pattern: _b_.bytes.decode(_b_.bytes.$factory(pattern), 'latin1')
        }
    }else{
        throw _b_.TypeError.$factory("invalid string type: " +
            $B.class_name(string))
    }
}

var MatchObject = $B.make_class("MatchObject",
    function(res){
        return {
            __class__: MatchObject,
            res: res
        }
    }
)

MatchObject.__getitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, group: null},
                ['self', 'group'], arguments, {group: 0}, null, null)
    return group($.self.res, $.group)
}

MatchObject.__iter__ = function(self){
    return _b_.iter(_b_.list.$factory(MatchObject.groupdict(self)))
}

MatchObject.__setitem__ = function(){
    throw _b_.TypeError.$factory("MatchObject is readonly")
}

MatchObject.__str__ = function(self){
    var match = self.string.substring(self.start, self.end)
    return `<re.Match object; span=${_b_.str.$factory(self.span)}, match='${match}'>`
}

function group(res, rank){
    if(typeof rank == "number"){
        if(rank < 0 || rank >= res.length){
            throw _b_.IndexError.$factory("no such group")
        }else if(res[rank] === undefined){
            return _b_.None
        }
        return res[rank]
    }else if(_b_.isinstance(rank, _b_.int)){
        if($B.rich_comp('__lt__', rank, 0) ||
                $B.rich_comp('__ge__', rank, res.length)){
            throw _b_.IndexError.$factory("no such group")
        }else if(res[rank] === undefined){
            return _b_.None
        }
        return res[rank]
    }else if(typeof rank == "string"){
        if(res.groups && Object.keys(res.groups).indexOf(rank) > -1){
            if(res.groups[rank] === undefined){
                return _b_.None
            }else{
                return res.groups[rank]
            }
        }else{
            throw _b_.IndexError.$factory("no such group")
        }
    }else{
        try{
            var rank = $B.$GetInt(rank)
        }catch(err){
            throw _b_.IndexError.$factory("no such group")
        }
        return group(res, rank)
    }
}

function to_bytes(mo){
    // Transform strings in a MatchObject to bytes
    mo.string = _b_.str.encode(mo.string, 'latin1')
    mo.res.forEach(function(item, rank){
        if(item !== undefined){
            mo.res[rank] = _b_.str.encode(item, 'latin1')
        }
    })
}

MatchObject.group = function(){
    var $ = $B.args("group", 2, {self: null, rank: null}, ['self', 'rank'],
                    arguments, {rank: 0}, 'ranks', null),
            self = $.self,
            rank = $.rank,
            ranks = $.ranks
    var first = group(self.res, rank)
    if(ranks.length == 0){
        return first
    }else{
        var result = [first]
        for(var rank of ranks){
            result.push(group(self.res, rank))
        }
        return $B.fast_tuple(result)
    }
}

MatchObject.groupdict = function(){
    var $ = $B.args("group", 2, {self: null, default: null}, ['self', 'default'],
                    arguments, {default: _b_.None}, null, null),
            self = $.self,
            _default = $.default
    var d = $B.empty_dict()
    if(self.res.groups){
        for(var key in self.res.groups){
            if(self.res.groups[key] === undefined){
                _b_.dict.$setitem(d, key, _default)
            }else{
                _b_.dict.$setitem(d, key, self.res.groups[key])
            }
        }
    }
    return d
}

MatchObject.groups = function(self, _default){
    var groups = self.res.slice(1)
    groups.forEach(function(item, rank){
        if(item === undefined){
            groups[rank] = _default === undefined ? _b_.None : _default
        }
    })
    return $B.fast_tuple(groups)
}

MatchObject.span = function(){
    var $ = $B.args("span", 2, {self: null, group: null}, ['self', 'group'],
                    arguments, {group: 0}, null, null),
            self = $.self,
            group = $.group
    if(group == 0){
        return $B.fast_tuple([self.start, self.end])
    }
}
$B.set_func_names(MatchObject, "re")

var Pattern = $B.make_class("Pattern",
    function(pattern, flags){
        return {
            __class__: Pattern,
            pattern: pattern,
            flags: flags
        }
    }
)

Pattern.__str__ = function(self){
    return `<re.Pattern object>`
}

Pattern.match = function(){
    var $ = $B.args("match", 3,
                {self: null, string: null, pos: null, endpos: null},
                ['self', 'string', 'pos', 'endpos'], arguments,
                {pos: 0, endpos: _b_.None}, null, null),
        self = $.self,
        string = $.string,
        pos = $.pos,
        endpos = $.endpos
    return $match(self.pattern, string)
}

$B.set_func_names(Pattern, "re")


function compile(){
    var $ = $B.args("compile", 2, {pattern: null, flags: null},
                    ["pattern", "flags"], arguments, {flags: 0},
                    null, null),
            pattern = $.pattern,
            flags = $.flags
    return Pattern.$factory(pattern, flags)
}

function findall(){
    var $ = $B.args("findall", 3, {pattern: null, string: null, flags: null},
                    ["pattern", "string", "flags"], arguments, {flags: 0},
                    null, null),
            pattern = $.pattern,
            string = $.string,
            flags = $.flags
    var data = str_or_bytes(string, pattern)
    if(data.type === _b_.str){
        return $findall(data.pattern, data.string, flags)
    }else{
        var res1 = $findall(data.pattern, data.string, flags),
            res = []
        for(const item of res1){
            if(typeof item == "string"){
                res.push(_b_.str.encode(item, "latin1"))
            }else{
                res.push($B.fast_tuple(item.map(
                    function(x){return _b_.str.encode(x, 'latin1')})
                ))
            }
        }
        return res
    }
}

function $findall(pattern, string, flags){
    var res = []
    try{
        string.matchAll(translate(pattern))
    }catch(err){
        console.log("error for", string)
        throw err
    }
    for(const item of string.matchAll(translate(pattern))){
        /*
        If one or more groups are present in the pattern, return a list of
        groups; this will be a list of tuples if the pattern has more than one
        group
        */
        if(item.length == 1){
            res.push(item[0])
        }else if(item.length == 2){
            res.push(item[1])
        }else{
            res.push($B.fast_tuple(item.slice(1)))
        }
    }
    return res
}

function match(){
    var $ = $B.args("match", 3, {pattern: null, string: null, flags: null},
                    ["pattern", "string", "flags"], arguments, {flags: 0},
                    null, null),
            pattern = $.pattern,
            string = $.string,
            flags = $.flags
    var data = str_or_bytes(string, pattern)
    if(! data.pattern.startsWith('^')){
        data.pattern = '^' + data.pattern
    }
    if(data.type === _b_.str){
        return $match(data.pattern, data.string, flags)
    }else{
        var mo = $match(data.pattern, data.string, flags)
        if(mo === _b_.None){
            return mo
        }
        to_bytes(mo)
        return mo
    }
}

function $match(pattern, string, flags){
    var js_pattern = translate(pattern),
        res = string.match(new RegExp(js_pattern))
    if(res){
        var mo = MatchObject.$factory(res)
        mo.string = string
        mo.start = 0
        mo.end = res[0].length
        return mo
    }else{
        return _b_.None
    }
}

function search(){
    var $ = $B.args("search", 3, {pattern: null, string: null, flags: null},
                    ["pattern", "string", "flags"], arguments, {flags: 0},
                    null, null),
            pattern = $.pattern,
            string = $.string,
            flags = $.flags
    var data = str_or_bytes(string, pattern)
    if(data.type === _b_.str){
        return $search(data.pattern, data.string, flags)
    }else{
        var mo = $search(data.pattern, data.string, flags)
        mo.type = _b_.bytes
        if(mo === _b_.None){
            return mo
        }
        to_bytes(mo)
        return mo
    }
}

function $search(pattern, string, flags){
    var js_pattern = translate(pattern),
        pos = string.search(new RegExp(js_pattern))
    if(pos == -1){
        return _b_.None
    }else{
        var mo = $match(pattern, string.substr(pos), flags)
        mo.string = string
        mo.start = pos
        mo.end = pos + mo.res[0].length
        return mo
    }
}
return  {
    compile: compile,
    findall: findall,
    match: match,
    search: search
}

})(__BRYTHON__)
