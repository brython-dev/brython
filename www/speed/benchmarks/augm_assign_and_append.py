t = []
i = 0
while i < 100000:
    t.append(i)
    i += 1

JS_CODE = '''
var list = [];
for (var i = 0; i <= 100000; i++) {
    list.push(i);
}
'''
