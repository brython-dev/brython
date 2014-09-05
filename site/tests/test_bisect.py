from bisect import bisect,bisect_left

def grade(score, breakpoints=[60, 70, 80, 90], grades='FDCBA'):
    i = bisect(breakpoints, score)
    return grades[i]

assert [grade(score) for score in [33, 99, 77, 70, 89, 90, 100]] == \
    ['F', 'A', 'C', 'C', 'B', 'A', 'A']


data = [('red', 5), ('blue', 1), ('yellow', 8), ('black', 0)]
data.sort(key=lambda r: r[1])

keys = [r[1] for r in data]
assert data[bisect_left(keys, 0)] == ('black',0)
assert data[bisect_left(keys, 1)] == ('blue',1)
assert data[bisect_left(keys, 5)] == ('red',5)
assert data[bisect_left(keys, 8)] == ('yellow',8)

print("passed all tests...")