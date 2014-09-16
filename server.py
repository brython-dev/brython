import sys

if sys.version < '3':
   import BaseHTTPServer as server
   from CGIHTTPServer import CGIHTTPRequestHandler
else:
   import http.server as server
   from http.server import CGIHTTPRequestHandler

server_address = ('', 8000)
handler = CGIHTTPRequestHandler
httpd = server.HTTPServer(server_address, handler)
print("server running on port %s" % server_address[1])
httpd.serve_forever()
