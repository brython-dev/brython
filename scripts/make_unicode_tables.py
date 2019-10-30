import os
import urllib.request

unicode_url = "https://www.unicode.org/Public/5.2.0/ucd/"

# Load required files from unicode.org
if not os.path.exists("ucd"):
    os.mkdir("ucd")

for path in ["UnicodeData.txt", "CaseFolding.txt", "DerivedCoreProperties.txt"]:
    abs_path = os.path.join("ucd", path)
    if not os.path.exists(abs_path):
        f = urllib.request.urlopen(unicode_url + path)
        print(f)
        with open(abs_path, "wb") as out:
            buf = f.read()
            if not buf:
                break
            out.write(buf)

dest_dir = os.path.join(os.path.dirname(os.getcwd()), "www", "src")

# Generate lists of character by General Category under a compact format.
# For each General Category (eg "Ll" for Letter lowercase), a list of items is
# generated. Each item in the list is:
# - an integer : the value of a Unicode code point which has this GC
# - a list with 3 elements : [start, number, step] such that all Unicode code
#   points of the form start + i * step for i in range(number) has this GC
# - a list with 2 elements [start, number] when step is 1
letters = {}
start = None
gc = None

bidi_ws = [] # characters with bidirectional class in "WS", "B", "S"
count = {}

def to_int(codepoint):
    return int("0x" + codepoint, 16)

with open(os.path.join("ucd", "UnicodeData.txt")) as f:
    for line in f:
        parts = line.split(";")
        gc = parts[2]
        count[gc] = count.get(gc, 0) + 1
        char = to_int(parts[0])
        bidi_class = parts[4]
        if bidi_class in ["WS", "B", "S"]:
            bidi_ws.append(char)
        if gc in letters:
            sequence = letters[gc]
            if isinstance(sequence[-1], list):
                start, nb, step = sequence[-1]
                if char - (start + nb * step) == 0:
                    sequence[-1][1] += 1
                else:
                    sequence.append(char)
            elif len(sequence) < 2:
                sequence.append(char)
            else:
                if isinstance(sequence[-2], int):
                    step = char - sequence[-1]
                    if sequence[-1] - sequence[-2] == step:
                        sequence[-2:] = [[sequence[-2], 3, step]]
                    else:
                        sequence.append(char)
                else:
                    sequence.append(char)
        else:
            letters[gc] = [char]

casefold = {}
with open(os.path.join("ucd", "CaseFolding.txt")) as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split(";")]
        status = parts[1]
        if status == "F" or status == "S":
            casefold[to_int(parts[0])] = [to_int(x) for x in
                parts[2].split()]

# XID_Start and XID_Continue
xid = {"XID_Start": [str(hex(ord("_")))[2:]], "XID_Continue": []}

with open(os.path.join("ucd", "DerivedCoreProperties.txt")) as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split(";")]
        prop = parts[1].split("#")[0].strip()
        if prop in xid:
            xid[prop].append(parts[0])

identifiers = {}
for key in xid:
    start = []
    for cp in xid[key]:
        if '..' in cp:
            first, last = [int("0x" + part, 16) for part in cp.split("..")]
            if start and isinstance(start[-1], list) and \
                    start[-1][0] + start[-1][1] == first:
                start[-1][1] += last - first + 1
            else:
                start.append([first, last - first + 1])
        else:
            value = int("0x" + cp, 16)
            if start and isinstance(start[-1], list) \
                    and start[-1][0] + start[-1][1] == value:
                start[-1][1] += 1
            else:
                start.append(value)
    identifiers[key] = start

tables = {}

def add(char, key):
    if not key in tables:
        tables[key] = []
    sequence = tables[key]
    if not sequence:
        sequence.append(char)
    elif isinstance(sequence[-1], list):
        start, nb, step = sequence[-1]
        if char - (start + nb * step) == 0:
            sequence[-1][1] += 1
        else:
            sequence.append(char)
    elif len(sequence) < 2:
        sequence.append(char)
    else:
        if isinstance(sequence[-2], int):
            step = char - sequence[-1]
            if sequence[-1] - sequence[-2] == step:
                sequence[-2:] = [[sequence[-2], 3, step]]
            else:
                sequence.append(char)
        else:
            sequence.append(char)

# Use str methods for digits, numeric
for i in range(918000):
    if chr(i).isdigit():
        add(i, "digits")
    if chr(i).isnumeric():
        add(i, "numeric")

letters.update(tables)

import json
data = {}
for letter in letters:
    data[letter] = []
    for item in letters[letter]:
        if isinstance(item, list) and item[2] == 1:
            data[letter].append(item[:2])
        else:
            data[letter].append(item)

print(sorted(list(letters)))


with open(os.path.join(dest_dir, "unicode_data.js"), "w",
        encoding="utf-8") as out:
    out.write("var $B = __BRYTHON__\n")
    out.write("$B.unicode = ")
    json.dump(data, out, separators=[",", ":"])
    out.write("\n$B.unicode_casefold = " +
        str(casefold).replace(" ", ""))
    out.write("\n$B.unicode_bidi_whitespace = " +
        str(bidi_ws).replace(" ", ""))
    out.write("\n$B.unicode_identifiers = ")
    json.dump(identifiers, out, separators=[",", ":"])
    out.write("""\n$B.unicode_tables = {}
for(var gc in $B.unicode){
    $B.unicode_tables[gc] = {}
    $B.unicode[gc].forEach(function(item){
        if(Array.isArray(item)){
            var step = item[2] || 1
            for(var i = 0, nb = item[1]; i < nb; i += 1){
                $B.unicode_tables[gc][item[0] + i * step] = true
            }
        }else{
            $B.unicode_tables[gc][item] = true
        }
    })
}

for(var key in $B.unicode_identifiers){
    $B.unicode_tables[key] = {}
    for(const item of $B.unicode_identifiers[key]){
        if(Array.isArray(item)){
            for(var i = 0; i < item[1]; i++){
                $B.unicode_tables[key][item[0] + i] = true
            }
        }else{
            $B.unicode_tables[key][item] = true
        }
    }
}
""")