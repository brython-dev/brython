var $module=(function($B){

    return {
        modules :
            {'__get__':function(){return $B.builtins.dict($B.JSObject($B.imported))},
             '__set__':0 // data descriptor, to force use of __get__
            },
        stderr : {
            __set__:function(self, obj, value){$B.stderr = value},
            write:function(data){$B.stderr.write(data)}
            },
        stdout : {
            __set__:function(self, obj, value){$B.stdout = value},
            write:function(data){$B.stdout.write(data)}
            },
        stdin : $B.stdin
    }
})(__BRYTHON__)
