# Generate /src/unicode.txt from
# https://www.unicode.org/Public/11.0.0/ucd/UnicodeData.txt

import os
import random
import json

root_dir = os.path.dirname(os.getcwd())

dest_dir = os.path.join(root_dir, "www", "src")
dest_path = os.path.join(dest_dir, "unicode.txt")

names = {}
categories = {}
combinings = {}
bidirs = {}
decomps = {}
decimals = {}
digits = {}
numerics = {}

with open(dest_path, "w", encoding="ascii") as out:
    with open(os.path.join("ucd", "UnicodeData.txt"), encoding="ascii") as f:
        for line in f:
            items = line.strip().split(";")
            cp, lit, category = items[0], items[1], items[2]
            if not lit:
                continue
            combining, bidir, decomp = items[3], items[4], items[5]
            decimal, digit, numeric = items[6], items[7], items[8]
            for value, table in [
                    [bidir, bidirs],
                    [decomp, decomps],
                    [category, categories],
                    [combining, combinings],
                    [decimal, decimals],
                    [digit, digits],
                    [numeric, numerics]
                    ]:
                if value not in table and len(table) < 100:
                    table[value] = cp

            if random.random() < 0.05:
                if lit not in names:
                    names[lit] = cp

            out.write("{};{};{};{};{};{};{};{};{}\n".format(
                cp, lit, category, combining, bidir, decomp,
                decimal, digit, numeric))

test_dir = os.path.join(root_dir, "www", "tests")

tests = {
    "bidirs": bidirs,
    "categories": categories,
    "combinings": combinings,
    "decimals": decimals,
    "decompositions": decomps,
    "digits": digits,
    "names": names,
    "numerics": numerics}

test_code = """

for bidir, cp in tests["bidirs"].items():
    assert bidir == unicodedata.bidirectional(chr(int(cp, 16)))

print("bidirectional ok")

for category, cp in tests["categories"].items():
    assert category == unicodedata.category(chr(int(cp, 16)))

print("categories ok")

for comb, cp in tests["combinings"].items():
    assert int(comb) == unicodedata.combining(chr(int(cp, 16)))

print("combining ok")

for decimal, cp in tests["decimals"].items():
    if decimal:
        assert eval(decimal) == unicodedata.decimal(chr(int(cp, 16)))

print("decimals ok")

for decomp, cp in tests["decompositions"].items():
    assert decomp == unicodedata.decomposition(chr(int(cp, 16)))

print("decomposition ok")

for digit, cp in tests["digits"].items():
    if digit:
        assert eval(digit) == unicodedata.digit(chr(int(cp, 16)))

print("digits ok")

for name, cp in tests["names"].items():
    assert name == unicodedata.name(chr(int(cp, 16)))

print("names ok")

for numeric, cp in tests["numerics"].items():
    if numeric:
        assert eval(numeric) == unicodedata.numeric(chr(int(cp, 16)))

print("numeric ok")

assert unicodedata.normalize('NFC', chr(0x2162)) == "Ⅲ"
assert unicodedata.normalize('NFD', chr(0x2162)) == "Ⅲ"
assert unicodedata.normalize('NFKC', chr(0x2162)) == "III"
assert unicodedata.normalize('NFKD', chr(0x2162)) == "III"

print("normalize ok")
"""

with open(os.path.join(test_dir, "test_unicodedata.py"), "w",
        encoding="utf-8") as out:
    out.write("import unicodedata\n\ntests = ")
    json.dump(tests, out, indent=4)
    out.write(test_code)