# -*- coding: utf-8 -*-
#

"""Simple HTTP Server for Brython Development.
"""


import os
import sys
from webbrowser import open_new_tab
import argparse

# port to be used when the server runs locally
parser = argparse.ArgumentParser()
parser.add_argument('--port', help="The port to be used by the local server")

args = parser.parse_args()

if args.port:
    port = int(args.port)
else:
    port = 8000

try:
    import http.server as server
    from http.server import CGIHTTPRequestHandler
except:
    import BaseHTTPServer as server
    from CGIHTTPServer import CGIHTTPRequestHandler

server_address, handler = ('', port), CGIHTTPRequestHandler
httpd = server.HTTPServer(server_address, handler)
print(__doc__)
print(("Server running on port http://localhost:{}.".format(server_address[1])))
print("Press CTRL+C to Quit.")
httpd.serve_forever()

