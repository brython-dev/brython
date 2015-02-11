from browser import window
import javascript

# use Javascript Date constructor
date = javascript.JSConstructor(window.Date)

#daylight = 0 # fix me.. returns Non zero if DST timezone is defined

def _get_day_of_year(arg):
    ml = [31,28,31,30,31,30,31,31,30,31,30,31]
    if arg[0]%4==0:
        ml[1] += 1
    i=1
    yday=0
    while i<arg[1]:
        yday += ml[i-1]
        i += 1
    yday += arg[2]
    arg[7] = yday
    return struct_time(arg)
    
def _is_dst(secs = None):
    d = date()
    if secs is not None:
        d = date(secs*1000)
    # calculate if we are in daylight savings time or not.
    # borrowed from http://stackoverflow.com/questions/11887934/check-if-daylight-saving-time-is-in-effect-and-if-it-is-for-how-many-hours
    jan = date(d.getFullYear(), 0, 1)
    jul = date(d.getFullYear(), 6, 1)
    dst = int(d.getTimezoneOffset() < max(abs(jan.getTimezoneOffset()), abs(jul.getTimezoneOffset())))
    return dst
    
daylight = _is_dst()
timezone = date().getTimezoneOffset() * 60

def _get_tzname():
	d = date()
	d = d.toTimeString()
	d = d.split('(')[1].split(')')[0]
	return (d, 'NotAvailable')

tzname = _get_tzname()

def _set_altzone():
    d = date()
    jan = date(d.getFullYear(), 0, 1)
    jul = date(d.getFullYear(), 6, 1)
    result = timezone - (jan.getTimezoneOffset() - jul.getTimezoneOffset()) * 60
    return result
    
altzone = _set_altzone() if daylight else timezone


def asctime(t = None):
    if t and isinstance(t, struct_time) and len(t.args) == 9:
        t = t.args
    elif t and isinstance(t, tuple) and len(t) == 9:
        t = t
    elif t and isinstance(t, struct_time) and len(t.args) != 9:
        raise TypeError("function takes exactly 9 arguments ({} given)".format(len(t.args)))
    elif t and isinstance(t, tuple) and len(t) != 9:
        raise TypeError("function takes exactly 9 arguments ({} given)".format(len(t.args)))
    elif t and not isinstance(t, (tuple, struct_time)):
        raise TypeError("Tuple or struct_time argument required")
    else:
        t = localtime()
    weekdays = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 
                4: "Fri", 5: "Sat", 6: "Sun"}
    months = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',
        7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}
    result = "%s %s %2d %02d:%02d:%02d %4d" % (
        weekdays[t[6]], months[t[1]], t[2], t[3], t[4], t[5], t[0])
    return result

# All the clock_xx machinery shouldn't work in the browser so some
# NotImplementedErrors or messages are shown
_clock_msg = """Browser cannot access CPU. See '%s'"""
def _clock_xx(url):
    raise NotImplementedError(_clock_msg % url)
clock = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock")
clock_getres = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock_getres")
clock_gettime = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock_gettime")
clock_settime = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock_settime")
CLOCK_HIGHRES = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_HIGHRES"
CLOCK_MONOTONIC = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_MONOTONIC"
CLOCK_MONOTONIC_RAW = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_MONOTONIC_RAW"
CLOCK_PROCESS_CPUTIME_ID = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_PROCESS_CPUTIME_ID"
CLOCK_REALTIME = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_REALTIME"
CLOCK_THREAD_CPUTIME_ID = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_THREAD_CPUTIME_ID"

def ctime(timestamp=None):
    if timestamp is None:
        timestamp = int(date().getTime()/1000)
    d = date(0)
    d.setUTCSeconds(timestamp)
    return d.toUTCString()

get_clock_info = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.get_clock_info")

def gmtime(secs = None):
    d = date()
    if secs is not None:
       d = date(secs*1000)
    wday = d.getUTCDay() - 1 if d.getUTCDay() - 1 >= 0 else 6
    tmp = struct_time([d.getUTCFullYear(), 
        d.getUTCMonth()+1, d.getUTCDate(),
        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
        wday, 0, 0])
    return _get_day_of_year(tmp.args)

def localtime(secs = None):
   d = date()
   if secs is not None:
       d = date(secs*1000)
   dst = _is_dst(secs)
   wday = d.getDay() - 1 if d.getDay() - 1 >= 0 else 6
   tmp = struct_time([d.getFullYear(), 
       d.getMonth()+1, d.getDate(),
       d.getHours(), d.getMinutes(), d.getSeconds(),
       wday, 0, dst])
   return _get_day_of_year(tmp.args)
   #return struct_time([d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(),
   #             d.getMinutes(), d.getSeconds(), d.getDay(), 0, dst])

def mktime():
	raise NotImplementedError('TODO')

def monotonic():
	return javascript.JSObject(window.performance.now)()/1000.

def perf_counter():
    return float(date().getTime()/1000.0)

process_time = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.process_time")

def time():
    return float(date().getTime()/1000)

def sleep(secs):
	raise NotImplementedError(
    "Javascript is single-thread event-based model."
    "Check browser.timer.set_timeout.")

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

def tzset():
	raise NotImplementedError()
