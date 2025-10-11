import os
import re

from directories import root_dir
import version

brython_version = '.'.join(str(x) for x in version.version[:3])
pyproject = os.path.join(root_dir, 'setup', 'pyproject.toml')

with open(pyproject, encoding="utf-8") as f:
    content = f.read()

updated = re.sub(r'version\s*=\s*"(.*?)"', f'version = "{brython_version}"', content)

with open(pyproject, 'w', encoding="utf-8") as out:
    out.write(updated)