from simple import text

assert text=="text in simple"

import from_import_test as mod

#the following should work (it does in cpython).
_a=mod.MyRelativeTest()
print(str(_a) == "Success!")

print(mod.test1() == "test1")
print(mod.test2() == "test2")
print(mod.test3() == "test3")

#the following should not work, but does
# it looks like the classes and modules are in the wrong scope.
# is in __main__ scope but should be in mod scope

_a=MyRelativeTest()
#since we defined __str__ it should print out "Success!", but somehow
#brython is overriding the __str__ function
print(str(_a) == "Success!")

print(test1() == "test1")
print(test2() == "test2")
print(test3() == "test3")
