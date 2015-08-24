import sys
import unittest
import time
import traceback

def discover_brython_test_modules():
    # TODO : Test discovery based on file system paths
    return [
        ("Core language features", [
          ("test_suite.py", "basic test suite"),
          ("test_rmethods.py", "reflected methods"),
          ("test_bytes.py", "bytes"),
          ("test_classes.py", "classes"),
          ("test_decimals.py", "decimals"),
          ("test_decorators.py", "decorators"),
          ("test_descriptors.py", "descriptors"),
          ("test_dict.py", "dicts"),
          ("test_import.py", "imports"),
          ("test_iterators.py", "iterators"),
          ("test_generators.py", "generators"),
          ("test_list_methods.py", "lists"),
          ("test_numbers.py", "numbers"),
          ("test_print.py", "print"),
          ("test_set.py", "sets"),
          ("test_strings.py", "strings"),
          ("test_string_format.py", "string format"),
          ("test_string_methods.py", "string methods")
        ]),
        ("Issues", [
          ("issues_gc.py", "issues (GC)"),
          ("issues_bb.py", "issues (BB)"),
          ("issues.py", "issues")
        ]),
        ("Modules", [
          ("test_random.py", "random"),
          ("test_re.py", "re"),
          ("test_unittest.py", "unittest"),
          ("test_bisect.py", "bisect"),
          ("test_collections.py", "collections"),
          ("test_datetime.py", "datetime"),
          ("test_hashlib.py", "hashlib"),
          ("test_indexedDB.py", "indexedDB"),
          ("test_itertools.py", "itertools"),
          ("test_json.py", "JSON"),
          ("test_math.py", "math"),
          ("test_storage.py", "storage"),
#          ("test_time.py", "time"),
          ("test_types.py", "types")
        ])]

# TODO: Not needed if test cases are written in unittest style
class BrythonModuleTestCase(unittest.TestCase):
    def __init__(self, modname, caption):
        unittest.TestCase.__init__(self)
        self.modname = modname
        self.caption = caption

    def shortDescription(self):
        return "Brython test module '%s'" % self.caption

    def runTest(self):
        status, tstart, tend = run_test_module(self.modname)
        # TODO: Record and output generated traceback
        self.assertEquals(1, status,
                          "Failure detected for module '%s'" % self.modname);


class NamedTestSuite(unittest.BaseTestSuite):
    """A test suite grouping by name a set of test cases.
    """
    def __init__(self, groupname, tests=()):
        self.caption = groupname
        unittest.BaseTestSuite.__init__(self, tests)


class OneTimeTestResult(unittest.TestResult):
    """Only keep track of the outcome of the most recently executed test case.
    """
    def __init__(self, stream=None, descriptions=None, verbosity=None):
        unittest.TestResult.__init__(self, stream, descriptions, verbosity)
        self.failures = self.errors = self.skipped = None
        self.unexpectedSuccesses = self.expectedFailures = None
        self.lastOutcome = self.details = None

    def startTest(self, test):
        # Clear state before running each test to avoid fragile tests
        self.lastOutcome = self.details = None

    def _addUnexpected(self, test, err, status):
        self.lastOutcome = status;
        self.details = self._exc_info_to_string(err, test)

    def addError(self, test, err):
        self._addUnexpected(test, err, 'ERROR')

    def addFailure(self, test, err):
        self._addUnexpected(test, err, 'FAILED')

    def addSuccess(self, test):
        self.lastOutcome = 'OK';
        self.details = None

    def addSkip(self, test, reason):
        self.lastOutcome = 'SKIP'
        self.details = reason

    def addExpectedFailure(self, test, err):
        self._addUnexpected(test, err, 'OK')

    def addUnexpectedSuccess(self, test):
        self.lastOutcome = 'FAILED'
        self.details = 'Expecting failure but got success instead'

    def wasSuccessful(self):
        return self.lastOutcome == 'OK'

    def __repr__(self):
        return "<%s run=%i last=%s>" % (unittest.util.strclass(self.__class__),
                                        self.testsRun, self.lastOutcome)


def load_brython_test_cases():
    return unittest.TestSuite(
                NamedTestSuite('Brython : ' + label,
                               (BrythonModuleTestCase(filenm, caption)
                                        for filenm, caption in options)
                               )
                for label, options in discover_brython_test_modules()
            )

def populate_testmod_input(elem, selected=None):
    """Build a multiple selection control including test modules
    """
    from browser import html
    groups = discover_brython_test_modules()
    for label, options in groups:
        g = html.OPTGROUP(label=label)
        elem <= g
        for filenm, caption in options:
            if filenm == selected:
                o = html.OPTION(caption, value=filenm, selected='')
            else:
                o = html.OPTION(caption, value=filenm)
            g <= o

def run(src):
    t0 = time.perf_counter()
    try:
        ns = {'__name__':'__main__'}
        exec(src, ns)
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    t1 = time.perf_counter()
    return state, t0, t1

def run_test_module(filename, base_path=''):
    src = open(base_path + filename).read()
    return run(src)

