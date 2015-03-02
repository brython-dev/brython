#!/usr/bin/env python

"""Benchmark how quickly Python's regex implementation can compile regexes.

We bring in all the regexes used by the other regex benchmarks, capture them by
stubbing out the re module, then compile those regexes repeatedly. We muck with
the re module's caching to force it to recompile every regex we give it.
"""

# Python imports
#import optparse
import re
import time

# Local imports
import util


class EmptyCache(object):

    """Stub out re._cache to always be empty."""

    def get(self, *args):
        return None

    def clear(self):
        return None

    def __setitem__(self, *args):
        pass

    def __len__(self):
        return 0


def capture_regexes():
    regexes = []

    real_compile = re.compile
    real_search = re.search
    real_sub = re.sub

    def capture_compile(regex, flags=0):
        regexes.append((regex, flags))
        return real_compile(regex, flags)

    def capture_search(regex, target, flags=0):
        regexes.append((regex, flags))
        return real_search(regex, target, flags)

    def capture_sub(regex, *args):
        regexes.append((regex, 0))
        return real_sub(regex, *args)

    re.compile = capture_compile
    re.search = capture_search
    re.sub = capture_sub
    try:
        import bm_regex_effbot
        bm_regex_effbot.test_regex_effbot(1)

        import bm_regex_v8
        bm_regex_v8.test_regex_v8(1)
    finally:
        re.compile = real_compile
        re.search = real_search
        re.sub = real_sub
    return regexes


def test_regex_compile(count):
    re._cache = EmptyCache()
    regexes = capture_regexes()
    times = []

    for _ in range(count):
        t0 = time.time()
        for regex, flags in regexes:
            re.compile(regex, flags)
        t1 = time.time()
        times.append(t1 - t0)
    return times

def run(num_runs=100, take_geo_mean=True):
    return util.run_benchmark(take_geo_mean, num_runs, test_regex_compile)


#if __name__ == "__main__":
#    parser = optparse.OptionParser(
#        usage="%prog [options]",
#        description=("Test regex compilation performance"))
#    util.add_standard_options_to(parser)
#    options, args = parser.parse_args()

#    util.run_benchmark(options, options.num_runs, test_regex_compile)
