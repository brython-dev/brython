"""Script server handling GET and POST requests, HTTP redirection

Runs Python functions defined in scripts, with one argument representing the
dialog (request+response) :

    1. dialog.request : information sent by user agent to server
    
      - dialog.request.url : requested url (without query string)

      - dialog.request.headers : the http request headers sent by user agent
      
      - dialog.request.encoding : encoding used in request

      - dialog.request.cookies : instance of http.cookies.SimpleCookie, holds 
        the cookies sent by user agent

      - if the request is sent with the GET method, or the POST method with
        enctype or content-type set to 'application/x-www-form-urlencoded' or 
        'multipart/...' :

          - dialog.request.fields : a dictionary for key/values received 
            either in the query string, or in the request body for POST 
            requests. Keys and values are strings, not bytes

      - else :

          - dialog.request.raw : for requests of other types (eg Ajax requests 
            with JSON content), request body as bytes
          
          - dialog.request.json() : function with no argument that returns a
            dictionary built as the parsing of request body 

    2. dialog.response : data set by script
    
      - dialog.response.headers : the HTTP response headers
    
      - dialog.response.cookie : instance of http.cookies.SimpleCookie, used to 
        set cookies to send to the user agent with the response

      - dialog.response.encoding : Unicode encoding to use to convert the string 
        returned by script functions into a bytestring. Defaults to utf-8.

    3. variables, exceptions and functions used in the script
    
      - dialog.root : path of document root in the server file system

      - dialog.env : WSGI environment variables
    
      - dialog.error : an exception to raise if the script wants to return an
        HTTP error code : raise dialog.error(404)

      - dialog.redirection : an exception to raise if the script wants to 
        perform a temporary redirection (302) to a specified URL : 
        raise dialog.redirection(url)
      
      - dialog.template(filename, **kw) : renders the template file at
        templates/<filename> with the key/values in kw

The response body is the return value of the function. If it is a string, it
is converted in bytes using the attribute dialog.response.encoding.

Attributes of class Application :

    - root : document root. Defaults to current directory.
    
    - static : list of directories for static files. Defaults to subdirectory
      "static" of document root.

    - dispatch(mapping) : mapping maps url patterns to callables. If a url 
      matches the pattern, the associated function will be executed. The pattern
      may include the form <name>, in this case dialog.request.fields has the
      key "name".
      
      For instance if mapping is 
      
          {'test/<book_id>': module.function}
      
      calling url 'test/3' will run module.function(dialog) with 
      dialog.request.fields set to {'book_id': '3'}

"""

import sys
import os
import importlib
import re
import io
import traceback
import datetime
import string
import types
import collections
import random
import tokenize

import html.parser

import cgi
import urllib.parse
import http.cookies
import http.server
import email.utils
import email.message
import json


class HttpRedirection(Exception):pass
class HttpError(Exception):pass
class DispatchError(Exception): pass
class RoutingError(Exception): pass


class Message:

    def __init__(self):
        self.headers = email.message.Message()
        self.cookies = http.cookies.SimpleCookie()


class Dialog:
    """Instances of Dialog are passed as arguments to the script functions.
    They have attributes taken from the application instance."""

    def __init__(self, obj):
        self.request = obj.request
        self.response = obj.response
        self.root = obj.root
        self.env = obj.env
        self.template = obj.template
        self.redirection = HttpRedirection
        self.error = HttpError


class TemplateError(Exception):

    def __init__(self, msg, parser, text):
        self.msg = msg
        self.line, self.column = parser.getpos()
        self.text = text

    def __str__(self):
        return '{} line {}'.format(self.msg, self.line)


