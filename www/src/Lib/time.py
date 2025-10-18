from browser import self as window
import _locale
import javascript

# Javascript Date constructor
date = javascript.Date.new
now = javascript.Date.now

#daylight = 0 # fix me.. returns Non zero if DST timezone is defined

##############################################
# Added to pass some tests
# Are there timezone always in the browser?
# I'm assuming we don't have always this info
_STRUCT_TM_ITEMS = 9
##############################################


##############################################
## Helper functions
def _get_day_of_year(arg):
    """
    Get the day position in the year starting from 1

    Parameters
    ----------
    arg : tuple

    Returns
    -------
    int with the correct day of the year starting from 1
    """
    ml = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if arg[0] % 4 == 0:
        ml[1] += 1
    i = 1
    yday = 0
    while i < arg[1]:
        yday += ml[i - 1]
        i += 1
    yday += arg[2]
    return yday

def _get_week_of_year(arg):
    """
    Get the week position in the year starting from 0. All days in a new
    year preceding the first Monday are considered to be in week 0.

    Parameters
    ----------
    arg : tuple

    Returns
    -------
    int with the correct iso week (weeks starting on Monday) of the year.
    """
    d1 = date(arg[0], arg[1] - 1, arg[2])
    d0 = date(arg[0], 0, 1)
    firstday = d0.getDay()
    if firstday == 0 :
        firstday = 7
    firstweek = 8 - firstday
    doy = arg[7]
    if firstday != 1:
        doy = doy - firstweek
    if doy % 7 == 0:
        week_number = doy // 7
    else:
        week_number = doy // 7 + 1
    return week_number

def _check_struct_time(t):
    mm = t[1]
    if mm == 0:
        mm = 1
    if -1 > mm > 13:
        raise ValueError("month out of range")

    dd = t[2]
    if dd == 0: dd = 1
    if -1 > dd > 32:
        raise ValueError("day of month out of range")

    hh = t[3]
    if -1 > hh > 24:
        raise ValueError("hour out of range")

    minu = t[4]
    if -1 > minu > 60:
        raise ValueError("minute out of range")

    ss = t[5]
    if -1 > ss > 62:
        raise ValueError("seconds out of range")

    wd = t[6] % 7
    if wd < -2:
        raise ValueError("day of week out of range")

    dy = t[7]
    if dy == 0: dy = 1
    if -1 > dy > 367:
        raise ValueError("day of year out of range")

    return t[0], mm, dd, hh, minu, ss, wd, dy, t[-1]


def _is_dst(secs = None):
    "Check if data has daylight saving time"
    d = date()
    if secs is not None:
        d = date(secs * 1000)
    # calculate if we are in daylight savings time or not.
    # borrowed from http://stackoverflow.com/questions/11887934/
    # check-if-daylight-saving-time-is-in-effect-and-if-it-is-for-how-many-hours
    jan = date(d.getFullYear(), 0, 1)
    jul = date(d.getFullYear(), 6, 1)
    dst = int(d.getTimezoneOffset() < max(abs(jan.getTimezoneOffset()),
        abs(jul.getTimezoneOffset())))
    return dst

def _get_tzname():
    "check if timezone is available, if not return a tuple of empty str"
    d = date()
    d = d.toTimeString()
    try:
        d = d.split('(')[1].split(')')[0]
        return (d, 'NotAvailable')
    except:
        return ('', '')

def _set_altzone():
    d = date()
    jan = date(d.getFullYear(), 0, 1)
    jul = date(d.getFullYear(), 6, 1)
    result = timezone - (jan.getTimezoneOffset() - jul.getTimezoneOffset()) * 60
    return result

def _check_input(t):
    if t and isinstance(t, struct_time) and len(t.args) == 9:
        t = t.args
    elif t and isinstance(t, tuple) and len(t) == 9:
        t = t
    elif t and isinstance(t, struct_time) and len(t.args) != 9:
        raise TypeError("function takes exactly 9 arguments ({} given)".format(len(t.args)))
    elif t and isinstance(t, tuple) and len(t) != 9:
        raise TypeError("function takes exactly 9 arguments ({} given)".format(len(t)))
    elif t and not isinstance(t, (tuple, struct_time)):
        raise TypeError("Tuple or struct_time argument required")
    else:
        t = localtime().args
    return t
## end of helper functions
##############################################

##############################################
## Values depending the timezone of the browser.
daylight = _is_dst()
timezone = date().getTimezoneOffset() * 60
tzname = _get_tzname()
altzone = _set_altzone() if daylight else timezone
##############################################

