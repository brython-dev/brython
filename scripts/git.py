import os

gitindex = os.path.join(os.path.dirname(os.getcwd()), '.git', 'index')

try:
    with open(gitindex, 'rb') as f:
        index = f.read()
except IOError:
    index = None

def in_index(path):
    return index is None or path.encode("ascii", "ignore") in index
