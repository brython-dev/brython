"""Substitute for unittest

If a class inherits Tester, calling its method run() on an instance runs alls 
the methods starting with "test_". Before running the method, executes method
setUp() if present.

If the test failed, print the exception, and the line in the script where the
exception happened.
"""

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
    
    def assertEqual(self, result, expected):
        if result != expected:
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
            methods = [m for m in dir(self) if m.startswith('test_')]
        print('Test '+type(self).__name__)
        print('{:20}{:4} {:5} Status'.format('Test', 'Line', 'Time'))
        print('-'*37)
        for method in methods:
            if method.startswith('test'):
                f = getattr(self, method)
                lineno = f.__code__.co_firstlineno
                if hasattr(self, 'setUp'):
                    self.setUp()
                t0 = time.time()
                try:
                    f()
                    print('{:<20}{:4} {:5} ok '.format(method[5:25], lineno,
                        round((time.time()-t0)*1000)))
                except SkipTest as exc:
                    print('{:<20}{:4} {:5} skipped '.format(method[5:25], lineno,
                        round((time.time()-t0)*1000)))
                except Exception as exc:
                    errmsg = str(exc)
                    errline = '<nc>'
                    tb = sys.exc_info()[2]
                    try:
                        fname = tb.tb_frame.f_code.co_filename
                    except:
                        print(method, 'fcode', tb.tb_frame.f_globals)
                        fname = '<nc>'
                    while True:
                        if fname == type(self).__module__:
                            errline = tb.tb_lineno
                            break
                        tb = tb.tb_next
                        if tb is None:
                            break
                        fname = tb.tb_frame.f_code.co_filename
                    print('{:<20}{:4} {:5} error line {}: {} '.format(
                        method[5:25], lineno, round((time.time()-t0)*1000),
                        errline, errmsg))
        print()
    
TestCase = Tester # unittest interface

tester = Tester()
assertRaises = tester.assertRaises

class SkipTest(Exception):
    pass

class Support:

    def cpython_only(self, func):
        def f(*args, **kw):
            raise SkipTest('CPython test only')
        return f

support = Support()

if __name__=='__main__':
    t = 1, 2
    assertRaises(TypeError, t, '__setitem__', 0, 1)
    