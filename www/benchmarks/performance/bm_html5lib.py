#!/usr/bin/env python

"""Wrapper script for testing the performance of the html5lib HTML 5 parser.

The input data is the spec document for HTML 5, written in HTML 5.
The spec was pulled from http://svn.whatwg.org/webapps/index.
"""

#from __future__ import with_statement

__author__ = "collinwinter@google.com (Collin Winter)"

# Python imports
#import StringIO
import io
#import optparse
import os
import time

# Local imports
import util

# html5lib imports
import html5lib


def test_html5lib(count, spec_data):
    # No warm-up runs for this benchmark; in real life, the parser doesn't get
    # to warm up (this isn't a daemon process).

    times = []
    for _ in range(count):
        spec_data.seek(0)
        t0 = time.time()
        html5lib.parse(spec_data)
        t1 = time.time()
        times.append(t1 - t0)
    return times

def run(num_runs=1, geo_mean=True):
    # Get all our IO over with early.
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    spec_filename = os.path.join(data_dir, "html5lib_spec.html")
    with open(spec_filename) as spec_fh:
        spec_data = io.StringIO(spec_fh.read())

    util.run_benchmark(geo_mean, num_runs, test_html5lib, spec_data)



#if __name__ == "__main__":
#    parser = optparse.OptionParser(
#        usage="%prog [options]",
#        description=("Test the performance of the html5lib parser."))
#    util.add_standard_options_to(parser)
#    options, args = parser.parse_args()

#    # Get all our IO over with early.
#    data_dir = os.path.join(os.path.dirname(__file__), "data")
#    spec_filename = os.path.join(data_dir, "html5lib_spec.html")
#    with open(spec_filename) as spec_fh:
#        spec_data = StringIO.StringIO(spec_fh.read())

#    util.run_benchmark(options, options.num_runs, test_html5lib, spec_data)
