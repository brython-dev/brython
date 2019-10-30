d = {}
for i in range(100000):
    d[i] = i

JS_CODE = '''
var d = {};
for (var i = 0; i < 100000; i++) {
  d[i] = i;
}
'''
