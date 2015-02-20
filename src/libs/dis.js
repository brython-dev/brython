var $module=(function($B){

var mod = {
    dis:function(src){
        $B.$py_module_path['__main__'] = $B.brython_path
        return __BRYTHON__.py2js(src,'__main__','__main__','__builtins__').to_js()
    }
}
return mod

})(__BRYTHON__)