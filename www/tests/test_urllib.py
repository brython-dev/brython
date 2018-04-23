import urllib.parse

assert urllib.parse.unquote("foo%20bar") == "foo bar"

print('passed all tests')