# Module for profiling brython code.
#
# Written by Jonathan L. Verner
#
# Interface tries to follow the official python profile module by Sjoerd Mullender...
# which was hacked somewhat by: Guido van Rossum

"""
    Module for profiling Python code run in the browser via Brython.

    The module tries to provide interface which is as similar to the official python
    profile module. The notable difference is that it does not allow user-defined
    timers and does not do any callibration. Methods which in the standard module
    save the data to a file save a JSON-serialized version of the data to the browser's
    local storage instead.

    Basic usage:

        from profile import Profile

        p = Profile()
        p.enable()
        do_something()
        do_something_else()
        p.create_stats()

    Which will print out something like:

            1 run in 0.249 seconds

        Ordered by: standard name (averaged over 1 run)

        ncalls  tottime  percall  cumtime  var percall  module.function:lineno
         101/1    0.023    0.000    1.012        0.010               .fact:180

    where each line corresponds to a function and the different columns correspond  to

        ncalls      is the total number number of times the function was called
                    (if the function was called non-recursively, the second number
                    behind the backslash indicates how many calls were top-level calls
                    in the recursion)

        tottime     is the total time (in seconds) spent in the function not including subcalls

        percall     is the average time spent in the function per call, not including subcalls

        cumtime     is the total time spent in function including subcalls

        var percall is the average time spent in function per one non-recursive call

        standard name is the name of the function in the form module.function_name:line_number

    Optionally one can also use the following form, taking advantage of running the code
    several times and averaging it out:

        from profile import Profile

        p = Profile()
        p.call(function_to_profile,200,arg1,arg2,kwarg1=v1)

    which will print out something like:

            200 runs in 0.249 seconds

        Ordered by: standard name (averaged over 1 run)

        ncalls  tottime  percall  cumtime  var percall  module.function:lineno
         101/1    0.023    0.000    1.012        0.010  function_to_profile:16

    Collected profile data can be saved to local storage for later use:

        p.dump_stats('run1')

    Profile data can also be read back:

        data = Stats('run1')

    And aggregated together

        data.add(p.dump_stats())
        print(data)
"""

import _profile
import json
from browser.local_storage import storage

__all__ = ["run","runctx","status","Stats","Profile"]

