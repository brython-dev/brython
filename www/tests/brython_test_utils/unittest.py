from browser import window
import brython_test_utils as utils
import unittest


# TODO: Not needed if test cases are written in unittest style
class BrythonModuleTestCase(unittest.TestCase):
    def __init__(self, modname, caption, base_path=''):
        unittest.TestCase.__init__(self)
        self.modname = modname
        self.caption = caption
        self.base_path = base_path

    def shortDescription(self):
        return "Brython test module '%s'" % self.caption

    def runTest(self):
        status, tstart, tend, msg, aio_manager = utils.run_test_module(self.modname,
                                                     self.base_path)
        # TODO: Record and output generated traceback
        if not status == 1:
            raise self.failureException("Failure detected for module '%s'\n\n"
                          "%s" % (self.modname, msg))


def qunit_test(testName, test, result):
    def wrapped_test(qunit):
        test(result)
        if result.details:
            msg = '[' + result.lastOutcome + '] - ' + result.details
        else:
            msg = ''
        qunit.ok(result.wasSuccessful(), msg)
        if result.lastOutcome == 'SKIP':
            # QUnit can't skip tests based on runtime behavior, so this is
            # a bit of a hack. This adds a new test with the same name
            # as the currently running test and marks that it should be skipped.
            window.QUnit.skip(testName)
    return wrapped_test


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
        self.details = self._exc_info_to_string(err, test, includeInternal=True)

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
        return self.lastOutcome == 'OK' or self.lastOutcome == 'SKIP'

    def __repr__(self):
        return "<%s run=%i last=%s>" % (unittest.util.strclass(self.__class__),
                                        self.testsRun, self.lastOutcome)


def load_brython_test_cases(base_path=''):
    ret = []
    for label, options in utils.discover_brython_test_modules():
        tcs = []
        for filenm, caption in options:
            tcs.append(BrythonModuleTestCase(filenm, caption, base_path))
        ret.append(NamedTestSuite('Brython :' + label, tcs))
    return unittest.TestSuite(ret)

