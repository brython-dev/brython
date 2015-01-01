var $module=(function($B){
    var _b_=$B.builtins
    return {
        modules :
            {'__get__':function(){return _b_.dict($B.JSObject($B.imported))},
             '__set__':0 // data descriptor, to force use of __get__
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
