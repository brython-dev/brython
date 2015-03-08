import json

assert json.loads(json.dumps(1))==1
assert json.loads(json.dumps(1.2))==1.2
assert json.loads(json.dumps('a'))=='a'
assert json.loads(json.dumps([1,2]))==[1,2]

# json transforms dictionary keys into strings
assert json.loads(json.dumps({1:2}))=={'1':2}

xx = '{"status": 0, "result": ["memit/logo00.png", "memit/logo01.png"]}'
abyss = json.loads(xx)
assert abyss["result"][0]=='memit/logo00.png'
assert abyss["status"]==0

# issue 148
jsondata = {'home': {'record001': ['date1', 'task1', 'relevance1'],
  'record002': ['date2', 'task2', 'relevance2'],
  'record003': ['date3', 'task3', 'relevance3']}}

assert jsondata == json.loads(json.dumps(jsondata))

print('all tests ok..')