var $module=(function($B){
    var _b_ = $B.builtins
    return {
        // Called "Getframe" because "_getframe" wouldn't be imported in
        // sys.py with "from _sys import *"
        Getframe : function(depth){
            return $B._frame.$factory($B.frames_stack, depth)
        },
        modules :
            {'__get__':function(){
                console.log("get sys.modules")
                return $B.obj_dict($B.imported)
            },
             '__set__':function(self, obj, value){ throw _b_.TypeError("Read only property 'sys.modules'") }
            },
        path:
            {'__get__':function(){return $B.path},
             '__set__':function(self, obj, value){ $B.path = value }
            },
        meta_path:
            {'__get__':function(){return $B.meta_path},
             '__set__':function(self, obj, value){ $B.meta_path = value }
            },
        path_hooks:
            {'__get__':function(){return $B.path_hooks},
             '__set__':function(self, obj, value){ $B.path_hooks = value }
            },
        path_importer_cache:
            {'__get__':function(){
                return _b_.dict.$factory($B.JSObject.$factory($B.path_importer_cache))
            },
             '__set__':function(self, obj, value){
                 throw _b_.TypeError("Read only property 'sys.path_importer_cache'")
            }
        },
        stderr : {
            __get__:function(){return $B.stderr},
            __set__:function(self, obj, value){$B.stderr = value},
            write:function(data){_b_.getattr($B.stderr,"write")(data)}
            },
        stdout : {
            __get__:function(){return $B.stdout},
            __set__:function(self, obj, value){$B.stdout = value},
            write:function(data){_b_.getattr($B.stdout,"write")(data)}
            },
        stdin : $B.stdin
    }
})(__BRYTHON__)
