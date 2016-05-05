Problem
-------

Read the content of a file


Solution
--------

We use the built-in function `open()` to load the file content

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

```exec
import time
from browser import document

fake_qs = '?foo=%s' %time.time()
document['zone'].value = open('file.txt'+fake_qs).read()
```

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Initial content</textarea>
</td>
</tr>
</table>

Note the query string with a random value at the end of the file name : it is 
required to refresh the result if the source file is changed between two calls

The next example adds a timeout function to print a message in case the file 
was not found after 4 seconds :

```python
import time
from browser import document 

def on_complete(req):
    if req.status==200 or req.status==0:
        document["zone"].value = req.text
    else:
        document["zone"].value = "error "+req.text

def err_msg():
    document["zone"].text = "server didn't reply after %s seconds" %timeout

timeout = 4

def go(url):
    req = ajax()
    req.bind("complete", on_complete)
    req.set_timeout(timeout,err_msg)
    req.open('GET',url,True)
    req.send()

go('file.txt?foo=%s' %time.time())
```