class TemplateParser(html.parser.HTMLParser):

    forbidden = ['import', 'exec', '__builtins__', '__import__']
    PY_TAG = 'py'

    def __init__(self, *args, **kw):
        html.parser.HTMLParser.__init__(self, *args, **kw)
        self.src = '' # Generated Python source code
        self.indent = 0
        self.py_tags = [] # stack of Python blocks
        self.pyline = 0 # line number in generated Python code
        self.line_mapping = {} # maps Python line num to template line num

    def _randname(self):
        return ''.join(random.choice(string.ascii_letters) for i in range(8))
        
    def add(self, source, text):
        line, column = self.getpos()
        self.src += self.indent*'    '+source+'\n'
        self.pyline += 1+source.count('\n')
        self.line_mapping[self.pyline] = (line, column, text)
    
    def control(self, source, text):
        """Control that Python source code doesn't include sensible
        names"""
        reader = io.BytesIO(source.encode('utf-8')).readline
        for tok_type, tok, *args in tokenize.tokenize(reader):
            if tok_type == tokenize.NAME:
                if tok in self.forbidden:
                    msg = 'forbidden name "{}"'
                    raise TemplateError(msg.format(tok), self, text)
        
    def handle_starttag(self, tag, attrs):
        """Handle a start tag
        If tag is PY_TAG :
        - add its attribute "code" to generated source code
        - if the code starts a block (ie ends with ":"), increment indentation.

        Else print the tag, formatted by method _format()
        """
        text = self.get_starttag_text()
        line, column = self.getpos()
        if tag == self.PY_TAG:
            for name, value in attrs:
                if name=='code':
                    has_code = True
                    value = value.rstrip()
                    self.control(value, text)
                    self.add(value, text)
                    self.py_tags.append([value, self.get_starttag_text(), 
                        (line, column)])
                    if value.endswith(':'):
                        self.indent += 1
                    break
                else:
                    msg = 'unknown attribute "{}"'
                    raise TemplateError(msg.format(name), self, text)
            else:
                msg = 'py tag missing attribute "code"'
                raise TemplateError(msg, self, text)
        else:
            self.handle_attrs(tag, attrs, text)

    def handle_startendtag(self, tag, attrs):
        """Handle a startend tag, ie a tag ending with />"""
        text = self.get_starttag_text()
    
        if tag == self.PY_TAG:
            # tags of the form <py ... /> support 2 attributes :
            # - <py code="..."> : the code is added to the source
            # - <py expr="..."> : the result of print(expr) is added to the
            #   source
            line, column = self.getpos()
            has_expr = False
            for name, value in attrs:
                if name=='code':
                    has_expr = True
                    value = value.rstrip()
                    self.control(value, text)
                    if value.endswith(':'):
                        msg = 'A single py tag cannot start a code block : {}'
                        raise TemplateError(msg.format(text), self, text)
                    self.add(value, text)
                elif name == 'expr':
                    has_expr = True
                    value = value.strip()
                    self.add('print({}, end="")'.format(value), text)
                elif name == 'include':
                    has_expr = True
                    value = value.strip() # file name
                    res = TemplateParser().render(value, **self.kw)[1]
                    self.add('print("""{}""", end="")'.format(res), text)
                else:
                    msg = 'unknown attribute "{}" - use "code"'
                    raise TemplateError(msg.format(name), self, text)
            if not has_expr:
                msg = 'py/ tag missing attribute "code" or "expr"'
                raise TemplateError(msg, self, text)

        else:
            self.handle_attrs(tag, attrs, text)

    def handle_endtag(self, tag):
        text = '</{}>'.format(tag)
        if tag == self.PY_TAG:
            if not self.py_tags:
                msg = 'unexpected closing tag </py>'
                raise TemplateError(msg, self, text)
            value, text, pos = self.py_tags.pop()
            if value.endswith(':'):
                self.indent -= 1
        else:
            self.add('print("{}")'.format(text), text)

    def handle_data(self, data):
        """Data is printed unchanged"""
        if data.strip():
            self.add('print("""{}""", end="")'.format(data), data)     

    def handle_attrs(self, tag, attrs, text):
        """Used for tags other than <py> ; if they have an attribute named 
        "attrs", its value must be of the form key1=value1, key2=value2... ; 
        this value is used as argument of dict(), and the resulting dictionary 
        is used to generate tag attributes "key1=value1 key2=value2 ..." ; if 
        the value associated with a key is None, the key is ignored"""
        
        if not 'attrs' in [name for (name, value) in attrs]:
            self.add('print("""{}""", end="")'.format(text), text)
            return
        
        # print tag and key/values except for key=='attrs'
        txt = '<{} '.format(tag)
        simple = ['{}=\\"{}\\"'.format(name, value.replace("'", "\\'"))
            for (name, value) in attrs if name !='attrs']

        txt += ' '.join(simple)
        
        self.add('print("{}", end="")'.format(txt), text)
        
        for name, args in attrs:
            if name == 'attrs':
                key_name = 'key_{}'.format(self._randname())
                value_name = 'value_{}'.format(self._randname())
                self.add('for {}, {} in dict({}).items():'.format(key_name, 
                    value_name, args), text)
                self.add('    if not isinstance({}, bool):'.format(value_name), text)
                self.add('        print("{{}}=\\"{{}}\\" ".format({}, {}),'
                    ' end="")'.format(key_name, value_name), text)
                self.add('    elif {}:'.format(value_name), text)
                self.add('        print("{{}}".format({}), end="")'.format(key_name), text)

        # close tag
        self.add('print(">", end="")', text)

    def render(self, filename, **kw):
        """Renders the template located at templates/<filename>
        
        Returns (status, result) where status is 0 if an exception was raised,
        1 otherwise and result is a string with the error message of the
        template render with key/values in kw
        """
        
        self.kw = kw

        def _debug():
            """Returns formatted error traceback with the line in template"""
            # store original traceback
            out = io.StringIO()
            traceback.print_exc(file=out)
            
            # add line in original template file
            tb = sys.exc_info()[2]
            extract = traceback.extract_tb(tb)
            
            if isinstance(exc, TemplateError):
                line, column, text = exc.line, exc.column, exc.text
            else:
                if isinstance(exc, (SyntaxError, IndentationError)):
                    python_line = sys.exc_info()[1].args[1][1]
                else:
                    python_line = extract[-1][1]
            
                while python_line and python_line not in self.line_mapping:
                    python_line -= 1
                line, column, text = self.line_mapping[python_line]
            out.write('\nLine {} in template {}\n'.format(line, filename))
            out.write(text)
            return out.getvalue()

        # the generated Python code uses "print" to produce the result, so we
        # redirect sys.stdout
        save_stdout = sys.stdout
        
        # get template source code
        tmpl_source = open(filename, encoding="utf-8").read()
        
        try:
            self.feed(tmpl_source)
            
            if self.py_tags: # unclosed <py> tags
                value, text, (line, column) = self.py_tags.pop()
                msg = "Unclosed py tag line {} column {} : {}"
                raise TemplateError(msg, self, text)
        
            sys.stdout = io.StringIO() # redirect sys.stdout
            
            trace = 'trace.py'
            with open(trace, 'w', encoding='utf-8') as out:
                out.write(self.src)
            res = exec(self.src, kw)
            return 1, sys.stdout.getvalue()

        except Exception as exc:
            res = _debug()
            return 0, res

        finally:
            sys.stdout = save_stdout
        

