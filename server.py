# -*- coding: utf-8 -*-
#


"""Simple HTTP Server for Brython Development."""


import os
import sys
from webbrowser import open_new_tab

# generate static doc pages if not already present
if not os.path.exists(os.path.join(os.getcwd(),'site','static_doc')):
    save_dir = os.getcwd()
    os.chdir(os.path.join(os.getcwd(),'scripts'))
    make_doc = open('make_doc.py').read()
    exec(make_doc)
    os.chdir(save_dir)
    
try:
    import http.server as server
    from http.server import CGIHTTPRequestHandler
except:
    import BaseHTTPServer as server
    from CGIHTTPServer import CGIHTTPRequestHandler

server_address, handler = ('', 8000), CGIHTTPRequestHandler
httpd = server.HTTPServer(server_address, handler)
print(__doc__)
print(("Server running on port http://localhost:{}.".format(server_address[1])))
print("Press CTRL+C to Quit.")
open_new_tab("http://localhost:{}/site/".format(server_address[1]))
httpd.serve_forever()
