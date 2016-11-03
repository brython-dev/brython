import os
from ScriptServer3 import application

from server_scripts import save_compiled

application.root = os.path.join(os.path.dirname(__file__), 'www')

application.dispatch({
    '/save_compiled': save_compiled.index
    }
)

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    port = 8060
    httpd = make_server('localhost', port, application)
    print("Serving on port %s" %port)
    httpd.serve_forever()
