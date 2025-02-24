import sys
from browser import window, document

impl = sys.implementation.version

version = f'{impl.major}.{impl.minor}'
href = window.location.href
lang = href.split('.')[-2].split('/')[-1][-2:]

doc_location = f'../static_doc/{version}/{lang}/browser.template.html'
document['template_doc'].href = doc_location