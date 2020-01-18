import sys
from code import interact

# issue 853
class Output:
  def __init__(self):
    self.buf = ""
  def write(self, data):
    self.buf += str(data)
  def flush(self):
    pass

save_stderr = sys.stderr
save_stdout = sys.stdout

class Reader:

  def __init__(self, source):
    self.lines = source.split("\n")
    self.num = -1
    self.output = Output()
    sys.stdout = sys.stderr = self.output

  def __call__(self, prompt):
    if self.num == len(self.lines) - 1:
      sys.stderr = save_stderr
      sys.stdout = save_stdout
      raise EOFError
    self.num += 1
    return self.lines[self.num]

tests = [
  {"source": """
def hi(name):
    print('hi', name)

hi('Bob')
""",
  "expected": ['hi Bob']
  },
  {"source": """
try:
    print('try')
finally:
    print('finally')

print('done')
""",
  "expected": ["try\n", "finally\n", "done"]
  }
]

for test in tests:
  reader = Reader(test["source"])
  interact(readfunc=reader)
  for expected in test["expected"]:
    assert expected in reader.output.buf

print("done")