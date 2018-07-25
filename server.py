# -*- coding: utf-8 -*-
#

"""Simple HTTP Server for Brython Development.
Files are served from subdirectory www, except cgi scripts that are
served from subdirectory cgi-bin
"""


import os
import time
from webbrowser import open_new_tab
import argparse
import email
import datetime
import urllib.parse
from http import HTTPStatus
import socketserver
from http.server import CGIHTTPRequestHandler

# port to be used when the server runs locally
parser = argparse.ArgumentParser()
parser.add_argument('--port', help="The port to be used by the local server")

# generate docs?
# when testing new code on your repo it is not necessary to generate docs all
# the time so this option allows you to avoid this process
parser.add_argument(
    '--no-docs',
    help="Do not generate static docs.",
    action="store_true")

args = parser.parse_args()

port = int(args.port) if args.port else 8000

if not args.no_docs:
    # generate static doc pages if not already present
    if not os.path.exists(os.path.join(os.getcwd(),'www','static_doc')):
        save_dir = os.getcwd()
        os.chdir(os.path.join(os.getcwd(),'scripts'))
        make_doc = open('make_doc.py', "rb").read()
        make_doc = make_doc.decode("utf-8")
        exec(make_doc)
        os.chdir(save_dir)

os.chdir(os.path.join(os.getcwd(), 'www'))

cgi_dir = os.path.join(os.path.dirname(os.getcwd()), 'cgi-bin')

POST_PATHS = ['/time_cpython']

class RequestHandler(CGIHTTPRequestHandler):

    def send_head(self):
        """Common code for GET and HEAD commands.
        This sends the response code and MIME headers.
        Return value is either a file object (which has to be copied
        to the outputfile by the caller unless the command was HEAD,
        and must be closed by the caller under all circumstances), or
        None, in which case the caller has nothing further to do.
        """
        if self.is_cgi():
            return self.run_cgi()

        path = self.translate_path(self.path)
        if path in POST_PATHS:
            return

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
            self.send_header("Content-Length", str(fs[6]))
            self.send_header("Last-Modified",
                self.date_time_string(fs.st_mtime))
            self.end_headers()
            return f
        except:
            f.close()
            raise

    def translate_path(self, path):
        """For paths starting with /cgi-bin/, serve from cgi_dir"""
        elts = path.split('/')
        if len(elts)>1 and elts[0]=='' and elts[1]=='cgi-bin':
            return os.path.join(cgi_dir,*elts[2:])
        return CGIHTTPRequestHandler.translate_path(self, path)

    def do_POST(self):
        if self.path == '/time_cpython':
            if self.client_address[0] != '127.0.0.1':
                return self.send_error(403, "Forbidden")
            data = self.rfile.read(int(self.headers.get('Content-Length')))
            src = data.decode('utf-8')

            t0 = time.perf_counter()
            exec(src, {})
            t1 = time.perf_counter()

            response = '%f' % ((t1 - t0) * 1000.0)
            response_data = response.encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
        else:
            super(RequestHandler, self).do_POST()

server_address, handler = ('', port), RequestHandler
httpd = socketserver.ThreadingTCPServer(server_address, handler)
httpd.server_name = "Brython built-in server"
httpd.server_port = port
print(__doc__)
print(("Server running on port http://localhost:{}.".format(server_address[1])))
print("Press CTRL+C to Quit.")
open_new_tab("http://localhost:{}/".format(server_address[1]))
httpd.serve_forever()

