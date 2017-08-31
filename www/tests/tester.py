"""Substitute for unittest

If a class inherits Tester, calling its method run() on an instance runs alls
the methods starting with "test_". Before running the method, executes method
setUp() if present.

If the test failed, print the exception, and the line in the script where the
exception happened.
"""

import re
import sys
import time

class _AssertRaisesBaseContext(object):

    def __init__(self, expected, test_case, callable_obj=None,
                 expected_regex=None):
        self.expected = expected
        self.test_case = test_case
        if callable_obj is not None:
            try:
                self.obj_name = callable_obj.__name__
            except AttributeError:
                self.obj_name = str(callable_obj)
        else:
            self.obj_name = None
        if isinstance(expected_regex, (bytes, str)):
            expected_regex = re.compile(expected_regex)
        self.expected_regex = expected_regex
        self.msg = None

    def _raiseFailure(self, msg):
        raise Exception(msg)

    def handle(self, name, callable_obj, args, kwargs):
        """
        If callable_obj is None, assertRaises/Warns is being used as a
        context manager, so check for a 'msg' kwarg and return self.
        If callable_obj is not None, call it passing args and kwargs.
        """
        if callable_obj is None:
            self.msg = kwargs.pop('msg', None)
            return self
        with self:
            callable_obj(*args, **kwargs)



class _AssertRaisesContext(_AssertRaisesBaseContext):
    """A context manager used to implement TestCase.assertRaises* methods."""

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, tb):
        if exc_type is None:
            try:
                exc_name = self.expected.__name__
            except AttributeError:
                exc_name = str(self.expected)
            if self.obj_name:
                self._raiseFailure("{} not raised by {}".format(exc_name,
                                                                self.obj_name))
            else:
                self._raiseFailure("{} not raised".format(exc_name))
        if not issubclass(exc_type, self.expected):
            # let unexpected exceptions pass through
            return False
        # store exception, without traceback, for later retrieval
        self.exception = exc_value.with_traceback(None)
        if self.expected_regex is None:
            return True

        expected_regex = self.expected_regex
        if not expected_regex.search(str(exc_value)):
            self._raiseFailure('"{}" does not match "{}"'.format(
                     expected_regex.pattern, str(exc_value)))
        return True


class Tester:

    def assertEqual(self, result, expected, msg=None):
        if result != expected:
            if msg is not None:
                raise AssertionError(msg)
            raise AssertionError('assertEqual, expected %s, got %s'
                %(expected, result))

    def assertNotEqual(self, result, expected):
        if result == expected:
            raise AssertionError('assertNotEqual, expected %s, got %s'
                %(expected, result))

    def assertRaises(self, excClass, callableObj=None, *args, **kwargs):
        context = _AssertRaisesContext(excClass, self, callableObj)
        return context.handle('assertRaises', callableObj, args, kwargs)

    def assertIs(self, a, b):
        if not a is b:
            raise AssertionError('%s is %s should be true' %(a,b))

    def assertIsInstance(self, obj, klass):
        if not isinstance(obj, klass):
            raise AssertionError('%s is not an instance of %s' %(obj, klass))

    def assertIsNot(self, a, b):
        if a is b:
            raise AssertionError('%s is %s should be false' %(a,b))

    def assertIn(self, item, container):
        if not item in container:
            raise AssertionError('%s should be in %s' %(item, container))

    def assertNotIn(self, item, container):
        if item in container:
            raise AssertionError('%s should not be in %s' %(item, container))

    def assertTrue(self, item, msg=None):
        if item is not True:
            raise AssertionError(msg or '%s is not True' %item)

    def assertFalse(self, item, msg=None):
        if item is not False:
            raise AssertionError(msg or '%s is not False' %item)

    def fail(self, *args):
        raise Exception(str(args))

    def run(self, *methods):
        if not methods:
            methods = [m for m in dir(self) if m.startswith('test_')
                and callable(getattr(self, m))]
        report = TestReport(type(self).__name__)
        for method in methods:
            if method.startswith('test'):
                f = getattr(self, method)
                lineno = f.__code__.co_firstlineno
                if hasattr(self, 'setUp'):
                    self.setUp()
                t0 = time.time()
                try:
                    f()
                    report.add(method[5:], lineno,
                        round((time.time()-t0)*1000), 'ok')
                except SkipTest as exc:
                    print('skip test', exc)
                    report.add(method[5:], lineno,
                        round((time.time()-t0)*1000), 'skipped')
                except Exception as exc:
                    errmsg = str(exc)
                    errline = '<nc>'
                    tb = sys.exc_info()[2]
                    try:
                        fname = tb.tb_frame.f_code.co_filename
                    except:
                        fname = '<nc>'
                    while True:
                        if fname == type(self).__module__:
                            errline = tb.tb_lineno
                            break
                        tb = tb.tb_next
                        if tb is None:
                            break
                        fname = tb.tb_frame.f_code.co_filename
                    report.add(method[5:], lineno,
                        round((time.time()-t0)*1000), 'fail',
                        'line {}\n{}'.format(errline, errmsg))
        return report

class MethodReport:
    """Stores the results on a method : line number, execution time, status
    (one of "ok", "skipped", "error") and optional additional information"""

    def __init__(self, lineno, time, status, args):
        self.lineno = lineno
        self.time = time
        self.status = status
        self.args = args


class TestReport:
    """Used to store the results of tests on a class"""

    def __init__(self, class_name):
        self.class_name = class_name
        self.records = {}

    def add(self, method, lineno, time, status, *args):
        self.records[method] = MethodReport(lineno, time, status, args)

    def format_html(self, name="test_report"):
        """Returns the report as an HTML table"""
        html = ('<table id="%s" class="report">\n' %name +
            '<tr class="header"><th>Test</th><th>Line</th><th>Time (ms)</th>'+
            '<th>Status</th><th>Comments</th></tr>\n')
        methods = list(self.records.keys())
        methods.sort()
        for method in methods:
            value = self.records[method]
            html += ('<tr class="method"><td>{0}</td>'+
                '<td class="number">{1.lineno}</td>'+
                '<td class="number">{1.time}</td>'+
                '<td class="report_cell">{1.status}</td>').format(method, value)
            if value.args:
                html += '<td><pre>{}</pre></td>'.format(value.args[0])
            else:
                html += '<td>&nbsp;</td>'
            html += '</tr>\n'
        return html + '</table>'

    def __str__(self):
        res = 'Class %s\n' %self.class_name
        methods = list(self.records.keys())
        methods.sort()
        for method in methods:
            report = self.records[method]
            res += '{:15} {1.status} {1.lineno}\n    {1.args[0]}'.format(method, report)
        return res

TestCase = Tester # unittest interface

tester = Tester()
assertRaises = tester.assertRaises

class SkipTest(Exception):
    pass

def skip(msg):
    def decorator(f):
        def g(*args, **kw):
            print('raise skip test')
            raise SkipTest(msg)
        return g
    return decorator

def skipUnless(condition, msg):
    if condition:
        def decorator(f):
            return f
    else:
        def decorator(f):
            def g(*args, **kw):
                print('raise skip test')
                raise SkipTest(msg)
            return g
    return decorator

class Support:

    def cpython_only(self, func):
        def f(*args, **kw):
            raise SkipTest('CPython test only')
        return f

    def requires_IEEE_754(self, func):
        return func

support = Support()

if __name__=='__main__':
    t = 1, 2
    assertRaises(TypeError, t, '__setitem__', 0, 1)

