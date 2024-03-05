"""Create a Javascript script to encode / decode for a specific encoding
described in a file available at
http://unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/<ENCODING>.TXT
"""

import os
import re
import json
import urllib.request

line_re = re.compile("^(0x[A-Z0-9]+)\s+(0x[A-Z0-9]+)*", re.M)

tmpl = "http://unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/{}.TXT"
encoding = "cp932"
req = urllib.request.urlopen(tmpl.format(encoding.upper()))
data = req.read().decode("ascii")

print(data)
with open(f'{encoding}.txt', 'w', encoding='ascii') as out:
    out.write(data)

cps = {}

root_dir = os.path.dirname(os.path.dirname(__file__))
libs_dir = os.path.join(root_dir, "www", "src", "libs")
filename = os.path.join(libs_dir, f"encoding_{encoding.lower()}.js")
with open(filename, "w", encoding="utf-8") as out:
    previous = None
    values = []
    for line in data.split("\n"):
        mo = line_re.match(line)
        if mo:
            key, value = mo.groups()
            value = int(value, 16) if value else None
            if previous is None:
                previous = int(key, 16)
                start = previous
                cps[start] = [value]
            elif int(key, 16) != previous + 1:
                previous = int(key, 16)
                start = previous
                cps[start] = [value]
            else:
                cps[start].append(value)
                previous += 1
    out.write('const cps = ' + json.dumps(cps))
    out.write("\nvar decoding_table = [],\n    encoding_table = []\n")
    out.write("""for(let cp in cps){
    cp = parseInt(cp)
    for(let i = 0, len = cps[cp].length; i < len; i++){
        let key = cp + i,
            value = cps[cp][i]
        decoding_table[key] = value
        encoding_table[value] = key
    }
}
var module = {encoding_table, decoding_table}
__BRYTHON__.addToImported("encoding_cp932", module)
""")
