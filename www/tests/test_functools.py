# issue 789

from functools import *
@total_ordering
class Test:
    def __eq__(self, other):
        pass
    def __lt__(self, other):
        pass
