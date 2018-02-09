from datetime import MINYEAR, MAXYEAR, timedelta, date, datetime
#todo: issue when importing from a module, one object at a time.
# for example, the next three lines
#from datetime import tzinfo
#from datetime import time
#from datetime import date, datetime

assert MINYEAR == 1
assert MAXYEAR == 9999

assert timedelta() == timedelta(weeks=0, days=0, hours=0, minutes=0, seconds=0, \
                                milliseconds=0, microseconds=0)

assert timedelta(1) == timedelta(days=1)
assert timedelta(0,1) == timedelta(seconds=1)
assert timedelta(0,0,1) == timedelta(microseconds=1)
assert timedelta(weeks=1) == timedelta(days=7)
assert timedelta(days=1) == timedelta(hours=24)
assert timedelta(hours=1) == timedelta(minutes=60)
assert timedelta(minutes=1) == timedelta(seconds=60)
assert timedelta(seconds=1) == timedelta(milliseconds=1000)
assert timedelta(milliseconds=1) == timedelta(microseconds=1000)

assert timedelta(weeks=1.0/7) ==  timedelta(days=1)
assert timedelta(days=1.0/24) ==  timedelta(hours=1)
assert timedelta(hours=1.0/60) ==  timedelta(minutes=1)
assert timedelta(minutes=1.0/60) ==  timedelta(seconds=1)
assert timedelta(seconds=0.001) == timedelta(milliseconds=1)
assert timedelta(milliseconds=0.001) == timedelta(microseconds=1)

_d=date(2013, 3, 8)
assert _d + timedelta(days=1) == date(2013, 3, 9)
assert _d + timedelta(days=-1) == date(2013, 3, 7)


a = timedelta(7) # One week
b = timedelta(0, 60) # One minute
c = timedelta(0, 0, 1000) # One millisecond
assert a+b+c == timedelta(7, 60, 1000)
assert a-b == timedelta(6,24*3600 - 60)

#issues with -a and +a
#assert -a == timedelta(-7)
#assert +a == timedelta(7)

#issues with -b and -c
#assert -b == timedelta(-1, 24*3600 - 60)
#assert -c == timedelta(-1, 24*3600 - 1, 999000)

assert abs(a) == a

#issues with -a
#assert abs(-a) == a

#test basic attributes
days, seconds, us = 1, 7, 31
td = timedelta(days, seconds, us)
assert td.days == days
assert td.seconds ==  seconds
assert td.microseconds == us


td = timedelta(days=365)
assert td.total_seconds() == 31536000.0

for total_seconds in [123456.789012, -123456.789012, 0.123456, 0, 1e6]:
    td = timedelta(seconds=total_seconds)
    assert td.total_seconds() == total_seconds

    # Issue8644: Test that td.total_seconds() has the same
    # accuracy as td / timedelta(seconds=1).
    for ms in [-1, -2, -123]:
        td = timedelta(microseconds=ms)
        assert td.total_seconds() == \
               ((24*3600*td.days + td.seconds)*10**6+ td.microseconds)/10**6

assert isinstance(timedelta.min, timedelta)
assert isinstance(timedelta.max, timedelta)
assert isinstance(timedelta.resolution, timedelta)
assert timedelta.max > timedelta.min

assert timedelta.min == timedelta(-999999999)
assert timedelta.max == timedelta(999999999, 24*3600-1, 1e6-1)
assert timedelta.resolution == timedelta(0, 0, 1)

  # Single-field rounding.
assert timedelta(milliseconds=0.4/1000) == timedelta(0)    # rounds to 0
assert timedelta(milliseconds=-0.4/1000) == timedelta(0)    # rounds to 0
assert timedelta(milliseconds=0.6/1000) == timedelta(microseconds=1)
assert timedelta(milliseconds=-0.6/1000) == timedelta(microseconds=-1)

# Rounding due to contributions from more than one field.
us_per_hour = 3600e6
us_per_day = us_per_hour * 24
assert timedelta(days=0.4/us_per_day) == timedelta(0)
#assert timedelta(hours=0.2/us_per_hour) == timedelta(0)
#assert timedelta(days=0.4/us_per_day, hours=0.2/us_per_hour) == timedelta(microseconds=1)

assert timedelta(days=-0.4/us_per_day) == timedelta(0)
#assert timedelta(hours=-0.2/us_per_hour) == timedelta(0)
#assert timedelta(days=-0.4/us_per_day, hours=-0.2/us_per_hour) == timedelta(microseconds=-1)

# issue 295
assert datetime.strptime('2014-01-01','%Y-%m-%d') == datetime(2014,1,1,0,0)

d = date(2010, 9, 7)

assert "The year is {0.year}".format(d) == "The year is 2010"
assert "Tested on {0:%Y-%m-%d}".format(d) == "Tested on 2010-09-07"

d = datetime(2010, 7, 4, 12, 15, 58)
assert '{:%Y-%m-%d %H:%M:%S}'.format(d) == '2010-07-04 12:15:58'

print('passed all tests')