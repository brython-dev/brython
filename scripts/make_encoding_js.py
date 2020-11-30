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
encoding = input("Encoding name: ")
req = urllib.request.urlopen(tmpl.format(encoding.upper()))
data = req.read().decode("ascii")

root_dir = os.path.dirname(os.path.dirname(__file__))
libs_dir = os.path.join(root_dir, "www", "src", "libs")
filename = os.path.join(libs_dir, f"encoding_{encoding.lower()}.js")
with open(filename, "w", encoding="utf-8") as out:
    out.write("var _table = [")
    for line in data.split("\n"):
        mo = line_re.match(line)
        if mo:
            key, value = mo.groups()
            out.write(f"{key}, {value or -1},")
    out.write("]\n")
    out.write("var decoding_table = [],\n    encoding_table = []\n")
    out.write("""for(var i = 0, len = _table.length; i < len; i += 2){
var value = _table[i + 1]
if(value !== null){
    encoding_table[value] = _table[i]
}
decoding_table[_table[i]] = _table[i + 1]
}
$module = {encoding_table, decoding_table}
""")
