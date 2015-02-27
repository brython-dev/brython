# -*- coding: utf-8 -*-
#


"""Simple HTTP Server for Brython Development."""


import logging as log
import os
import sys
from copy import copy
from ctypes import byref, cdll, create_string_buffer
from tempfile import gettempdir
from webbrowser import open_new_tab

try:  # https://github.com/lepture/python-livereload
    import livereload  # pip install livereload
except ImportError:
    livereload = None  # Still works Ok without LiveReload


# Logging Log
if not sys.platform.startswith("win") and sys.stderr.isatty():
    def add_color_emit_ansi(fn):
        """Add methods we need to the class."""
        def new(*args):
            """Method overload."""
            if len(args) == 2:
                new_args = (args[0], copy(args[1]))
            else:
                new_args = (args[0], copy(args[1]), args[2:])
            if hasattr(args[0], 'baseFilename'):
                return fn(*args)
            levelno = new_args[1].levelno
            if levelno >= 50:
                color = '\x1b[31m'  # red
            elif levelno >= 40:
                color = '\x1b[31m'  # red
            elif levelno >= 30:
                color = '\x1b[33m'  # yellow
            elif levelno >= 20:
                color = '\x1b[32m'  # green
            elif levelno >= 10:
                color = '\x1b[35m'  # pink
            else:
                color = '\x1b[0m'  # normal
            try:
                new_args[1].msg = color + str(new_args[1].msg) + '\x1b[0m'
            except Exception as reason:
                print(reason)
            return fn(*new_args)
        return new
    log.StreamHandler.emit = add_color_emit_ansi(log.StreamHandler.emit)
log.basicConfig(level=-1, filemode="w",
                format="%(levelname)s: %(asctime)s %(message)s %(lineno)s",
                    filename=os.path.join(gettempdir(), "brython-server.log"))
log.getLogger().addHandler(log.StreamHandler(sys.stderr))
try:
    os.nice(19)  # smooth cpu priority
    libc = cdll.LoadLibrary('libc.so.6')  # set process name
    buff = create_string_buffer(len("brython-server") + 1)
    buff.value = bytes("brython-server".encode("utf-8"))
    libc.prctl(15, byref(buff), 0, 0, 0)
except Exception as reason:
    pass
log.debug(__doc__)
log.info("Press CTRL+C to Quit.")


if livereload:  # with LiveReload
    log.info("LiveReload Server running on port http://localhost:8000.")
    livereload.Server().serve(port=8000, open_url=True)
else:  # without LiveReload
    log.warning("Fallback to Manual Reload, install LiveReload Python module.")
    log.warning("Please to start using LiveReload run: pip install livereload")
    log.info("Simple Server running on port http://localhost:8000.")
    try:
        import http.server as server
        from http.server import CGIHTTPRequestHandler
    except ImportError:
        import BaseHTTPServer as server
        from CGIHTTPServer import CGIHTTPRequestHandler
    server_address, handler = ('', 8000), CGIHTTPRequestHandler
    httpd = server.HTTPServer(server_address, handler)
    open_new_tab("http://localhost:{}/site/".format(server_address[1]))
    httpd.serve_forever()
