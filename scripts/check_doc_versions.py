import os

from directories import root_dir
import version

current = '.'.join(map(str, version.implementation[:2]))

header_file = os.path.join(root_dir, 'www', 'assets', 'header.py')
with open(header_file, encoding='utf-8') as f:
    for line in f:
        if line.startswith('doc_versions'):
            if current not in line:
                raise Exception('Error in file /assets/header.py: ' +
                    f'current version {current} not in doc_versions.\n' +
                    'Update the script and run `brython-cli make_package header`')