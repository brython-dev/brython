class A:
    pass

for i in range(1000000):

    A()

JS_CODE = '''
class A {}

for (var i = 0; i < 1000000; i++) {
	new A()
}
'''
