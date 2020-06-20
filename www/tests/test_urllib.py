import urllib.parse

assert urllib.parse.unquote("foo%20bar") == "foo bar"

import urllib.request

with urllib.request.urlopen('https://httpbin.org/headers') as f:
    f.read()

# issue 1424
text = """Hello
World"""

assert urllib.parse.urlencode({"text": text}) == "text=Hello%0AWorld"

print('passed all tests')