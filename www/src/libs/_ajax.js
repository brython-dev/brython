// ajax
var $module = (function($B){

var _b_ = $B.builtins

return {
    urlencode: function(params){
        var items = _b_.list(_b_.dict.$dict.items(params)), res=''
        for(var i=0, _len_i = items.length; i < _len_i;i++){
            var key = encodeURIComponent(_b_.str(items[i][0]));
            if (_b_.isinstance(items[i][1],_b_.list)) {
                for (j = 0; j < items[i][1].length; j++) {
                    res += key +'=' + encodeURIComponent(_b_.str(items[i][1][j])) + '&'
                }
            } else {
                res += key + '=' + encodeURIComponent(_b_.str(items[i][1])) + '&'
            }
        }
        res = res.substr(0,res.length-1)
        return res
    }
}

})(__BRYTHON__)
