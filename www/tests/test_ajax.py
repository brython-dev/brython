from browser import ajax, window, console
from tester import async_tester

def check_status(req):
    if req.status == 200:
        return True
    print(f'warning - status {req.status} for '
        f'request to {req.url}, no check')
    return False

def show(req, *expects):
    if not check_status(req):
        return
    text = req.text
    for expected in expects:
        async_tester.assertIn(expected, text, f'{expected} not in {text}')

# ajax.get to read text files
ajax.get("files/text-utf8.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'bébé'))

ajax.get("files/text-utf8.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'bébé'),
    blocking=True)

ajax.get("files/text_cyrillic.txt", encoding='utf-8',
    oncomplete=lambda req: show(req, 'Шея'))

ajax.get("files/text_cyrillic.txt", encoding='utf-8',
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

# no attribute "text" for JSON requests (cf. PR #2589)
ajax.get("https://jsonplaceholder.typicode.com/posts/1", mode="json",
    oncomplete=lambda req: async_tester.assertFalse(hasattr(req, 'text')))


def read_image(req):
    print('image', len(req.read()))

ajax.get('../brython.png', mode="binary", oncomplete=read_image)
ajax.get('../brython.png', mode="binary", oncomplete=read_image, blocking=True)


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

def assert_type(f, _type):
    if not check_status(req):
        return
    data = f.read()
    async_tester.assertTrue(isinstance(data, _type))

x = ajax.get("test.html", mode="binary",
    oncomplete=lambda req: assert_type(req, bytes))
assert x is None

ajax.get("test.html", mode="text",
    oncomplete=lambda req: assert_type(req, str))

# XXX todo : test xml, json, file upload, error 404...
def read_xml(req):
    print(req.text)
    print([node.text for node in req.xml.select('ARTIST')])

ajax.get("catalog.xml", mode="document",
    oncomplete=read_xml)

def read_json(req):
    async_tester.assertEqual(req.json, req.read())
    async_tester.assertTrue(isinstance(req.read(), dict))

ajax.get("files/glossary.json", mode="json",
    oncomplete=read_json)

# issue 2051
# use httpbin.org for testing

def check(num, req, expected):
    if not check_status(req):
        return
    data = req.json
    for key in expected:
        async_tester.assertEqual(data[key], expected[key],
            (key, data[key], expected[key]))

content = 'test file'
file = window.File.new([content], 'test_file.txt')

form_data = ajax.form_data()
form_data.append("upload", file)
req = ajax.Ajax()
req.open('POST', 'https://httpbin.org/anything')
expected1 = {'files': {'upload': content}}
req.bind('complete', lambda req: check(1, req, expected1))
req.send(form_data)

data = ajax.form_data()
name = 'coucou'
data.append('name', name)
expected2 = {
                'files': {'filetosave': content},
                'form': {'name': 'coucou'}
            }
ajax.file_upload('https://httpbin.org/anything',
                 file,
                 data=data,
                 oncomplete=lambda req: check(2, req, expected2))

expected3 = {
                'files': {'filetosave': content},
                'form': {'name': 'coucou3'}
            }
data = {'name': 'coucou3'}
ajax.file_upload('https://httpbin.org/anything',
                 file,
                 data=data,
                 oncomplete=lambda req: check(2, req, expected3))

# issue 2346
import json

form_data = {"ident": "a + b"}

def oncomplete(req):
    if not check_status(req):
        return
    data = json.loads(req.read())
    async_tester.assertEqual(data['form'], form_data)

protocol = window.location.href.split('://')[0]
url = f"{protocol}://httpbin.org/post"

ajax.post(url,
          data=form_data,
          oncomplete=oncomplete)

print('passed all tests...')