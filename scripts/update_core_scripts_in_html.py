import os
import re

import directories
from core_scripts import core_scripts

core_html = [f'<script src="/src/{x}.js"></script>\n' for x in core_scripts]

charset_pattern = re.compile(b'<meta charset="(?P<name>.*)">', flags=re.M)

alts = '|'.join(core_scripts)
script_re = re.compile(rf'\s*<script\s+(type="text/javascript"\s+)?src="/src/({alts})\.js">\s*</script>')
other_re = re.compile(rf'\s*<script src=".*\.js"></script>\n')

start_tag = '<!-- brython start -->'
end_tag = '<!-- brython end -->'
def find_pages(folders):
    ok = []
    wrong_order = []
    for folder in folders:
        for dirpath, dirnames, filenames in os.walk(folder):
            for filename in filenames:
                if filename.endswith('.html'):
                    charset = 'utf-8'
                    path = os.path.join(dirpath, filename)
                    with open(path, 'rb') as f:
                        content = f.read()
                        if mo := charset_pattern.search(content):
                            charset = mo['name'].decode('iso-8859-1')
                            if charset.lower() != 'utf-8':
                                print(filename, charset)
                    with open(path, encoding=charset) as f:
                        lines = f.readlines()
                        start_line = None
                        end_line = None
                        candidate = False
                        candidate_start = candidate_end = None
                        other_scripts = []
                        for i, line in enumerate(lines):
                            if line.strip() == start_tag:
                                start_line = i
                                indent = len(line) - len(line.lstrip())
                            elif line.strip() == end_tag and start_line is not None:
                                end_line = i
                                break
                            elif script_re.match(line):
                                candidate = True
                                if candidate_start is None:
                                    candidate_start = i
                                    indent = len(line) - len(line.lstrip())
                                candidate_end = i
                            elif candidate and other_re.match(line):
                                other_scripts.append(i)
                        if start_line is None and candidate is False:
                            continue

                        html = [' ' * indent + x for x in core_html]
                        if start_line is not None and end_line is not None:
                            print(path, f'scripts between line {start_line + 1} and {end_line + 1}')
                            new_lines = lines[:start_line + 1] + html + lines[end_line:]
                        else:
                            print('candidate', path)
                            keep = []
                            if other_scripts:
                                # keep those between start and end
                                keep = [lines[i] for i in other_scripts if
                                    candidate_start < i < candidate_end]
                                print('keep other scripts', keep)
                            new_lines = lines[:candidate_start]
                            new_lines += [' ' * indent + '<!-- brython start -->\n']
                            new_lines += [' ' * indent + x for x in core_html]
                            new_lines += [' ' * indent + '<!-- brython end -->\n']
                            new_lines += keep
                            new_lines += lines[candidate_end + 1:]
                            input()
                        with open(path, 'w', encoding=charset) as out:
                            out.writelines(''.join(new_lines))


find_pages(
    [os.path.join(directories.root_dir, 'www', 'tests'),
     os.path.join(directories.root_dir, 'www', 'gallery')])
