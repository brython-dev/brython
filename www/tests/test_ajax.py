from browser import ajax

def show(req, expect):
    text = req.text
    if expect not in text:
      print(req.responseURL, expect, 'not in', text)
      print(text.encode('latin-1'))

# ajax.get to read text files
ajax.get("files/text-utf8.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'bébé'))

ajax.get("files/text-utf8.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'bébé'),
    blocking=True)

ajax.get("../static_doc/en/cookbook/file.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'Шея'))

ajax.get("../static_doc/en/cookbook/file.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'Шея'),
    blocking=True)

# other encodings
ajax.get("files/text-latin1.txt", encoding='latin-1',
    oncomplete=lambda req: show(req, 'bébé'))

ajax.get("files/text-latin1.txt", encoding='latin-1',
    oncomplete=lambda req: show(req, 'bébé'),
    blocking=True)

ajax.get("files/text-latin9.txt", encoding='iso-8859-15',
    oncomplete=lambda req: show(req, 'sœur'))

# binary mode
ajax.get("files/text-latin1.txt", mode='binary',
    oncomplete=lambda req: show(req, 0xe9))

ajax.get("files/text-utf8.txt", mode='binary',
    oncomplete=lambda req: show(req, 0xc3))

ajax.get("files/text-latin1.txt", mode='binary',
    oncomplete=lambda req: show(req, 0xe9),
    blocking=True)

def read_image(req):
    print('image', len(req.read()))

ajax.get('../brython.png', mode="binary", oncomplete=read_image)
ajax.get('../brython.png', mode="binary", oncomplete=read_image, blocking=True)

# ajax.post
ajax.post("/cgi-bin/post_test.py",
    oncomplete=lambda req: show(req, "bar:38"),
    data={'bar': 38})

ajax.post("/cgi-bin/post_test.py",
    headers={'Content-Type': "application/x-www-form-urlencoded"},
    oncomplete=lambda req: show(req, "bar:38"),
    data={'bar': 38})

# DOM style
req = ajax.Ajax()
req.open("GET", "files/text-latin1.txt")
req.encoding = 'latin-1'
req.bind("complete", lambda req: show(req, "bébé"))
req.send()

req = ajax.Ajax()
req.open("GET", "files/text-latin1.txt", False)
req.encoding = 'latin-1'
req.bind("complete", lambda req: show(req, "bébé"))
req.send()

req = ajax.Ajax()
req.open("GET", "files/text-utf8.txt", False)
req.bind("complete", lambda req: show(req, "bébé"))
req.send()

req = ajax.Ajax()
req.open("GET", "files/text-utf8.txt")
req.bind("complete", lambda req: show(req, "bébé"))
req.send()

req = ajax.Ajax()
req.open("GET", "/cgi-bin/get_test.py?bar=35", False)
req.set_header('Content-Type', 'application/x-www-form-urlencoded')
req.bind("complete", lambda req: show(req, "bar 35"))
req.send()

req = ajax.Ajax()
req.open("POST", "/cgi-bin/post_test.py", False)
req.bind("complete", lambda req: show(req, "bar:36"))
req.send({'bar': 36})

req = ajax.Ajax()
req.open("POST", "/cgi-bin/post_test.py", False)
req.set_header('content-type','application/x-www-form-urlencoded')
req.bind("complete", lambda req: show(req, "bar:37"))
req.send({'bar': 37})

req = ajax.Ajax()
req.open("POST", "/cgi-bin/post_test.py", False)
req.setRequestHeader('content-type','application/x-www-form-urlencoded')
req.bind("complete", lambda req: show(req, "bar:38"))
req.send({'bar': 38})

def assert_type(f, _type):
    data = f.read()
    assert isinstance(data, _type)

x = ajax.get("test.html", mode="binary",
    oncomplete=lambda req: assert_type(req, bytes))
assert x is None

ajax.get("test.html", mode="text",
    oncomplete=lambda req: assert_type(req, str))

# XXX todo : test xml, json, file upload, error 404...
def read_xml(req):
    print([node.text for node in req.xml.select('ARTIST')])

ajax.get("catalog.xml", mode="document",
    oncomplete=read_xml)

def read_json(req):
    assert req.json == req.read()
    assert isinstance(req.read(), dict)

ajax.get("files/glossary.json", mode="json",
    oncomplete=read_json)

print('passed all tests...')