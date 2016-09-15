module **browser.ajax**
-----------------------

This module allows running Ajax requests. It defines a single function :

`ajax()`
> returns an `ajax` object

This object has the following attributes and methods :

`bind(`_evt,function_`)`
> attaches the _function_ to the event _evt_. _evt_ is a string that matches 
> the different request states :

- "uninitialized" : not initialized
- "loading" : established connection
- "loaded": received request
- "interactive": response in progress
- "complete" : finished

> The _function_ takes a single argument, the `ajax` object.

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
   if req.status==200 or req.status==0:
       document["result"].html = req.text
   else:
       document["result"].html = "error "+req.text

req = ajax.ajax()
req.bind('complete',on_complete)
# send a POST request to the url
req.open('POST',url,True)
req.set_header('content-type','application/x-www-form-urlencoded')
# send data as a dictionary
req.send({'x':0, 'y':1})
```
To send data via the GET method, it must be included in the query string

```python
qs = "x=0&y=1"
req.open('GET', url+'?'+qs, True)
req.set_header('content-type', 'application/x-www-form-urlencoded')
req.send()
```