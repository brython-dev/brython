def f(x):
    return x
for i in range(1000000):
    f(i)

JS_CODE = '''
var f = function(x) {
	return x;
}
for (var i = 0; i < 1000000; i++) {
	f(i)
}
'''
