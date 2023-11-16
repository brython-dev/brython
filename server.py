# -*- coding: utf-8 -*-
#

"""Simple HTTP Server for Brython Development.
Files are served from subdirectory www, except cgi scripts that are
served from subdirectory cgi-bin
"""


import io
import os
import sys
import sysconfig
import time
from webbrowser import open_new_tab
import argparse
import urllib.parse
import socketserver

from server_modular_send_head import CGIHTTPRequestHandler

import http.cookiejar

cpython_site_packages = sysconfig.get_path("purelib")

# Python might be built without zlib
try:
    import zlib
except ImportError:
    zlib = None

# Generators for HTTP compression

def _zlib_producer(fileobj, wbits):
    """Generator that yields data read from the file object fileobj,
    compressed with the zlib library.
    wbits is the same argument as for zlib.compressobj.
    """
    bufsize = 2 << 17
    producer = zlib.compressobj(wbits=wbits)
    with fileobj:
        while True:
            buf = fileobj.read(bufsize)
            if not buf: # end of file
                yield producer.flush()
                return
            yield producer.compress(buf)

def _gzip_producer(fileobj):
    """Generator for gzip compression."""
    return _zlib_producer(fileobj, 31)

def _deflate_producer(fileobj):
    """Generator for deflate compression."""
    return _zlib_producer(fileobj, 15)

class CompressedHandler(CGIHTTPRequestHandler):

    # List of commonly compressed content types, copied from
    # https://github.com/h5bp/server-configs-apache.
    compressed_types = [
        "application/atom+xml",
        "application/javascript",
        "application/json",
        "application/ld+json",
        "application/manifest+json",
        "application/rdf+xml",
        "application/rss+xml",
        "application/schema+json",
        "application/vnd.geo+json",
        "application/vnd.ms-fontobject",
        "application/x-font-ttf",
        "application/x-javascript",
        "application/x-web-app-manifest+json",
        "application/xhtml+xml",
        "application/xml",
        "font/eot",
        "font/opentype",
        "image/bmp",
        "image/svg+xml",
        "image/vnd.microsoft.icon",
        "image/x-icon",
        "text/cache-manifest",
        "text/css",
        "text/html",
        "text/javascript",
        "text/plain",
        "text/vcard",
        "text/vnd.rim.location.xloc",
        "text/vtt",
        "text/x-component",
        "text/x-cross-domain-policy",
        "text/xml"
    ]

    # Dictionary mapping an encoding (in an Accept-Encoding header) to a
    # generator of compressed data. By default, provided zlib is available,
    # the supported encodings are gzip and deflate.
    # Override if a subclass wants to use other compression algorithms.
    compressions = {}
    if zlib:
        compressions = {
            'deflate': _deflate_producer,
            'gzip': _gzip_producer,
            'x-gzip': _gzip_producer # alias for gzip
        }

    def guess_type(self, path):
        ctype = CGIHTTPRequestHandler.guess_type(self, path)
        # I had the case where the mimetype associated with .js in the Windows
        # registery was text/plain...
        ext = os.path.splitext(path)[1]
        if ext == ".js":
            ctype = "application/javascript"
        elif ext == '.wasm':
            ctype = "application/wasm"
        return ctype

    def translate_path(self, path):
        """For paths starting with /cgi-bin/, serve from cgi_dir"""
        elts = path.split('/')
        if len(elts) > 1 and elts[0] == '':
            if elts[1] == 'cpython_site_packages':
                elts[-1] = elts[-1].split("?")[0]
                return os.path.join(cpython_site_packages, *elts[2:])
        return CGIHTTPRequestHandler.translate_path(self, path)

    def do_POST(self):
        if self.path == '/time_cpython':
            if self.client_address[0] != '127.0.0.1':
                return self.send_error(403, "Forbidden")
            data = self.rfile.read(int(self.headers.get('Content-Length')))
            path = data.decode('utf-8')
            path = os.path.join(os.getcwd(), "speed", path)

            t0 = time.perf_counter()
            with open(path, encoding="utf-8") as f:
                exec(f.read(), {})
            t1 = time.perf_counter()

            response = '%6.2f' % ((t1 - t0) * 1000.0)
            response_data = response.encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
        else:
            super(CompressedHandler, self).do_POST()

    def handle_compression(self, f):

        if self.ctype not in self.compressed_types:
            return f

        # Get accepted encodings ; "encodings" is a dictionary mapping
        # encodings to their quality ; eg for header "gzip; q=0.8",
        # encodings["gzip"] is set to 0.8
        accept_encoding = self.headers.get_all("Accept-Encoding", ())
        encodings = {}
        for accept in http.cookiejar.split_header_words(accept_encoding):
            params = iter(accept)
            encoding = next(params, ("", ""))[0]
            quality, value = next(params, ("", ""))
            if quality == "q" and value:
                try:
                    q = float(value)
                except ValueError:
                    # Invalid quality : ignore encoding
                    q = 0
            else:
                q = 1 # quality defaults to 1
            if q:
                encodings[encoding] = max(encodings.get(encoding, 0), q)

        compressions = set(encodings).intersection(self.compressions)
        compression = None
        if compressions:
            # Take the encoding with highest quality
            compression = max((encodings[enc], enc)
                for enc in compressions)[1]
        elif '*' in encodings and self.compressions:
            # If no specified encoding is supported but "*" is accepted,
            # take one of the available compressions.
            compression = list(self.compressions)[0]
        if compression:
            # If at least one encoding is accepted, send data compressed
            # with the selected compression algorithm.
            producer = self.compressions[compression]
            self.send_header("Content-Encoding", compression)
            if self.content_length < 2 << 18:
                # For small files, load content in memory
                with f:
                    content = b''.join(producer(f))
                self.content_length = len(content)
                return io.BytesIO(content)
            else:
                self.content_length = None
                chunked = self.protocol_version >= "HTTP/1.1"
                if chunked:
                    # Use Chunked Transfer Encoding (RFC 7230 section 4.1)
                    self.send_header("Transfer-Encoding", "chunked")
                else:
                    # Set Expires header for cache
                    self.send_header("Expires",
                        self.date_time_string(time.time() + 3600))
                    self.send_header("Max-age", 3600)
                # Return a generator of pieces of compressed data
                return producer(f)

    def end_headers(self):
        """Add headers that make SharedArrayBuffer available in Web Workers.
        """
        self.send_header('cross-origin-embedder-policy', 'require-corp')
        self.send_header('cross-origin-opener-policy', 'same-origin')
        super().end_headers()

