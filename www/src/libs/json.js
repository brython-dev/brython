var $module = (function($B){

return  {
    loads : function(){
        var $ = $B.args('loads', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return $B.jsobject2pyobject(JSON.parse($.obj))
    },
    load : function(){
        var $ = $B.args('load', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return $module.loads(obj.$content);
    },
    dumps : function(){
        var $ = $B.args('dumps', 1, {obj:null}, ['obj'], arguments, {},
            null, null)
        return JSON.stringify($B.pyobject2jsobject($.obj))
    },
}

})(__BRYTHON__)
