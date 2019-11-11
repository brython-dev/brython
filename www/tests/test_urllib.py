import urllib.parse

assert urllib.parse.unquote("foo%20bar") == "foo bar"

import urllib.request

with urllib.request.urlopen('https://httpbin.org/headers') as f:
    f.read()

print('passed all tests')