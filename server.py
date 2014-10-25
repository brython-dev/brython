# -*- coding: utf-8 -*-
#


"""Simple HTTP Server for Brython Development."""


import os
import sys
from webbrowser import open_new_tab

try:
    os.nice(19)
except Exception as error:
    print(error)
if sys.version < '3':
    import BaseHTTPServer as server
    from CGIHTTPServer import CGIHTTPRequestHandler
else:
    import http.server as server
    from http.server import CGIHTTPRequestHandler


server_address, handler = ('', 8000), CGIHTTPRequestHandler
httpd = server.HTTPServer(server_address, handler)
print(__doc__)
print(("Server running on port http://localhost:{}.".format(server_address[1])))
open_new_tab("http://localhost:{}/site/".format(server_address[1]))
httpd.serve_forever()