# port to be used when the server runs locally
parser = argparse.ArgumentParser()
parser.add_argument('--port', help="The port to be used by the local server")
parser.add_argument('--ip', help="The IP address to be used by the local server")

# generate docs?
# when testing new code on your repo it is not necessary to generate docs all
# the time so this option allows you to avoid this process
parser.add_argument(
    '--no-docs',
    help="Do not generate static docs.",
    action="store_true")

args = parser.parse_args()

port = int(args.port) if args.port else 8000
ip   = str(args.ip) if args.port else "127.0.0.1"

if not args.no_docs:
    # generate static doc pages if not already present
    if not os.path.exists(os.path.join(os.getcwd(),'www','static_doc')):
        save_dir = os.getcwd()
        os.chdir(os.path.join(os.getcwd(),'scripts'))
        sys.path.append(os.getcwd())
        import make_doc
        sys.path.pop()
        os.chdir(save_dir)

os.chdir(os.path.join(os.getcwd(), 'www'))

cgi_dir = os.path.join(os.path.dirname(os.getcwd()), 'cgi-bin')

server_address, handler = (ip, port), CompressedHandler
httpd = socketserver.ThreadingTCPServer(server_address, handler)
httpd.server_name = "Brython built-in server"
httpd.server_port = port
print(__doc__)
print(("Server running on port http://localhost:{}.".format(server_address[1])))
print("Press CTRL+C to Quit.")
open_new_tab("http://localhost:{}/".format(server_address[1]))
httpd.serve_forever()