def asctime(t = None):
    weekdays = {i: day for (i, day) in
        enumerate("Mon Tue Wed Thu Fri Sat Sun".split())
    }

    months = {i + 1: month for (i, month) in
        enumerate("Jan Fev Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())
    }

    t = _check_input(t)
    t = _check_struct_time(t)

    result = "%s %s %2d %02d:%02d:%02d %d" % (
        weekdays[t[6]], months[t[1]], t[2], t[3], t[4], t[5], t[0])
    return result

def ctime(timestamp=None):
    return asctime(localtime(timestamp))

def gmtime(secs = None):
    d = date()
    if secs is not None:
       d = date(secs * 1000)
    wday = d.getUTCDay() - 1 if d.getUTCDay() - 1 >= 0 else 6
    tmp = struct_time([d.getUTCFullYear(),
        d.getUTCMonth() + 1, d.getUTCDate(),
        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
        wday, 0, 0])
    tmp.args[7] = _get_day_of_year(tmp.args)
    return tmp

def localtime(secs = None):
   d = date()
   if secs is not None:
       d = date(secs * 1000)
   dst = _is_dst(secs)
   wday = d.getDay() - 1 if d.getDay() - 1 >= 0 else 6
   tmp = struct_time([d.getFullYear(),
       d.getMonth() + 1, d.getDate(),
       d.getHours(), d.getMinutes(), d.getSeconds(),
       wday, 0, dst])
   tmp.args[7] = _get_day_of_year(tmp.args)
   return tmp

def mktime(t):
    if isinstance(t, struct_time):
        d1 = date(t.tm_year, t.tm_mon - 1, t.tm_mday,
                  t.tm_hour, t.tm_min, t.tm_sec, 0).getTime()
    elif isinstance(t, tuple):
        d1 = date(t[0], t[1] - 1, t[2], t[3], t[4], t[5], 0).getTime()
    else:
        raise ValueError("Tuple or struct_time argument required")
    d2 = date(0).getTime()
    return (d1 - d2) / 1000.

def monotonic():
    return now() / 1000.

def perf_counter():
    return window.performance.now() / 1000.

def process_time():
    return now() / 1000.

def time():
    return float(date().getTime() / 1000)

def time_ns():
    try:
        return window.Temporal.Now.instant().fromEpochNanoseconds()
    except:
        return date().getTime() * 1_000_000

def sleep(secs):
    """Javascript can't block execution for a given time, expect by an
    infinite loop that freezes the browser. It's better to raise an
    exception"""
    # try conversion to float, raises TypeError if incorrect argument
    float(secs)
    raise NotImplementedError("Blocking functions like time.sleep() are not "
        "supported in the browser. Use functions in module browser.timer "
        "instead.")

def strftime(_format,t = None):
    def ns(t, nb):
        # left padding with 0
        res = str(t)
        while len(res) < nb:
            res = '0' + res
        return res

    t = _check_input(t)
    t = _check_struct_time(t)

    YY = ns(t[0], 4)
    yy = ns(t[0], 4)[2:]
    mm = ns(t[1], 2)
    dd = ns(t[2], 2)
    HH = t[3]
    HH24 = ns(HH, 2)
    HH12 = ns(HH % 12, 2)
    if HH12 == '00':
            HH12 = '12'
    AMPM = 'AM' if 0 <= HH < 12 else 'PM'
    MM = ns(t[4], 2)
    SS = ns(t[5], 2)
    DoY = ns(t[7], 3)
    w = t[6] + 1 if t[6] < 6 else 0
    W = ns(_get_week_of_year(t), 2)

    abb_weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    full_weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday']
    abb_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    full_months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']

    res = _format
    if __BRYTHON__.locale == "C":
        res = res.replace("%c", abb_weekdays[w] + ' ' + abb_months[int(mm) - 1]+
            ' ' + dd + ' ' + HH24 + ':' + MM + ':' + SS + ' ' + YY)
        res = res.replace("%x", mm + '/' + dd + '/' + yy)
        res = res.replace("%X", HH24 + ':' + MM + ':' + SS)
    else:
        formatter = _locale._date_format
        c_format = formatter("x") + " " + formatter("X")
        res = res.replace("%c", c_format)
        x_format = formatter("x")
        res = res.replace("%x", x_format)
        X_format = formatter("X")
        res = res.replace("%X", X_format)

    res = res.replace("%H", HH24)
    res = res.replace("%I", HH12)
    res = res.replace("%i", HH12.lstrip("0"))
    res = res.replace("%p", AMPM)
    res = res.replace("%M", MM)
    res = res.replace("%S", SS)
    res = res.replace("%Y", YY)
    res = res.replace("%y", yy)
    res = res.replace("%m", mm)
    res = res.replace("%d", dd)
    res = res.replace("%a", abb_weekdays[w])
    res = res.replace("%A", full_weekdays[w])
    res = res.replace("%b", abb_months[int(mm) - 1])
    res = res.replace("%B", full_months[int(mm) - 1])
    res = res.replace("%j", DoY)
    res = res.replace("%w", str(w))
    res = res.replace("%W", W)
    res = res.replace("%%", '%')

    return res

class struct_time:

    def __init__(self, *args, **kw):

        time_tuple = args[0]
        if len(time_tuple) != 9:
            raise TypeError("time.struct_time() takes a 9-sequence (%s-sequence given)" %len(time_tuple))

        self.args = time_tuple

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

    @property
    def tm_gmtoff(self):
        return - date().getTimezoneOffset() * 60

    @property
    def tm_zone(self):
        return __BRYTHON__.tz_name

    def __eq__(self, other):
        return self.args == other.args

    def __getitem__(self, i):
        return self.args[i]

    def __iter__(self):
        return iter(self.args)

    def __reduce_ex__(self, protocol):
        return (struct_time, (self.args, {}))

    def __repr__(self):
        return ("time.structime(tm_year={}, tm_mon={}, tm_day={}, "+\
            "tm_hour={}, tm_min={}, tm_sec={}, tm_wday={}, "+\
            "tm_yday={}, tm_isdst={})").format(*self.args)

    def __str__(self):
        return self.__repr__()

def to_struct_time(*arg):
    arg = list(arg)
    # The tuple received from module _strptime has 8 elements
    # The 2 last are microseconds and timezone: remove them
    del arg[-2:]
    # Add the rank of day in the week: use Javascript Date
    from browser import window
    d = window.Date.new(arg[0], arg[1] - 1, arg[2])
    weekday = (d.getDay() + 6) % 7
    arg.append(weekday)
    # Add the rank of day in the year in the range [1, 366]
    ml = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if arg[0] % 4 == 0:
        ml[1] += 1

    i = 1
    yday = 0
    while i < arg[1]:
        yday += ml[i - 1]
        i += 1
    yday += arg[2]
    arg.append(yday)
    arg.append(-1)
    return struct_time(tuple(arg))

def wait(secs):
    # experimental - replacement for "sleep"
    pass

def strptime(string, _format):
    import _strptime
    tt, fraction, gmtoff_fraction = _strptime._strptime(string, _format)
    return struct_time(tt[:9])

# All the clock_xx machinery shouldn't work in the browser so some
# NotImplementedErrors or messages are shown
_clock_msg = """Browser cannot access CPU. See '%s'"""
def _clock_xx(url):
    raise NotImplementedError(_clock_msg % url)
clock = time #lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock")
clock_getres = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock_getres")
clock_gettime = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock_gettime")
clock_settime = lambda: _clock_xx("https://docs.python.org/3/library/time.html#time.clock_settime")
CLOCK_HIGHRES = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_HIGHRES"
CLOCK_MONOTONIC = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_MONOTONIC"
CLOCK_MONOTONIC_RAW = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_MONOTONIC_RAW"
CLOCK_PROCESS_CPUTIME_ID = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_PROCESS_CPUTIME_ID"
CLOCK_REALTIME = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_REALTIME"
CLOCK_THREAD_CPUTIME_ID = _clock_msg % "https://docs.python.org/3/library/time.html#time.CLOCK_THREAD_CPUTIME_ID"

class ClockInfo:

    def __init__(self, *kw):
        for key, value in kw.items():
            setattr(self, key, value)

def get_clock_info(cl):

    if cl == 'monotonic':
        return ClockInfo(adjustable=False,
                         implementation='window.performance.now',
                         monotonic=True,
                         resolution=0.000001)
    elif cl == 'perf_counter' or cl == 'process_time':
        return ClockInfo(adjustable=False,
                         implementation='date.getTime',
                         monotonic=False,
                         resolution=0.001)
    else:
        _clock_xx("https://docs.python.org/3/library/time.html#time.get_clock_info")

def tzset():
    pass
