#!/usr/bin/env python

"""Microbenchmark for function call overhead.

This measures simple function calls that are not methods, do not use varargs or
kwargs, and do not use tuple unpacking.
"""

# Python imports
#import optparse
import time

# Local imports
import util


def foo(a, b, c, d):
    # 20 calls
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)
    bar(a, b, c)


def bar(a, b, c):
    # 20 calls
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)
    baz(a, b)


def baz(a, b):
    # 20 calls
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)
    quux(a)


def quux(a):
    # 20 calls
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()
    qux()


def qux():
    pass


def test_calls(iterations):
    from browser import console
    times = []
    for _i in range(iterations):
        console.log("iteration: %s" % _i)
        t0 = time.time()
        # 40 calls
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        foo(1, 2, 3, 4)
        t1 = time.time()
        times.append(t1 - t0)
    return times

def run(num_runs=100, take_geo_mean=True):
    return util.run_benchmark(take_geo_mean, num_runs, test_calls)

#if __name__ == "__main__":
#    parser = optparse.OptionParser(
#        usage="%prog [options] [test]",
#        description=("Test the performance of simple Python-to-Python function"
#                     " calls."))
#    util.add_standard_options_to(parser)
#    options, _ = parser.parse_args()

#    # Priming run.
#    test_calls(1)

#    util.run_benchmark(options, options.num_runs, test_calls)
