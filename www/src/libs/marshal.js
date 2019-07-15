var $module = (function($B){

return  {
    loads : function(){
        var $ = $B.args('loads', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return $B.structuredclone2pyobj(JSON.parse($.obj))
    },
    load : function(){
        var $ = $B.args('load', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return $module.loads(obj.$content);
    },
    dumps : function(){
        var $ = $B.args('dumps', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return JSON.stringify($B.pyobj2structuredclone($.obj))
    },
}

})(__BRYTHON__)
