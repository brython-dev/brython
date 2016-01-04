import hashlib

m = hashlib.md5()

m.update(b"hashlib test")
assert m.hexdigest() == "c8fead1ad6206097c6073cdf20f49f93"

m.update(b"another test")
assert m.hexdigest() == "175a023e6f75d81e2ecdcdc75d96e6fe"

assert hashlib.md5(b"hashlib test").hexdigest() == "c8fead1ad6206097c6073cdf20f49f93"

s = hashlib.sha1()

s.update(b"hashlib test")
assert s.hexdigest() == "971734764c3b925866f5808118e3551ecaddd141"
s.update(b"another test")
assert s.hexdigest() == "495de82a4dc645e0261a2fc13578b022e8b656c3"

assert hashlib.sha1(b"hashlib test").hexdigest() == "971734764c3b925866f5808118e3551ecaddd141"

s = hashlib.sha224()

s.update(b"hashlib test")
assert s.hexdigest() == "00ce77e227b3adc10010f8c72719c757eaaa00b860e58eb0e214941b"

s.update(b"another test")
assert s.hexdigest() == "73017dacc069943877bbad34212c324c88fff7e78bfb39e813bcdcc6"

assert hashlib.sha224(b"hashlib test").hexdigest() == "00ce77e227b3adc10010f8c72719c757eaaa00b860e58eb0e214941b"

s = hashlib.sha256()

s.update(b"hashlib test")
assert s.hexdigest() == "31ae86e4c84f0b65f48c16494ae22443d0d0e3880ffd30ff743e5a2f30e75806"

s.update(b"another test")
assert s.hexdigest() == "2e73337520cfbf212c04fff08b688427158a3d5207475231933ace7642bdada8"

assert hashlib.sha256(b"hashlib test").hexdigest() == "31ae86e4c84f0b65f48c16494ae22443d0d0e3880ffd30ff743e5a2f30e75806"

s = hashlib.sha384()

s.update(b"hashlib test")
assert s.hexdigest() == "3e9467feebd795db667ae804bb7b1bfc0725f2b96bbb7648fbbc515bcc0963b1c22bc762abb43fddfc6f876d52c6c597"

s.update(b"another test")
assert s.hexdigest() == "964e1b4e3702da95abee44fe2661f442265555500cadd9d415191b3f39a90e8d39f323433c8e8642de666821fb3e20bb"

assert hashlib.sha384(b"hashlib test").hexdigest() == \
    "3e9467feebd795db667ae804bb7b1bfc0725f2b96bbb7648fbbc515bcc0963b1c22bc762abb43fddfc6f876d52c6c597"

s = hashlib.sha512()

s.update(b"hashlib test")
assert s.hexdigest() == "6f2c547d3681c2369a05916a5fcce16c0aed6fd7356362d9e188d64efd29c3cbc6837b61ffb7bac43b1c4161005e570762fb740af99671d366b39babde3daef5"

s.update(b"another test")
assert s.hexdigest() == "9f14aecd5a945a6f81a1f8a11633aa428e2a404e39fea50c385a46d2637ee339c2c130101070245ae3164a4ca4e55bfe2089ebdc76885744a585eb232fede803"

assert hashlib.sha512(b"hashlib test").hexdigest() == \
    "6f2c547d3681c2369a05916a5fcce16c0aed6fd7356362d9e188d64efd29c3cbc6837b61ffb7bac43b1c4161005e570762fb740af99671d366b39babde3daef5"

print("passed all tests..")

