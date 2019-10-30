module **browser.ajax**
-----------------------

This module allows running Ajax requests. It defines a single class :

`Ajax()`
> returns an ajax object

This object has the following attributes and methods :

`bind(`_evt, function_`)`
> attaches the _function_ to the event _evt_. _evt_ is a string that matches
> the different request states :

- "uninitialized" : not initialized
- "loading" : established connection
- "loaded": received request
- "interactive": response in progress
- "complete" : finished

> The _function_ takes a single argument, the `Ajax` instance.

`open(`_method, url, async_`)`
> _method_ is the HTTP method used for the request (usually GET or POST),

> _url_ is the url to call,

> _async_ is a boolean that indicates whether the call is asynchronous (the
> script that started the request goes on running without waiting for the
> response) or not (the script hangs until the response is received).


`readyState`
> an integer representing the request state (cf table below).

<blockquote>
<table cellspacing=0 cellpadding=4 border=1>
<tr><th>
readyState
</th><th>
request state
</th></tr>
<tr><td align="center">0</td><td>"uninitialized"</td></tr>
<tr><td align="center">1</td><td align="center">"loading"</td></tr>
<tr><td align="center">2</td><td align="center">"loaded"</td></tr>
<tr><td align="center">3</td><td align="center">"interactive"</td></tr>
<tr><td align="center">4</td><td align="center">"complete"</td></tr>
</table>
</blockquote>

`set_header(`_name, value_`)`
> sets the _value_ of the header _name_.

`set_timeout(`_duration, function_`)`
> if the query did not return response within _duration_ in seconds, it will
> cancel the query and execute the _function_. This function cannot have
> arguments.

`send(`_[data]_`)`
> sends (starts) the request. The optional argument _data_ is ignored if the
> method is not POST ; it must be a dictionary, or a string representing the url
> encoding of key-value pairs. If you want to send files, you need to pass
> a dictionary with one of the keys a File object, e.g. provided you have
> an input element of type `file` and id `upload_file` you could send the
> user selected file under the key `upload` by calling
> `send({'upload':doc["upload_file"].elt.files[0]})`

`status`
> an integer representing the HTTP status of the request. The most usual are
> 200 (ok) and 404 (file not found).

`text`
> the server response as a string of characters.

`xml`
> the server response as a DOM object.

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

### Shortcuts

GET and POST calls can be performed in a more straightforward way with the
matching functions:

`get(`_url[, blocking=False, headers={}, mode="text", timeout=None, cache=False, data="", **callbacks]_`)`

and the same for `delete`, `head` and `options`.

`post(`_url[, blocking=False, headers={"Content-Type": _
_"application/x-www-form-urlencoded"}, timeout=None, data="", **callbacks]_`)`

and the same for `put`.

> _blocking_ is a boolean to specify if the request is blocking or not.
> The default value is `False` (asynchronous request)

> _headers_ is a dictionary with the HTTP headers key / values

> _mode_ is "text" or "binary"

> _data_ is either a string, or a dictionary. In the second case, the
> dictionary is converted into a string of the form `x=1&y=2`.

> _cache_ is a boolean to specify if the GET request should use the browser
> cache

> _timeout_ is the time in seconds after which the request is canceled

> _**callbacks_ is a dictionary where keys are of the form
> `on` + event name (`onloaded`, `oncomplete`...) and the value is the
> function that handles this event. For the key `ontimeout`, the value
> is the function to call if the duration defined in _timeout_ has been
> reached.

In the callback function, the `Ajax` object has a method _read()_ that reads the
response content as a string if mode is "text" and as `bytes` if mode is
"binary".

The above example can be written with this shortcut:

```python
from browser import document, ajax

def on_complete(req):
    if req.status == 200:
        document["result"].html = req.text
    else:
        document["result"].html = "error " + req.text

ajax.post(url,
          data={'x': 0, 'y': 1},
          oncomplete=on_complete)
```

Reading a binary file:

```python
from browser import ajax

def read(f):
    data = f.read()
    assert isinstance(data, bytes)

req = ajax.get("tests.zip", mode="binary",
    oncomplete=read)
```

### File upload

To send files entered in a form by a tag such as
```xml
<input type="file" name="choosefiles" multiple="multiple">
```
the module provides the function

`file_upload(`_url, file, [**callbacks]_`)`

> _file_ is the file object to upload to the _url_, usually the result of an
> expression
<blockquote>
```python
for file in document["choosefiles"].files:
    ...
```
</blockquote>

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
