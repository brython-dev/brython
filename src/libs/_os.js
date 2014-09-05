var $module=(function($B){

    var _b_ = $B.builtins
    return {
        random:function(){return _b_.float(Math.random())},
        randint:function(a,b){return _b_.int(Math.floor(Math.random()*(b-a)+a))}
    }
})(__BRYTHON__)
