for i in range(100000):
    str(i)

JS_CODE = '''
for (var i = 0; i < 100000; i++) {
    new String(i);
}
'''
