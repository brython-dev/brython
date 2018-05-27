for _i in range(100000):
    str(_i)

JS_CODE = '''
for (var i = 0; i < 100000; i++) {
	new String(i);
}
'''
