var $module=(function($B){

var mod = {
    dis:function(src){
        return __BRYTHON__.py2js(src,'__main__','__main__','__builtins__').to_js()
    }
}
return mod

})(__BRYTHON__)