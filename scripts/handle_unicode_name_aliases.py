"""Create dictionary "aliases", a mapping between a code point and a list of
name aliases, relatively to the names defined for this code in
UnicodeData.txt"""

import os

aliases = {}

with open(os.path.join("ucd", "NameAliases.txt"), encoding="utf-8") as f:
    for line in f:
        if line.startswith("#") or not line.strip():
            continue
        code, alias, category = line.strip().split(';')
        aliases.setdefault(code, []).append(alias)
