a = {0:0}

for i in range(1000000):
    a[0] = i

assert a[0]==999999


JS_CODE = '''
var a = {0: 0}

for (var i = 0; i < 1000000; i++) {
	a[0] = i
}
'''
