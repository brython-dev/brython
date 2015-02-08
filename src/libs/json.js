var $module = (function($B){

return  {
    loads : function(json_obj){return $B.jsobject2pyobject(JSON.parse(json_obj))},
    dumps : function(obj){return JSON.stringify($B.pyobject2jsobject(obj))},
}

})(__BRYTHON__)
