from browser import window
import javascript

# use Javascript Date constructor
date = javascript.JSConstructor(window.Date)

tzname = tuple(['', ''])

daylight = 0 # fix me.. returns Non zero if DST timezone is defined

def ctime(timestamp=None):
    if timestamp is None:
        timestamp = int(date().getTime()/1000)
    d = date(0)
    d.setUTCSeconds(timestamp)
    return d.toUTCString()

def gmtime(secs):
    d = date()
    if secs is not None:
       d = date(secs*1000)
    return struct_time([d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(),
           d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
           d.getUTCDay(), 0, 0])

def perf_counter():
    return float(date().getTime()/1000.0)

def localtime(secs=None):
   d = date()
   if secs is not None:
       d = date(secs*1000)

   # calculate if we are in daylight savings time or not.
   # borrowed from http://stackoverflow.com/questions/11887934/check-if-daylight-saving-time-is-in-effect-and-if-it-is-for-how-many-hours
   jan = date(d.getFullYear(), 0, 1)
   jul = date(d.getFullYear(), 6, 1)
   dst = int(d.getTimezoneOffset() < max(jan.getTimezoneOffset(), jul.getTimezoneOffset()))

   return struct_time([d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(),
                d.getMinutes(), d.getSeconds(), d.getDay(), 0, dst])

def time():
    return float(date().getTime()/1000)

def sleep(secs):
    pass

def strftime(_format,arg=None):
    def ns(arg,nb):
        # left padding with 0
        res = str(arg)
        while len(res)<nb:
            res = '0'+res
        return res

    if arg is None:
        obj = date()
    else:
        obj = date(arg[0],arg[1]-1,arg[2],arg[3],arg[4],arg[5],arg[6])

    abb_weekdays = ['Su','Mo','Tu','We','Th','Fr','Sa']
    full_weekdays = ['Sunday','Monday','Tuesday','Wednesday',
        'Thursday','Friday','Saturday']
    abb_months = ['Jan','Feb','Mar','Apr','May','Jun',
        'Jul','Aug','Sep','Oct','Nov','Dec']
    full_months = ['January','February','March','April','May','June',
        'July','August','September','October','November','December']
    res = _format
    res = res.replace("%H",ns(obj.getHours(),2))
    res = res.replace("%M",ns(obj.getMinutes(),2))
    res = res.replace("%S",ns(obj.getSeconds(),2))
    res = res.replace("%Y",ns(obj.getFullYear(),4))
    res = res.replace("%y",ns(obj.getFullYear(),4)[2:])
    res = res.replace("%m",ns(obj.getMonth()+1,2))
    res = res.replace("%d",ns(obj.getDate(),2))
    res = res.replace("%a",abb_weekdays[obj.getDay()])
    res = res.replace("%A",full_weekdays[obj.getDay()])
    res = res.replace("%b",abb_months[obj.getMonth()])
    res = res.replace("%B",full_months[obj.getMonth()])
    return res
   
class struct_time:

    def __init__(self, args):
    
        if len(args)!=9:
            raise TypeError("time.struct_time() takes a 9-sequence (%s-sequence given)" %len(args))
    
        self.args = args
        
    @property
    def tm_year(self):
        return self.args[0]

    @property
    def tm_mon(self):
        return self.args[1]
    
    @property
    def tm_mday(self):
        return self.args[2]
    
    @property
    def tm_hour(self):
        return self.args[3]
    
    @property
    def tm_min(self):
        return self.args[4]
    
    @property
    def tm_sec(self):
        return self.args[5]

    @property
    def tm_wday(self):
        return self.args[6]

    @property
    def tm_yday(self):
        return self.args[7]

    @property
    def tm_isdst(self):
        return self.args[8]

    def __getitem__(self, i):
        return self.args[i]

    def __iter__(self):
        return iter(self.args)

    def __repr__(self):
        return ("time.structime(tm_year={}, tm_mon={}, tm_day={}, "+\
            "tm_hour={}, tm_min={}, tm_sec={}, tm_wday={}, "+\
            "tm_yday={}, tm_isdst={})").format(*self.args)

    def __str__(self):
        return self.__repr__()


def to_struct_time(ptuple):
    # Receives a packed tuple, pass its attribute "arg" to struct_time
    arg = ptuple.arg
    # The tuple received from module _strptime has 7 elements, we must add
    # the rank of day in the year in the range [1, 366]
    ml = [31,28,31,30,31,30,31,31,30,31,30,31]
    if arg[0]%4==0:
        ml[1] += 1

    i=1
    yday=0
    while i<arg[1]:
        yday += ml[i-1]
        i += 1
    yday += arg[2]
    arg.append(yday)
    arg.append(-1)
    return struct_time(arg)

def strptime(string, _format):
    import _strptime
    return struct_time([_strptime._strptime_datetime(to_struct_time, string, _format)])
