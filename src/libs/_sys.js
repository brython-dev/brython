var $module=(function($B){

    return {
        modules :
            {'__get__':function(){return $B.builtins.dict($B.JSObject($B.imported))},
             '__set__':0 // data descriptor, to force use of __get__
            },
        stderr : $B.stderr,
        stdout : $B.stdout,
        stdin : $B.stdin,
    }
})(__BRYTHON__)
