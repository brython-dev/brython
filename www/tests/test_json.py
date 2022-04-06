import json

assert json.loads(json.dumps(1)) == 1
assert json.loads(json.dumps(1.2)) == 1.2
assert json.loads(json.dumps('a')) == 'a'
assert json.loads(json.dumps([1, 2])) == [1, 2]

# json transforms dictionary keys into strings
assert json.loads(json.dumps({1: 2})) == {'1': 2}

xx = '{"status": 0, "result": ["memit/logo00.png", "memit/logo01.png"]}'
abyss = json.loads(xx)
assert abyss["result"][0] == 'memit/logo00.png'
assert abyss["status"] == 0

assert json.dumps(None) == "null"

# issue 148
jsondata = {'home': {'record001': ['date1', 'task1', 'relevance1'],
  'record002': ['date2', 'task2', 'relevance2'],
  'record003': ['date3', 'task3', 'relevance3']}}

assert jsondata == json.loads(json.dumps(jsondata))

# issue 201
d = json.loads("""{"a":1,"b":2.1}""")
assert d == {'a': 1, 'b': 2.1}
assert type(d['a']) == int
assert type(d['b']) == float

# nested dicts
s = json.dumps({"x": {"y": 1}})
assert json.loads(s) == {"x": {"y": 1}}

assert json.loads("null") == None

# issue 1824
s = '{"status":200,"message":"ok","data":{"login":true,"user_name":"tasuren#5161","id":634763612535390209,"language":"ja","icon":"https://cdn.discordapp.com/avatars/634763612535390209\/b7ac245fe341cc87873c23e911af8cbd.png?size=1024"}}'

d = json.loads(s)
assert d['data']['id'] == 634763612535390209


d = {'command': 'settest setting_test_channel', 'kwargs': {}, 'guild_id': 771732762503544801, 'channel_id': '773488498518786077', 'user_id': 634763612535390200, 'category': 'guild'}

assert json.dumps(d) == '{"command": "settest setting_test_channel", "kwargs": {}, "guild_id": 771732762503544801, "channel_id": "773488498518786077", "user_id": 634763612535390200, "category": "guild"}'

# issue 1858
assert json.loads("[0, null]") == [0, None]

# issue 1902
s = json.loads('"\\u0160"')
assert s == "Š"

# issue 1903
assert json.dumps('\na🤭bŠé"') == r'"\na\ud83e\udd2db\u0160\u00e9\""'

# issue 1930
assert json.loads('["one\\ntwo"]')[0][3] == '\n'
assert json.loads('"one\\ntwo\\nthree"') == 'one\ntwo\nthree'
assert json.loads('"one\\ttwo\\tthree"') == 'one\ttwo\tthree'
assert json.loads('"one\\rtwo\\rthree"') == 'one\rtwo\rthree'
assert json.loads('"one\\btwo\\bthree"') == 'one\btwo\bthree'
assert json.loads('"one\\ftwo\\fthree"') == 'one\ftwo\fthree'
assert json.loads('"one \'two\' three"') == "one 'two' three"
assert json.loads('"one \\"two\\" three"') == 'one "two" three'
assert json.loads('"one\\\\\\ntwo\\nthree"') == 'one\\\ntwo\nthree'

# issue 1936
class ComplexEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, complex):
            return [obj.real, obj.imag]
        # Let the base class default method raise the TypeError
        return json.JSONEncoder.default(self, obj)

assert json.dumps(2 + 1j, cls=ComplexEncoder) == '[2.0, 1.0]'
assert ComplexEncoder().encode(2 + 1j) == '[2.0, 1.0]'
assert list(ComplexEncoder().iterencode(2 + 1j)) == ['[2.0', ', 1.0', ']']

# issue 1944
assert json.loads('{"a":[]}') == {'a': []}

print('all tests ok..')