class Stats:
    @classmethod
    def current_stats(cls):
        return Stats(_profile.data,1)

    def __init__(self,data,nruns=None):
        """
           If data is a string, it should be a JSON-serialized version of Stats.

           Otherwise it should be a javascript object containing the collected profile data.
           This other form is not meant for public use.
        """
        self._ordering = "standard name"
        self._reverse_order = False
        self._sk = None

        if isinstance(data,str):
            self.from_json(data)
        else:
            self._data = data
            self.nruns = nruns
            self.line_counts = {k:data.line_counts[k] for k in dir(data.line_counts)}
            if hasattr(self._data,'profile_duration'):
                self.duration = self._data.profile_duration
            else:
                self.duration = _profile.elapsed()
            self.function_totals = {k:data.call_times_proper[k] for k in dir(data.call_times_proper)}
            self.function_cumulated_totals = {k:data.call_times[k] for k in dir(data.call_times)}
            self.function_counts = {k:data.call_counts[k] for k in dir(data.call_counts)}
            self.function_counts_nonrec = {k:data.call_counts_norec[k] for k in dir(data.call_counts)}
            self.callers = {}
            for func in dir(data.callers):
                func_data = data.callers[func]
                fd = {}
                for caller in dir(func_data):
                    cumulated,total,count,count_norec = func_data[caller]
                    fd[caller] = {'cumulated':cumulated,'total':total,'count':count,'count_norec':count_norec}
                self.callers[func] = fd

    def __json__(self):
        return json.dumps({
            'nruns':self.nruns,
            'line_counts':self.line_counts,
            'duration':self.duration,
            'function_counts':self.function_counts,
            'function_counts_nonrec':self.function_counts_nonrec,
            'function_cumulated_totals':self.function_cumulated_totals,
            'function_totals':self.function_totals,
            'callers':self.callers
        })

    def from_json(self,json_data):
        self._data=None
        data = json.loads(json_data)
        self.nruns = data['nruns']
        self.line_counts = data['line_counts']
        self.duration = data['duration']
        self.function_counts = data['function_counts']
        self.function_counts_nonrec = data['function_counts_nonrec']
        self.function_cumulated_totals = data['function_cumulated_totals']
        self.function_totals = data['function_totals']
        self.callers = data['callers']


    def add(self,*stats):
        """
            Add profile data from other Stats objects or from
            Stats objects serialized into JSON and saved under
            in browser's local storage under the given keys.

            @stats should be a sequence of items where each item is
            either (a) Stats instance (b) a key under which a Stats
            instance is saved in JSON-serialized form in local storage
            (c) a JSON-serialized instance of a Stats object.
        """
        for s in stats:
            if isinstance(s,Stats):
                self._add_stat(s)
            else:
                if s in storage:
                    st = Stats(storage[s])
                else:
                    st = Stats(s)
                self._add_stat(st)

    def _add_stat(self,stat):
        for f in stat.function_totals.keys():
            if f not in self.function_counts.keys():
                self.function_totals[f] = 0
                self.function_cumulated_totals[f]=0
                self.function_counts[f] = 0
                self.function_counts_nonrec[f] = 0
            self.function_totals[f] += stat.function_totals[f]
            self.function_cumulated_totals[f] += stat.function_cumulated_totals[f]
            self.function_counts[f] += stat.function_counts[f]
            self.function_counts_nonrec[f] += stat.function_counts_nonrec[f]
        for (f,callers) in stat.callers.items():
            if f not in self.callers:
                sc = self.callers[f] = {}
            for (caller,values) in callers.items():
                if caller not in sc:
                    sc[caller] = {'cumulated':0,'total':0,'count':0,'count_norec':0}
                sc[caller] = { k:sc[caller][k]+values[k] for k in ['cumulated','total','count','count_norec'] }
        if self._sk is not None:
            self.sort()


    def called_by_data(self, standard_calee_name):
        """
            Returns a dict indexed by standard function names
            (or module names in case of top-level calls).
            For each such function `f`, the dict contains
            data about time spent in the function argument:`standard_calee_name`
            when called from `f`.

            The data available is 'cumulated', 'total', 'count', 'count_norec'
            (see documentation of the method:`sort` for meaning of the keys)
        """
        call_data = self.callers[standard_calee_name]
        ret = {}
        for key, data in call_data.items():
            if ':' in key:
                location, func_name, func_def_line = key.split(':')
                standard_caller_name = func_name+':'+func_def_line
            else:
                ln, mod = key.split(',')
                standard_caller_name = mod

            if not standard_caller_name in ret:
                ret[standard_caller_name] = {'cumulated':0,'total':0,'count':0,'count_norec':0}
            for k, v in data.items():
                ret[standard_caller_name][k] += v
        return ret

    def relative_data(self, standard_name, relative_to):
        """
            Returns data how much time was spent in the funcition argument:`standard_name`
            relative to the time spent in argument:`relative_to`.

            The data available is 'cumulated', 'total', 'count', 'count_norec'
            (see documentation of the method:`sort` for meaning of the keys)
        """

        baseline = {
            'total':self.function_totals[relative_to],
            'cumulated':self.function_cumulated_totals[relative_to],
            'counts':self.function_counts[relative_to],
            'counts_nonrec':self.function_counts_nonrec[relative_to]
        }
        callers = self.called_by_data(standard_name)
        if relative_to in callers:
            ret = {}
            data = callers[relative_to]
            for key, v in data.items():
                if baseline[key] == 0:
                    ret[key] = float('inf')
                else:
                    ret[key] = data[key]/float(baseline[key])
        else:
            ret = {'cumulated':0,'total':0,'count':0,'count_norec':0}
        return ret



    def sort(self,key='standard name'):
        """
            Sort the stats according to key. Key can be any of the columns
            in the table resulting from converting Stats to a string, i.e.:

             - standard name (module.function:line_number)
             - ncalls        (number of calls the function is called)
             - tottime       (total time spent in function not including subcalls)
             - percall       (average time spent per call, not including subcalls)
             - cumtime       (total time spent in function including subcalls)
             - var percall   (average time spent in function per one non-recursive call)

        """
        self._ordering = key
        self._sk = self._sorted_keys()

    def _sorted_keys(self):
        if self._ordering == 'standard name':
            return sorted(self.function_totals.keys())
        if self._ordering == 'ncalls':
            keys = self.function_counts.items()
        elif self._ordering == 'tottime':
            keys = self.function_totals.items()
        elif self._ordering == 'percall':
            keys = [ (k,self.function_totals[k]/self.function_counts[k]) for k in self.function_counts.keys() ]
        elif self._ordering == 'cumtime':
            keys = self.function_cumulated_totals.items()
        elif self._ordering == 'var percall':
            keys = [ (k,self.function_cumulated_totals[k]/self.function_counts_nonrec[k]) for k in self.function_counts_nonrec.keys() ]
        return [k for k,v in sorted(keys,key=lambda x:x[1], reverse=not self._reverse_order)]

    def __str__(self):
        if self.nruns == 1:
            nruns = " 1 run"
        else:
            nruns = " "+str(self.nruns)+" runs"

        summary = " "*8+nruns+" in " + str(self.duration/1000) + " seconds"
        headers = [" ncalls"," tottime"," percall"," cumtime", " var percall", " module.function:lineno"]
        cols = []
        if self._sk is None:
            self.sort()
        for func in self._sk:
            ncalls = "{:.0f}".format(self.function_counts[func]/self.nruns)
            if self.function_counts[func] > self.function_counts_nonrec[func]:
                ncalls +="/{:.0f}".format(self.function_counts_nonrec[func]/self.nruns)
            tottime = self.function_totals[func]/self.nruns
            percall = (tottime/self.function_counts[func])/self.nruns
            cumtime = self.function_cumulated_totals[func]/self.nruns
            varpercall = (cumtime/self.function_counts_nonrec[func])/self.nruns
            cols.append((ncalls,"{:.3f}".format(tottime/1000),"{:.3f}".format(percall/1000),"{:.3f}".format(cumtime/1000),"{:.3f}".format(varpercall/1000),func))
        header = ' '.join(headers)
        table = [summary,"","Ordered by: "+self._ordering+" (averaged over "+nruns+")","",header]
        for col in cols:
            ln = []
            for pos in range(len(headers)):
                ln.append(col[pos].rjust(len(headers[pos])))
            table.append(' '.join(ln))
        return "\n".join(table)

    def __repr__(self):
        return self.__str__()

