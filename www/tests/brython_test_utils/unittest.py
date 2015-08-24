
import brython_test_utils as utils
import unittest


# TODO: Not needed if test cases are written in unittest style
class BrythonModuleTestCase(unittest.TestCase):
    def __init__(self, modname, caption):
        unittest.TestCase.__init__(self)
        self.modname = modname
        self.caption = caption

    def shortDescription(self):
        return "Brython test module '%s'" % self.caption

    def runTest(self):
        status, tstart, tend = utils.run_test_module(self.modname)
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
                for label, options in utils.discover_brython_test_modules()
            )


