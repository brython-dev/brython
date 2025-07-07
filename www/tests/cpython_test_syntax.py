import unittest
suite = unittest.defaultTestLoader.loadTestsFromName('test.test_syntax')
test_result = unittest.TextTestRunner(verbosity=2).run(suite)

if not test_result.wasSuccessful():
    raise AssertionError()