"""
    Misc devel utilities (mainly, running a http server)
"""
import os
from webbrowser import open_new_tab

from .lib.cli import M, Option, Flag
from .lib.http import RequestHandler, server as http_server
from .lib.info import BRYTHON_DIR, STATIC_DOC_DIR

from .doc import compile as compile_docs

@M.command()
def server(port: Option('Port to run the http server on') = 8000,
           no_docs: Flag('Do not build the docs', names=['--no_docs']) = False,
           no_browser: Flag('Do not open in a browser window', names=['--no_browser']) = False):
    """Run a devel server."""
    if not no_docs and not STATIC_DOC_DIR.exists():
        compile_docs()

    os.chdir(str(BRYTHON_DIR/'www'))

    server_address, handler = ('', int(port)), RequestHandler
    httpd = http_server.HTTPServer(server_address, handler)
    print("""
Simple HTTP Server for Brython Development.
Files are served from subdirectory www, except cgi scripts that are
served from subdirectory cgi-bin
""")
    print(("Server running on port http://localhost:{}.".format(server_address[1])))
    print("Press CTRL+C to Quit.")

    if not no_browser:
        open_new_tab("http://localhost:{}/".format(server_address[1]))

    httpd.serve_forever()