class application(http.server.SimpleHTTPRequestHandler):

    root = os.getcwd()
    static = {'static': 'static'}
    patterns = {}

    def __init__(self, environ, start_response):
    
        self.env = environ
        self.start_response = start_response

        # Set attributes for logging
        path = self.env['PATH_INFO']
        if self.env['QUERY_STRING']:
            path += '?'+self.env['QUERY_STRING']
        
        self.request_version = self.env['SERVER_PROTOCOL']
        self.requestline = '%s %s %s' %(self.env['REQUEST_METHOD'],
            path, self.request_version)
        self.client_address = [self.env['REMOTE_ADDR'],
            self.env.get('REMOTE_PORT', self.env['SERVER_PORT'])]

        # Initialise attribute "request" from data sent by user agent
        self.request = request = Message()
        self.request.url = self.env['PATH_INFO']
        for key in self.env:
            if key=='HTTP_COOKIE':
                request.cookies = http.cookies.SimpleCookie(self.env[key])
            elif key.startswith('HTTP_'):
                request.headers[key[5:]] = self.env[key]
            elif key.upper() == 'CONTENT_LENGTH':
                request.headers['Content-Length'] = self.env[key]
            elif key.upper() == 'CONTENT_TYPE':
                request.headers['Content-Type'] = self.env[key]

        # Initialise attribute "response"
        self.response = Message()
        self.response.encoding = "utf-8"

        self.status = "200 Ok"

    def __iter__(self):
        """Iteration expected by the WSGI protocol. Calls start_response
        then yields the response body
        """
        try:
            self.get_request_fields()
            self.handle()
        except:
            import traceback
            out = io.StringIO()
            traceback.print_exc(file=out)
            self.response.headers['Content-type'] = "text/plain"
            self.response.body = out.getvalue().encode(self.response.encoding)

        self.start_response(str(self.status), self.response_headers())
        yield self.response.body

    def get_request_fields(self):
        """Set self.request.fields, a dictionary indexed by field names
        If field name ends with [], the value is a list of values
        Else, it is a single value, or a list if there are several values
        """
        request = self.request
        request.fields = {}

        # Get request fields from query string
        fields = cgi.parse_qs(self.env.get('QUERY_STRING',''), 
            keep_blank_values=1)
        
        for key in fields:
            if key.endswith('[]'):
                request.fields[key[:-2]] = fields[key]
            elif len(fields[key])==1:
                request.fields[key] = fields[key][0]
            else:
                request.fields[key] = fields[key]

        if self.env['REQUEST_METHOD']=='POST':

            # Get encoding of request data
            charset = 'utf-8'
            for key in request.headers:
                mo = re.search('charset\s*=(.*)$', request.headers[key])
                if mo:
                    charset = mo.groups()[0]
                    break
            request.encoding = charset

            fp = self.env['wsgi.input']

            has_keys = True
            if 'content-type' in request.headers:
                ctype, pdict = cgi.parse_header(request.headers['content-type'])
                has_keys = ctype == 'application/x-www-form-urlencoded' or \
                    ctype.startswith('multipart/')

            # If data is not structured with key and value (eg JSON content),
            # only read raw data and set attribute "raw" and "json" of request 
            # object
            if not has_keys:
                length = int(request.headers['content-length'])
                request.raw = fp.read(length)
                def _json():
                    return json.loads(request.raw.decode(charset))
                request.json = _json
                return

            # Update request fields from POST data
            body = cgi.FieldStorage(fp, headers=request.headers,
                environ={'REQUEST_METHOD':'POST'})

            data = {}
            for k in body.keys():
                if isinstance(body[k],list): # several fields with same name
                    values = [x.value for x in body[k]]
                    if k.endswith('[]'):
                        data[k[:-2]] = values
                    else:
                        data[k] = values
                else:
                    if body[k].filename: # file upload : don't read the value
                        data[k] = body[k]
                    else:
                        if k.endswith('[]'):
                            data[k[:-2]] = [body[k].value]
                        else:
                            data[k] = body[k].value
            request.fields.update(data)
            
    def handle(self):
        """Process the data received"""
        response = self.response
        self.elts = urllib.parse.urlparse(self.env['PATH_INFO']+
            '?'+self.env['QUERY_STRING'])
        self.url = self.elts[2]
        response.headers.add_header("Content-type",'text/html') # default

        kind, arg = self.resolve(self.url)
        if kind=='file':
            if not os.path.exists(arg):
                return self.send_error(404, 'File not found', 
                    'No file matching {}'.format(self.url))
            return self.send_static(arg)
        
        func, kw = arg
        # Else args is a dictionary with the named groups
        self.request.fields.update(kw)

        # Run function
        return self.run_script(func)

    def send_static(self, fs_path):
        """Send the content of a file in a static directory"""
        try:
            f = open(fs_path,'rb')
        except IOError:
            return self.send_error(404, "File not found",
                "No file found for given url")
        # Use browser cache if possible
        if "If-Modified-Since" in self.request.headers:
            ims = email.utils.parsedate(
                self.request.headers["If-Modified-Since"])
            if ims is not None:
                ims_datetime = datetime.datetime(*ims[:7])
                ims_dtstring = ims_datetime.strftime("%d %b %Y %H:%M:%S")
                last_modif = datetime.datetime.utcfromtimestamp(
                    os.stat(fs_path).st_mtime).strftime("%d %b %Y %H:%M:%S")
                if last_modif == ims_dtstring:
                    self.done(304,io.BytesIO())
                    return
        ctype = self.guess_type(fs_path)
        self.response.headers.set_type(ctype)
        self.response.headers['Content-length'] = str(os.fstat(f.fileno())[6])
        self.response.headers["Last-modified"] = \
            self.date_time_string(os.stat(fs_path).st_mtime)
        self.done(200,f)

    @classmethod
    def dispatch(cls, routes):
        """routes is a mapping between url patterns and callables"""
        # Define attribute patterns : maps regular expressions (instead of
        # strings) to callables
        cls.patterns = {
            '^'+re.sub('<(.*?)>', r'(?P<\1>[^/]+?)', pattern)+'$': value
            for pattern, value in routes.items()
        }
        
    def resolve(self, url):
        """Combine url and the routes defined for the application to return 
        # a file path, function name and additional arguments.
        """
        # Split url in elements separated by /
        elts = urllib.parse.unquote(url).lstrip('/').split('/')

        target, patterns = None, []
        for pattern, func in application.patterns.items():
            mo = re.match(pattern, url)
            if mo:
                patterns.append(pattern)
                if target is not None:
                    # If more than one pattern matches the url, refuse to guess
                    msg = 'url %s matches at least 2 patterns : %s'
                    raise DispatchError(msg %(url, patterns))
                target = (func, mo.groupdict())
        if target is not None:
            return 'func', target

        # finally, try a path in the file system
        return 'file', os.path.join(self.root, *elts)

    def run_script(self, func):
        """Run function specified by path"""
        try:
            # run function with Dialog(self) as positional argument
            result = func(Dialog(self))
        except HttpRedirection as url:
            self.response.headers['Location'] = url
            return self.done(302,io.BytesIO())
        except HttpError as err:
            return self.done(err.args[0], io.BytesIO())
        except: # Other exception : print traceback
            result = io.StringIO()
            traceback.print_exc(file=result)
            result = result.getvalue() # string
            return self.send_error(500, 'Server error', result)

        # Get response encoding
        encoding = self.response.encoding
        if not "charset" in self.response.headers["Content-type"]:
            if encoding is not None:
                ctype = self.response.headers["Content-type"]
                self.response.headers.replace_header("Content-type",
                    ctype + "; charset=%s" %encoding)

        # Build response body as a bytes stream
        output = io.BytesIO()
        if isinstance(result, bytes):
            output.write(result)
        elif isinstance(result, str):
            try:
                output.write(result.encode(encoding))
            except UnicodeEncodeError:
                msg = io.StringIO()
                traceback.print_exc(file=msg)
                return self.done(500,io.BytesIO(msg.getvalue().encode('ascii')))
        else:
            output.write(str(result).encode(encoding))
            
        self.response.headers['Content-length'] = output.tell()
        self.done(200, output)

    def template(self, filename, **kw):
        """Returns a string : the template at /templates/filename executed 
        with the data in kw
        """
        parser = TemplateParser()
        path = os.path.join(application.root, 'templates', filename)
        status, result = parser.render(path, **kw)
        if not status:
            self.response.headers.set_type('text/plain')
        return result            

    def send_error(self, code, expl, msg=''):
        self.status = '%s %s' %(code, expl)
        self.response.headers.set_type('text/plain')
        self.response.body = msg.encode(self.response.encoding)

    def response_headers(self):
        headers = [(k, str(v)) for (k,v) in self.response.headers.items()]
        for morsel in self.response.cookies.values():
            headers.append(('Set-Cookie', morsel.output(header='').lstrip()))
        return headers

    def done(self, code, infile):
        """Send response, cookies, response headers and the data read from 
        infile
        """
        self.status = '%s %s' %(code, 
            http.server.BaseHTTPRequestHandler.responses[code])
        if code == 500:
            self.response.headers.set_type('text/plain')
        infile.seek(0)
        self.response.body = infile.read()

    @classmethod
    def run(cls, port=8000):
        from wsgiref.simple_server import make_server
        httpd = make_server('localhost', port, application)
        print("Serving on port %s" %port)
        httpd.serve_forever()        

if __name__ == '__main__':
    application.run(port=8000)