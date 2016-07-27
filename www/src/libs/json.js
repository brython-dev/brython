var $module = (function($B){

return  {
    loads : function(json_obj){
        return $B.jsobject2pyobject(JSON.parse(json_obj))
    },
    load : function(file_obj){
        return $module.loads(file_obj.$content);
    },
    dumps : function(obj){return JSON.stringify($B.pyobject2jsobject(obj))},
}

})(__BRYTHON__)
