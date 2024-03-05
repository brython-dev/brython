import os
import re

from make_dist import run, pdir, vname, vname1, vname2, abs_path
import version

brython_version = '.'.join(str(x) for x in version.version[:2])
pyproject = os.path.join(pdir, 'setup', 'pyproject.toml')

with open(pyproject, encoding="utf-8") as f:
    content = f.read()

updated = re.sub(r'version\s*=\s*"(.*?)"', f'version = "{vname}"', content)

with open(pyproject, 'w', encoding="utf-8") as out:
    out.write(updated)