from datetime import MINYEAR, MAXYEAR, UTC, timedelta, date, datetime, timezone
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

# issue 1194
s = '2019-08-05T22:24:10.544Z'
dt = datetime.strptime(s,"%Y-%m-%dT%H:%M:%S.%f%z")
assert str(dt) == "2019-08-05 22:24:10.544000+00:00"

# issue 1755
date = "Thu, 26 Aug 2021 00:00:00 GMT"
dt = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S GMT")
assert dt == datetime(2021, 8, 26, 0, 0)

# issue 1845
for d in ['01.02.2020', '01/02/2020', '01-02-2020']:
    try:
        datetime.strptime(d, '%d%m%Y')
        raise Exception('should have raised ValueError')
    except ValueError:
        pass

d = datetime(2020,2, 1)
assert datetime.strptime('01.02.2020', '%d.%m.%Y') == d
assert datetime.strptime('01/02/2020', '%d/%m/%Y') == d
assert datetime.strptime('01-02-2020', '%d-%m-%Y') == d

assert datetime.strptime('3.2.2020', '%d.%m.%Y') == datetime(2020, 2, 3)

# issue 1847
import time
assert time.strptime(f'01.02.2020', '%d.%m.%Y').tm_wday == 5

# issue 1848
try:
    datetime.strptime('1.1.10000', '%d.%m.%Y')
    raise Exception('should have raised ValueError')
except ValueError:
    pass

# issue 1849
assert datetime.strptime('11-12-2013', '%d-%m-%Y') == \
    datetime(2013, 12, 11, 0, 0)
assert datetime.strptime('09-09-2013', '%d-%m-%Y') == \
    datetime(2013, 9, 9, 0, 0)
assert datetime.strptime('9-9-2013', '%d-%m-%Y') == \
    datetime(2013, 9, 9, 0, 0)

assert list(time.strptime('11-12-2013', '%d-%m-%Y')) == \
    [2013, 12, 11, 0, 0, 0, 2, 345, -1]

assert list(time.strptime('09-09-2013', '%d-%m-%Y')) == \
    [2013, 9, 9, 0, 0, 0, 0, 252, -1]

assert list(time.strptime('9-9-2013', '%d-%m-%Y')) == \
    [2013, 9, 9, 0, 0, 0, 0, 252, -1]

# issue 1917
datetime.now(UTC).replace(tzinfo=timezone.utc).astimezone(tz=None)

# https://groups.google.com/g/brython/c/jC3c2aP4bFw/m/G-uyAe8lAwAJ
from tester import assert_raises

dt = datetime

for date_str, exp_date_obj in [
        ("July 21, 2024 1:30 AM", dt(2024, 7, 21, 1, 30)),
        ("July 21, 2024 11:30 AM", dt(2024, 7, 21, 11, 30)),
        ("July 21, 2024 12:30 AM", dt(2024, 7, 21, 0, 30)),
        ("July 21, 2024 1:30 PM", dt(2024, 7, 21, 13, 30)),
        ("July 21, 2024 12:30 PM", dt(2024, 7, 21, 12, 30)),
  ]:
    date_obj = dt.strptime(date_str, "%B %d, %Y %I:%M %p")
    assert date_obj == exp_date_obj, (date_obj, exp_date_obj)

for date_str in [
        ("July 21, 2024 13:30 AM"),
        ("July 21, 2024 0:30 AM"),
        ("July 21, 2024 0:30 PM"),
        ("July 21, 2024 13:30 PM")
        ]:
    assert_raises(ValueError, dt.strptime, date_str, "%B %d, %Y %I:%M %p")

# issue 2577
format_string = '%Y-%m-%d %H:%M:%S %z'
timestamp_string = "2025-05-16 07:15:11 -0400"
d = datetime.strptime(timestamp_string, format_string)
assert repr(d) == 'datetime.datetime(2025, 5, 16, 7, 15, 11, ' \
  'tzinfo=datetime.timezone(datetime.timedelta(days=-1, seconds=72000)))'

# issue 2585
date_str = None
assert_raises(TypeError, datetime.strptime, date_str, '%Y-%m-%d')
  
print('passed all tests')