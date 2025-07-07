import doctest
import test_failing_doctest

result = doctest.testmod(test_failing_doctest)
assert result.failed == 2
assert result.attempted == 9