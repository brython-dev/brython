# issue 789

from functools import *

@total_ordering
class Test:

    def __eq__(self, other):
        pass

    def __lt__(self, other):
        pass

# issue 1383
import random

func = partial(random.randrange, 100)
func()