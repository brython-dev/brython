from javascript import JSObject

assert(JSObject(null) == None)
assert(JSObject(null) is None)
assert(None is None)
assert(None is JSObject(null))
assert(None == JSObject(null))
assert(JSObject(null) is JSObject(null))

print("All tests passed")
