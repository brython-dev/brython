var $module=(function($B){

    return {
        modules :
            {'__get__':function(){return $B.builtins.dict($B.JSObject($B.imported))},
             '__set__':0 // data descriptor, to force use of __get__
            },
        stderr : {
            __get__:function(){return $B.stderr},
            __set__:function(self, obj, value){console.log('set stderr');$B.stderr = value},
            write:function(data){$B.builtins.getattr($B.stderr,"write")(data)}
            },
        stdout : {
            __get__:function(){return $B.stdout},
            __set__:function(self, obj, value){console.log('set stdout');$B.stdout = value},
            write:function(data){$B.builtins.getattr($B.stdout,"write")(data)}
            },
        stdin : $B.stdin
    }
})(__BRYTHON__)

