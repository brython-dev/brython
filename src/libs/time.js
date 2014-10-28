var $module=(function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

var stnames = ['tm_year','tm_mon','tm_mday','tm_hour','tm_min','tm_sec',
    'tm_wday','tm_yday','tm_isdst']

var StructTimeDict = {__name__:'struct_time',__class__:$B.$type}

StructTimeDict.__mro__ = [StructTimeDict,_b_.object.$dict]

StructTimeDict.__getattr__ = function(self,name){
    var ix = stnames.indexOf(name)
    if(ix==-1){throw AttributeError(
        "'time.struct_time' object has no attribute '"+name+"'")}
    return StructTimeDict.__getitem__(self,ix)
}

StructTimeDict.__getitem__ = function(self, rank){
    if(!typeof rank=='number'){throw _b_.TypeError(
        'list indices must be integers, not '+$B.get_class(rank).__name__)
    }
    var res = self.value[rank]
    if(res===undefined){throw _b_.KeyError(rank)}
    return res
}

StructTimeDict.__repr__ = StructTimeDict.__str__ = function(self){
    var res = 'time.struct_time('
    var elts = []
    for(var i=0, _len_i = stnames.length; i < _len_i;i++){
        elts.push(stnames[i]+'='+self.value[i])
    }
    res += elts.join(', ')
    return res+')'
}

function StructTime(args){
    return {__class__:StructTimeDict, value: args}
}
StructTime.$type = $B.factory
StructTime.$dict = StructTimeDict
StructTimeDict.$factory = StructTime

var $mod = {
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
       if (secs === undefined || secs === None){
           return d.getTime()
       } else {
           d = new Date(secs * 1000)
       }



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

function to_struct_time(ptuple){
    // Receives a packed tuple, pass its attribute "arg" to struct_time
    var arg = ptuple.arg
    // The tuple received from module _strptime has 7 elements, we must add
    // the rank of day in the year in the range [1, 366]
    var ml = [31,28,31,30,31,30,31,31,30,31,30,31]
    if(arg[0]%4==0){ml[1]++}
    console.log(ml)
    var i=1, yday=0
    while(i<arg[1]){yday+=ml[i-1];i++}
    yday += arg[2]
    arg.push(yday)
    arg.push(-1)
    return $mod.struct_time(arg)
}

$mod.strptime = function(string, format){
    var _strptime = _b_.__import__('_strptime')
    return StructTime(_strptime._strptime_datetime(to_struct_time, string, format))
}

return $mod
})(__BRYTHON__)
