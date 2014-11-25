# -*- coding: utf-8 -*-
#


"""Simple HTTP Server for Brython Development."""


import logging as log
import sys
from ctypes import byref, cdll, create_string_buffer
from os import nice
from webbrowser import open_new_tab

try:
    import http.server as server
    from http.server import CGIHTTPRequestHandler
except:
    import BaseHTTPServer as server
    from CGIHTTPServer import CGIHTTPRequestHandler


log.basicConfig(level=-1)  # logs
try:
    nice(19)  # smooth cpu priority
    libc = cdll.LoadLibrary("libc.so.6")  # set process name
    buff = create_string_buffer(len("brython-dev-server") + 1)
    buff.value = bytes("brython-dev-server".encode("utf-8"))
    libc.prctl(15, byref(buff), 0, 0, 0)
except Exception as reason:
    log.warning(reason, exc_info=True)


log.info(__doc__)
server_address, handler = ('', 8000), CGIHTTPRequestHandler
log.info(("Server running on http://localhost:{}.".format(server_address[1])))
log.info("Press CTRL+C to Quit.")
open_new_tab("http://localhost:{}/site/".format(server_address[1]))
try:
    httpd = server.HTTPServer(server_address, handler)
    httpd.serve_forever()
except Exception as reason:
    log.error(reason, exc_info=True)
