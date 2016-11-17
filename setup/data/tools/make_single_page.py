"""Make a single HTML page for an application
"""

import os
import html.parser

class Parser(html.parser.HTMLParser):
    
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            print(tag, attrs)

src = open(os.path.join(os.path.dirname(__file__), 'index.html'),
    encoding="utf-8").read()

parser = Parser()
parser.feed(src)
