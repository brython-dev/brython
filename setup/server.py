# -*- coding: utf-8 -*-
#

"""Simple HTTP Server.
Supports browser cache and HTTP compression."""

import os
import sys
import datetime
import io

import email
from http import HTTPStatus
import http.cookiejar
import http.server as server
from http.server import SimpleHTTPRequestHandler

# Python might be built without gzip / zlib
try:
    import gzip
    import zlib
except ImportError:
    gzip = None

# List of commonly compressed content types, copied from
# https://github.com/h5bp/server-configs-apache.
# compressed_types is set to this list when the server is started with
# command line option --gzip.
commonly_compressed_types = [ "application/atom+xml",
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

# Generators for HTTP compression

def _zlib_producer(fileobj, wbits):
    """Generator that yields pieces of compressed data read from the file
    object fileobj, using the zlib library.
    It yields non-empty bytes objects and ends by yielding b'', for compliance
    with the Chunked Transfer Encoding protocol.
    wbits is the same argument as for zlib.compressobj.
    """
    bufsize = 2 << 17
    producer = zlib.compressobj(wbits=wbits)
    with fileobj:
        while True:
            buf = fileobj.read(bufsize)
            if not buf: # end of file
                data = producer.flush()
                if data:
                    yield data
                yield b''
                return
            data = producer.compress(buf)
            if data:
                yield data

def _gzip_producer(fileobj):
    """Generator for gzip compression."""
    return _zlib_producer(fileobj, 25)

def _deflate_producer(fileobj):
    """Generator for deflage compression."""
    return _zlib_producer(fileobj, 15)

class RequestHandler(SimpleHTTPRequestHandler):

    # List of Content Types that are returned with HTTP compression (gzip).
    # Set to the empty list by default (no compression).
    compressed_types = commonly_compressed_types

    # Dictionary mapping an encoding (in an Accept-Encoding header) to a
    # generator of compressed data. By default, the only supported encoding is
    # gzip. Override if a subclass wants to use another compression algorithm.
    compressions = {
        'deflate': _deflate_producer,
        'gzip': _gzip_producer,
        'x-gzip': _gzip_producer
    }

    def _make_chunk(self, data):
        return f"{len(data):X}".encode("ascii") + b"\r\n" + data + b"\r\n"

    def send_head(self):
        """Common code for GET and HEAD commands.

        This sends the response code and MIME headers.

        Return value is either a file object (which has to be copied
        to the outputfile by the caller unless the command was HEAD,
        and must be closed by the caller under all circumstances), or
        None, in which case the caller has nothing further to do.

        """
        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
            parts = urllib.parse.urlsplit(self.path)
            if not parts.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                new_parts = (parts[0], parts[1], parts[2] + '/',
                             parts[3], parts[4])
                new_url = urllib.parse.urlunsplit(new_parts)
                self.send_header("Location", new_url)
                self.end_headers()
                return None
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None

        try:
            fs = os.fstat(f.fileno())
            content_length = fs[6]
            # Use browser cache if possible
            if ("If-Modified-Since" in self.headers
                    and "If-None-Match" not in self.headers):
                # compare If-Modified-Since and time of last file modification
                try:
                    ims = email.utils.parsedate_to_datetime(
                        self.headers["If-Modified-Since"])
                except (TypeError, IndexError, OverflowError, ValueError):
                    # ignore ill-formed values
                    pass
                else:
                    if ims.tzinfo is None:
                        # obsolete format with no timezone, cf.
                        # https://tools.ietf.org/html/rfc7231#section-7.1.1.1
                        ims = ims.replace(tzinfo=datetime.timezone.utc)
                    if ims.tzinfo is datetime.timezone.utc:
                        # compare to UTC datetime of last modification
                        last_modif = datetime.datetime.fromtimestamp(
                            fs.st_mtime, datetime.timezone.utc)
                        # remove microseconds, like in If-Modified-Since
                        last_modif = last_modif.replace(microsecond=0)

                        if last_modif <= ims:
                            self.send_response(HTTPStatus.NOT_MODIFIED)
                            self.end_headers()
                            f.close()
                            return None

            self.send_response(HTTPStatus.OK)
            self.send_header("Content-type", ctype)
            self.send_header("Last-Modified",
                self.date_time_string(fs.st_mtime))

            if not gzip or ctype not in self.compressed_types:
                self.send_header("Content-Length", str(content_length))
                self.end_headers()
                return f

            # Use HTTP compression (gzip) if possible

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
                    q = 1 # quality default to 1
                if q:
                    encodings[encoding] = max(encodings.get(encoding, 0), q)

            compressions = set(encodings).intersection(self.compressions)
            compression = None
            if compressions:
                # Take the encoding with highest quality
                compression = sorted((encodings[enc], enc)
                    for enc in compressions)[-1][1]
            elif '*' in encodings:
                # If no specified encoding is supported but "*" is accepted,
                # use gzip.
                compression = "gzip"
            if compression:
                # If at least one encoding is accepted, send data compressed
                # with the selected compression algorithm.
                producer = self.compressions[compression]
                self.send_header("Content-Encoding", compression)
                if content_length < 2 << 18:
                    # For small files, load content in memory
                    with f:
                        content = b''.join(producer(f))
                    content_length = len(content)
                    f = io.BytesIO(content)
                else:
                    chunked = self.protocol_version >= "HTTP/1.1"
                    if chunked:
                        # Use Chunked Transfer Encoding (RFC 7230 section 4.1)
                        self.send_header("Transfer-Encoding", "chunked")
                    self.end_headers()
                    # Return a generator of pieces of compressed data
                    return producer(f)

            self.send_header("Content-Length", str(content_length))
            self.end_headers()
            return f
        except:
            f.close()
            raise

def run(port=8080):
    server_address, handler = ('', port), RequestHandler
    httpd = server.HTTPServer(server_address, handler)

    print(("Server running on port http://localhost:{}.".format(server_address[1])))
    print("Press CTRL+C to Quit.")
    httpd.serve_forever()
