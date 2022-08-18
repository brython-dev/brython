import sys

import import_bug.A
assert type(import_bug.A) is type(sys)

from import_bug.A import A
assert type(import_bug.A) is type

from import_bug.B import B

import import_bug.generic._base