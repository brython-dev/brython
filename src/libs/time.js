var $module=(function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}

return  {
    __name__ : 'time',
    tzname: _b_.tuple(['', '']),
    daylight: 0,      //fix me.. returns Non zero if DST timezone is defined
    ctime: function(timestamp){
       if (timestamp === undefined) {
          timestamp=int(new Date().getTime()/1000);
       }
       var d=new Date(0);  
       d.setUTCSeconds(timestamp);
       return d.toUTCString();
    },
    gmtime: function(){
       var d=new Date();
       return [d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(), 
               d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), 
               d.getUTCDay(), 0, 0]
    },
    perf_counter: function() {
        return float((new Date()).getTime()/1000.0);
    },
    
    localtime : function(secs){ 
       var d=new Date();
       if (secs === undefined || secs === None) {return d.getTime()}

       // calculate if we are in daylight savings time or not.
       // borrowed from http://stackoverflow.com/questions/11887934/check-if-daylight-saving-time-is-in-effect-and-if-it-is-for-how-many-hours
       var jan = new Date(d.getFullYear(), 0, 1);
       var jul = new Date(d.getFullYear(), 6, 1);
       var dst=int(d.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()));

       return [d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(),
                    d.getMinutes(), d.getSeconds(), d.getDay(), 0, dst]
       //fixme  (second to last value is 0 which is the number of days in this year..)
    },
    time : function(){return float((new Date().getTime())/1000)},
    
    sleep : function(secs){},
    
    strftime : function(format,arg){
        function ns(arg,nb){
            // left padding with 0
            var res = arg.toString()
            while(res.length<nb){res = '0'+res}
            return res
        }
        if(arg){
            var obj = new Date(arg[0],arg[1]-1,arg[2],arg[3],arg[4],arg[5],arg[6])
        }else{
            var obj=new Date()
        }
        var abb_weekdays = ['Su','Mo','Tu','We','Th','Fr','Sa']
        var full_weekdays = ['Sunday','Monday','Tuesday','Wednesday',
            'Thursday','Friday','Saturday']
        var abb_months = ['Jan','Feb','Mar','Apr','May','Jun',
            'Jul','Aug','Sep','Oct','Nov','Dec']
        var full_months = ['January','February','March','April','May','June',
            'July','August','September','October','November','December']
        var res = format
        res = res.replace(/%H/,ns(obj.getHours(),2))
        res = res.replace(/%M/,ns(obj.getMinutes(),2))
        res = res.replace(/%S/,ns(obj.getSeconds(),2))
        res = res.replace(/%Y/,ns(obj.getFullYear(),4))
        res = res.replace(/%y/,ns(obj.getFullYear(),4).substr(2))
        res = res.replace(/%m/,ns(obj.getMonth()+1,2))
        res = res.replace(/%d/,ns(obj.getDate(),2))
        res = res.replace(/%a/,abb_weekdays[obj.getDay()])
        res = res.replace(/%A/,full_weekdays[obj.getDay()])
        res = res.replace(/%b/,abb_months[obj.getMonth()])
        res = res.replace(/%B/,full_months[obj.getMonth()])
        return res
    },
    
    struct_time : function(arg){
        if(!isinstance(arg,[tuple,list])){
            throw TypeError('constructor requires a sequence')
        }
        if(len(arg)!=9){
            throw TypeError("time.struct_time() takes a 9-sequence ("+len(arg)+"-sequence given")
        }
        var res = arg
        var names = ['tm_year','tm_mon','tm_mday','tm_hour','tm_min','tm_sec','tm_wday',
            'tm_yday','tm_isdst','tm_zone','tm_gmtoff']
        res.__getattr__ = function(attr){
            var ix = names.indexOf(attr)
            if(ix>-1){return arg.__getitem__(ix)}
            if(typeof res[attr]==='function'){
                return (function(obj){
                    return function(){return obj[attr].apply(obj,arguments)}
                })(res)
            }else if(res[attr]!==undefined){
                return res[attr]
            }else{throw AttributeError("object has no attribute '"+attr+"'")}
        }
        return res
    }
}

})(__BRYTHON__)
