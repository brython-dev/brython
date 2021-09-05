from browser import document, html, window

with open('index.html') as f:
    f.read()

with open('files/text-utf8.txt') as f:
    f.read()

with open('compression/du cote de chez swann.txt', 'rb') as f:
    assert len(f.read()) in [1_054_176, 1_056_294]

with open("compression/du cote de chez swann.txt", "rb") as f:
    assert len(f.readlines()) == 2118, "readlines (binary mode) failed on file"

with open('compression/du cote de chez swann.txt', 'r') as f:
    assert len(f.readlines()) == 2118

with open('compression/du cote de chez swann.txt', 'r') as f:
    counter = 0
    for line in f:
        counter += 1
    assert counter in [2117, 2118] # last LF might be removed

try:
    with open('files/text-latin1.txt') as f:
        f.read()
    raise Exception('should have raised UnicodeDecodeError')
except UnicodeDecodeError:
    pass

with open('files/text-latin1.txt', encoding='latin1') as f:
    assert f.read() == "bébé"

with open('files/text-latin9.txt', encoding='iso-8859-15') as f:
    assert f.read() == "sœur"

# image file
with open('../brython.png', 'rb') as f:
    content = f.read()
    assert isinstance(content, bytes)
    assert len(content) == 2011

print("passed all tests...")