class Profile:
    def __init__(self):
        self._profile = None

    def enable(self):
        """
            Start collecting profile data.
        """
        _profile.start()

    def disable(self):
        """
            Stop collecting profile data.
        """
        _profile.pause()

    def clear(self):
        """
            Reset all profile counters (clear collected data) & stop collecting.
        """
        _profile.clear()

    def create_stats(self):
        """
            Stop collecting profile data and load them into
            a Stats object (which is returned).
        """
        _profile.stop()
        self._profile = Stats(_profile.data,1)
        return self._profile

    def status(self):
        return _profile.status()

    def print_stats(self,sort='standard name'):
        """
            Print stats ordered according to the sort key @sort:
            The key can be any of the columns in the table
            which is printed out, i.e.:

             - standard name (module.function:line_number)
             - ncalls        (number of calls the function is called)
             - tottime       (total time spent in function not including subcalls)
             - percall       (average time spent per call, not including subcalls)
             - cumtime       (total time spent in function including subcalls)
             - var percall   (average time spent in function per one non-recursive call)

        """
        if self._profile is None:
            print("No profile available. Need to collect profile data first using the enable() and disable() methods.")
        else:
            self._profile.sort(sort)
            print(str(self._profile))

    def dump_stats(self,storage_key=None):
        """
            Saves a JSON-serialized version of the Stats object
            to local storage under the @storage_key key.
        """
        if storage_key is not None:
            storage[storage_key]=self._profile.__json__()
        else:
            return self._profile

    def run(self,cmd,nruns=200):
        """
            Runs the command @cmd and collects profile data.
            The command is run @ntimes (200 by default) and
            the data is averaged over these runs.
        """
        self.runctx(cmd,globals(),locals(),ntimes=nruns)

    def runctx(self,cmd,globals,locals,nruns=200):
        """
            Runs the command @cmd with the given @globlas and @locals
            and collects profile data. The command is run @ntimes (200 by default) and
            the data is averaged over these runs.
        """
        _profile.stop()
        _profile.clear()
        _profile.start()
        for i in range(nruns):
            _profile.run(cmd,globals=globals,locals=locals)
        _profile.stop()
        self._profile = Stats(_profile.data,nruns)

    def runcall(self,func,ntimes,*args,**kwargs):
        """
            Calls the function @func with arguments @args, @kwargs
            and collects profile data. The function is called @ntimes
            and the data is averaged over these runs.
        """
        _profile.stop()
        _profile.clear()
        _profile.start()
        for i in range(ntimes):
            ret=func(*args,**kwargs)
        _profile.stop()
        self._profile = Stats(_profile.data,ntimes)
        return self._profile

def run(cmd,nruns=200):
    """
        Runs the command @cmd and collects profile data.
        The command is run @ntimes (200 by default) and
        the data is averaged over these runs. Returns
        a Stats object with the collected data.
    """
    return runctx(cmd,globals(),locals(),nruns=nruns)

def runctx(cmd,globals=None,locals=None,nruns=200):
    """
        Runs the command @cmd with with the given @globlas and @locals
        and collects profile data. The command is run @nruns (200 by default) and
        the data is averaged over these runs. Returns
        a Stats object with the collected data.
    """
    _locals = locals or {}
    _globals = globals or {}
    _profile.start()
    _profile.run(cmd,_globals,_locals,nruns)
    _profile.stop()
    return Stats(_profile.data,nruns)

status = _profile.status
