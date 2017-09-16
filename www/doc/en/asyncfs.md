module **asyncio.fs**
-----------------------
The module provides asynchronous access to local / remote files.


Below is a commented example which can be run from the repl.

```python
from browser import document as doc, html
import asyncio.fs as afs

# Create an input element & append it to the page
i = html.INPUT(type='file')
doc <= i

# Wait for the user to select a file ...

# Once the user has selected the file
# we can open it using the `open` method
ff = afs.open(i.files[0])

# The method is a coroutine, so it returns a `asyncio.Future`
# Once the file is read, we can retrieve the result with
f = ff.result()

# The result is an instance of `asyncio.fs.BrowserFile`
# which inherits from `io.StringIO`
# so you can access it with `read`, `readlines`,
# and all the other methods of `io.StringIO`
print(f.read())

# It also has an additional method `save`
# which downloads the file into the Downloads
# directory or, depending on user settings,
# opens a file dialog allowing him to choose where
# to save the file
f.save()
```

It should be noted that the `asyncio.fs.BrowserFile` object keeps the file contents in memory,
so one should be careful with large files. The `open` method takes an optional argument
`max_size` which specifies the maximum size (in bytes) of the file it is willing to load.
If the parameter is provided and the size of the file is bigger than this, it will raise
an `IOError` exception.

The `asyncio.fs.BrowserFile` object supports the `write` method. If you
modify the file using this method, the `save` method will save the modified contents.

The `asyncio.fs.open` method accepts either a [File](https://developer.mozilla.org/cs/docs/Web/API/File)
object or an url. In the latter case it will download the url and return the contents as
an `asyncio.fs.BrowserFile` object. However, the `save` method will still save the file locally, **not**
remotely.

**Note that remote reading is not fully tested yet.**


The module also contains a convenience method

```
    asyncio.fs.open_local
```

Which opens a file dialog which the user can use to pick a file. The method
returns a `asyncio.Future` which resolves into an `asyncio.fs.BrowserFile`
with the file contents when the file is read. The method works by
appending an input to the document body, registering a change handler for it,
programmatically clicking it, and then immediately deleting it from the document.

The above example code is meant to be run in the repl. Due to the asynchronous nature
of the methods, when run from a script, it should be wrapped in a coroutine, e.g. as follows:


```python
import asyncio
import asyncio.fs as afs

@asyncio.coroutine
def process_file(file_object = None):

    if file_object is None:
        input = yield afs.open_local()
    else:
        input = yield afs.open(file_object)

    output = yield afs.open('processed.txt','w')

    for ln in input.readlines():
        output.write(ln.replace('\n','\r\n'))

    output.save()

asyncio.ensure_future(process_file())
```
