X = None

def ten():
  global X
  X = 10

def fifteen():
  global X
  X = 15

assert X == None

ten()

assert X == 10

fifteen()

assert X == 15