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

print('all tests ok..')