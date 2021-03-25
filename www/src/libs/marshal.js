var $module = (function($B){

var _b_ = $B.builtins

return {
    loads: function(){
        var $ = $B.args('loads', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return $B.structuredclone2pyobj(JSON.parse($.obj))
    },
    load: function(){
        var $ = $B.args('load', 1, {file:null}, ['file'], arguments, {},
            null, null)
        var content = $B.$call($B.$getattr($.file, "read"))()
        return $module.loads(_b_.bytes.decode(content, "latin-1"));
    },
    dump: function(){
        var $ = $B.args('dump', 2, {value:null, file: null},
            ['value', 'file'], arguments, {}, null, null)
        var s = JSON.stringify($B.pyobj2structuredclone($.value))
        $B.$getattr($.file, "write")(_b_.str.encode(s, 'latin-1'))
        var flush = $B.$getattr($.file, "flush", null)
        if(flush !== null){
            $B.$call(flush)()
        }
        return _b_.None
    },
    dumps: function(){
        var $ = $B.args('dumps', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return JSON.stringify($B.pyobj2structuredclone($.obj))
    }
}

})(__BRYTHON__)
