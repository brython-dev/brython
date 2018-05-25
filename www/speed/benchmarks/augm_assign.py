a = 0
for i in range(1000000):
    a += 1

JS_CODE = '''
var a;
for (var i = 0; i < 1000000; i++) {
  a += 1;
}
'''
