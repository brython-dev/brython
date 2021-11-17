module **browser.ajax**
-----------------------

This module allows running Ajax requests.

The standard Web API syntax can be used (see <a href='#legacy'>below</a>) but
Brython proposes a more concise syntax: for each request method (GET, POST,
etc.) the module defines a specific function.

## Methods without a request body

`get(`_url[, blocking=False, headers={}, mode="text", encoding="utf-8", timeout=None, cache=False, data="", **callbacks]_`)`

and the same interface for methods `connect, delete, head, options` and
`trace`.

> _url_ is the address of the requested resource

> _blocking_ is a boolean to specify if the request is blocking or not.
> The default value is `False` (asynchronous request)

> _headers_ is a dictionary with the HTTP headers key / values

> _mode_ is the read mode : "text", "binary", "json", "document"

> if _mode_ is "text", _encoding_ is the text file encoding

> _data_ is either a string, or a dictionary. In the second case, the
> dictionary is converted into a string of the form `x=1&y=2`.

> _cache_ is a boolean to specify if the GET request should use the browser
> cache. It is set to `False` by default, which means that a random
> numeric parameter is added to the request

> _timeout_ is the time in seconds after which the request is canceled

> _**callbacks_ is a dictionary where keys are of the form
> `on` + event name (`onloaded`, `oncomplete`...) and the value is the
> <a href="#callback">callback function</a> that handles this event

## Methods with a request body

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

and the same interface for `patch` and `put`.

The parameters have the same meaning as for methods without a request body.
Parameters _mode, encoding_ and _cache_ are not relevant for these methods.

The request body is provided in the argument _data_. If is is a dictionary,
it is transformed transparently, and the body length (header "Content-Length")
is automatically computed and sent.

<a name="callback"></a>
## Callback functions

Callback functions are called when an event occurs on the Ajax object.

Possible events are:

- "uninitialized" : not initialized
- "loading" : established connection
- "loaded": received request
- "interactive": response in progress
- "complete" : finished

Generally, only the function for the event "complete" is defined.

Callback functions take a single argument, the Ajax object. In the function
body, the following attributes and methods of this object can be used:

`status`

> HTTP response code (integer) : 200 if the resource was found, 404 if it
> doesn't exist, etc.

`text`

> the response text : instance of `str` if request mode is "text", "json" or
> "xml", instance of `bytes` if mode is "binary"

`json`

> if request mode is "json", attribute `json` is the object obtained by
> parsing the JSON string sent by the server

`xml`

> if request mode is "document", attribute `xml` is the object containing the
> XML tree obtained from the response string

`read()`

> reads the response in the format determined by request mode

The other event that can be handled is "timeout", triggered if the duration
specified in the argument `timeout` is reached. For this event, the callback
function takes no argument.

## Examples

Reading a text file

```python
from browser import ajax

def read(req):
    print(req.text)

ajax.get("test.txt", oncomplete=read)
```

If the text file has an encoding different from UTF-8, the encoding can be
specified

```python
from browser import ajax

def read(req):
    print(req.text)

ajax.get("test-latin1.txt", encoding="latin1", oncomplete=read)
```

Reading a text file as bytes

```python
from browser import ajax

def read(req):
    assert isinstance(req.text, bytes)

ajax.get("test.txt", mode="binary", oncomplete=read)
```

Reading a binary file (eg an image)

```python
from browser import ajax

def read(req):
    assert isinstance(req.read(), bytes)

ajax.get("picture.png", mode="binary", oncomplete=read)
```


Reading a file with JSON content

```python
from browser import ajax

def read(req):
    print(req.json)

ajax.get("test.json", mode="json", oncomplete=read)
```

## Standard Web API interface

Ajax requests can also be written with a syntax closer to the standard Web API
specification.

The module defines the class `Ajax`, called without argument, that returns a
new request object.

A request object has the following methods:

`open(`_method, url, async_`)`
> _method_ is the HTTP method used for the request (usually GET or POST),

> _url_ is the resource location,

> _async_ is a boolean that indicates whether the call is asynchronous (the
> script that started the request goes on running without waiting for the
> response) or not (the script hangs until the response is received).

`bind(`_evt, function_`)`
> attaches the _function_ to the event _evt_. The events are the same as
> above.

> The _function_ takes a single argument, the `Ajax` instance, with the same
> attributes as above.

Once the request is opened, attributes can be specified:

`encoding`
> if the resource specified by the url is a text file, `encoding` is the file
> encoding

> if the Mime type (cf. [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType))
> is not explicitely set, giving a value to `encoding` sets the Mime type to
> "text/plain;charset=x-user-defined".

> This makes it possible to set the attribute `text` to the file content with
> the specified encoding

`responseType`
> the expected rresponse type (cf. [documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType))

`set_header(`_name, value_`)`
> sets the _value_ of the header _name_.

`set_timeout(`_duration, function_`)`
> if the query did not return response within _duration_ in seconds, it will
> cancel the query and execute the _function_. This function cannot have
> arguments.


All the properties of [XMLHTTPRequest objects](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
can be used on the Ajax object.

### Sending the request

`send(`_[data]_`)`
> sends (starts) the request. The optional argument _data_ is ignored if the
> method is not POST, PUT or PATCH ; it must be a dictionary, or a string
> representing the url encoding of key-value pairs.

> If you want to send files, you need to pass
> a dictionary with one of the keys a File object, e.g. provided you have
> an input element of type `file` and id `upload_file` you could send the
> user selected file under the key `upload` by calling
> `send({'upload':doc["upload_file"].elt.files[0]})`

### Example

We suppose there is a DIV with id _result_ in the HTML page

```python
from browser import document, ajax

def on_complete(req):
   if req.status == 200 or req.status == 0:
       document["result"].html = req.text
   else:
       document["result"].html = "error " + req.text

req = ajax.Ajax()
req.bind('complete', on_complete)
# send a POST request to the url
req.open('POST', url, True)
req.set_header('content-type', 'application/x-www-form-urlencoded')
# send data as a dictionary
req.send({'x': 0, 'y': 1})
```


### File upload

To send files entered in a form by a tag such as
```xml
<input type="file" name="choosefiles" multiple="multiple">
```
the module provides the function

`file_upload(`_url, file, method="POST", field_name="filetosave",  [**callbacks]_`)`

> _file_ is the file object to upload to the _url_, usually the result of an
> expression
<blockquote>
```python
for file in document["choosefiles"].files:
    ...
```
</blockquote>

> _method_ is the method used for the upload call, "POST" by default but can
> be set to "PUT"

> _field_name_ is the name of the field associated with the file to send. It
> will be used on the server side to get the data

Example:
```xml
<script type="text/python">
from browser import ajax, bind, document

def upload_ok(req):
    print("all right")

@bind("#upload", "click")
def uploadfiles(event):
    for f in document["choosefiles"].files:
        ajax.file_upload("/cgi-bin/savefile.py", f,
            oncomplete=upload_ok)
</script>

<form>
    <input id="choosefiles" type="file" multiple="multiple" />
</form>
<button id="upload">Upload</button>
```
