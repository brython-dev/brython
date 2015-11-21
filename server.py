# -*- coding: utf-8 -*-
#

"""Simple HTTP Server for Brython Development.
Files are served from subdirectory www, except cgi scripts that are
served from subdirectory cgi-bin
"""


import os
import sys
from webbrowser import open_new_tab
import argparse

# port to be used when the server runs locally
parser = argparse.ArgumentParser()
parser.add_argument('--port', 
    help="The port to be used by the local server")
args = parser.parse_args()

if args.port:
    port = int(args.port)
else:
    port = 8000

# generate static doc pages if not already present
if not os.path.exists(os.path.join(os.getcwd(),'www','static_doc')):
    save_dir = os.getcwd()
    os.chdir(os.path.join(os.getcwd(),'scripts'))
    make_doc = open('make_doc.py', "rb").read()
    make_doc = make_doc.decode("utf-8")
    exec(make_doc)
    os.chdir(save_dir)

os.chdir(os.path.join(os.getcwd(), 'www'))

try:
    import http.server as server
    from http.server import CGIHTTPRequestHandler
except:
    import BaseHTTPServer as server
    from CGIHTTPServer import CGIHTTPRequestHandler

cgi_dir = os.path.join(os.path.dirname(os.getcwd()), 'cgi-bin')

class RequestHandler(CGIHTTPRequestHandler):

    def translate_path(self, path):
        """For paths starting with /cgi-bin/, serve from cgi_dir"""
        elts = path.split('/')
        if len(elts)>1 and elts[0]=='' and elts[1]=='cgi-bin':
            return os.path.join(cgi_dir,*elts[2:])
        return CGIHTTPRequestHandler.translate_path(self, path)

server_address, handler = ('', port), RequestHandler
httpd = server.HTTPServer(server_address, handler)
print(__doc__)
print(("Server running on port http://localhost:{}.".format(server_address[1])))
print("Press CTRL+C to Quit.")
open_new_tab("http://localhost:{}/".format(server_address[1]))
httpd.serve_forever()

