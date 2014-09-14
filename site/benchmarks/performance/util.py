#!/usr/bin/env python

"""Utility code for benchmark scripts."""

__author__ = "collinwinter@google.com (Collin Winter)"

import math
#import operator

def run_benchmark(take_geo_mean, num_runs, bench_func, *args):
    """Run the given benchmark, print results to stdout.

    Args:
        options: optparse.Values instance.
        num_runs: number of times to run the benchmark
        bench_func: benchmark function. `num_runs, *args` will be passed to this
            function. This should return a list of floats (benchmark execution
            times).
    """
    #if options.profile:
    #    import cProfile
    #    prof = cProfile.Profile()
    #    prof.runcall(bench_func, num_runs, *args)
    #    prof.print_stats(sort=options.profile_sort)
    #else:
    data = bench_func(num_runs, *args)
    if take_geo_mean:
       product=1
       _total=0
       for _x in data:
           _total+=_x
           product *= _x
       _geo_mean=math.pow(product, 1.0 / len(data))
       return "Runs: %d, Total Time:%5.3f, Geo Mean:%6.4f" % (len(data), _total, _geo_mean)
    else:
       for x in data:
           print(x)
