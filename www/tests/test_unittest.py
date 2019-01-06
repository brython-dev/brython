import unittest

class IntegerArithmeticTestCase(unittest.TestCase):

    def testAdd(self):  ## test method names begin 'test*'
        self.assertEqual((1 + 2), 3)
        self.assertEqual(0 + 1, 1)
    def testMultiply(self):
        self.assertEqual((0 * 10), 0)
        self.assertEqual((5 * 8), 40)


suite = unittest.TestLoader().loadTestsFromTestCase(IntegerArithmeticTestCase)
unittest.TextTestRunner(verbosity=0).run(suite)

class UserCode():

    def add(x, y):
        return x + y


class TestUserCode(unittest.TestCase):

    def test_returnsNumber(self):
        self.assertTrue(isinstance(UserCode.add(1, 1), int))

    def test_addsCorrectly(self):
        self.assertEqual(UserCode.add(1, 1), 2)

    # testing how brython unittest responds to errors
    def test_fails(self):
        self.assertEqual(UserCode.add(2, 2), 5)


suite = unittest.TestLoader().loadTestsFromTestCase(TestUserCode)
unittest.TextTestRunner(verbosity=1).run(suite)