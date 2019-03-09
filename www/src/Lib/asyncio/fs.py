"""
    Asynchronous access to local/remote files.

    Usage:

        from browser import document as doc, html
        import asyncio.fs as afs

        # Create an input element & append it to the page
        i = html.INPUT(type='file')
        doc <= i

        # Wait for the user to select a file ...

        # Once the user has selected the file
        # we can open it using the `open` method
        ff = afs.open(i.files[0])

        # The method returns an `asyncio.Future`
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


    Note: The `asyncio.fs.BrowserFile` object keeps the file contents in memory.

    Note: The `asyncio.fs.BrowserFile` object supports the `write` method. If you
    modify the file using this method, the `save` method will save
    the modified contents.

    Note: The `asyncio.fs.open` method also accepts urls. In that case it will
    download the url and return the contents as an `asyncio.fs.BrowserFile` object.
    However, the `save` method will still save the file locally, **not** remotely.


    The module also contains a convenience method

    `asyncio.fs.open_local`

    Which opens a file dialog which the user can use to pick a file. The method
    returns an `asyncio.Future` which resolves into an `asyncio.fs.BrowserFile`
    with the file contents when the file is read. The method works by
    appending an input to the document body, registering a change handler for it,
    programmatically clicking it, and then immediately deleting it from the document.
"""
import io
import base64

from browser import window, document as doc, html

from .futures import Future
from .http import HTTPRequest
from .coroutines import run_async


class BrowserFile(io.StringIO):
    def __init__(self, name, content='', mime_type='text/plain;charset=utf-8'):
        super().__init__(content)
        self._mime_tp = mime_type
        self._name = name

    def as_data_url(self, mime_type=None):
        """
            Returns the file contents as a data-uri (suitable to assign to
            a src attribute of images, href attribute of links, etc.)
        """
        if mime_type is None:
            mime_type = self._mime_tp
        return 'data:'+self._mime_tp+';base64,'+base64.b64encode(self.getvalue().encode('utf-8')).decode('ascii')

    def save(self):
        """
            Saves the file locally.

            It works by silently appending a link element to the body. The link element has an
            appropriate download attribute (the name of the file) and href attribute
            (the data-uri with the contents of the file). This element is then programmatically
            clicked and removed from the body.
        """
        link = html.A(href=self.as_data_url(), download=self._name)
        doc <= link
        link.click()
        doc.body.removeChild(link)


class FutureLocalFile(Future):
    def __init__(self, file):
        super().__init__()
        self._reader = window.FileReader.new()
        self._reader.bind('load', self._load_handler)
        self._reader.bind('error', self._error_handler)
        self._reader.readAsText(file)
        self._name = file.name
        self._mime = file.type

    def cancel(self):
        self._reader.abort()

    def _load_handler(self, evt):
        self.set_result(BrowserFile(self._name, evt.target.result, mime_type=self._mime))

    def _error_handler(self, evt):
        self.set_exception(IOError(str(self._reader.error)))


def open_local():
    """
    Opens a file dialog which the user can use to pick a file.

    Returns:
        asyncio.Future: Returns a future which, upon reading the file,
                        resolves to an `asyncio.fs.BrowserFile` object with
                        the file contents.

    The method works by appending an input element to the document body, registering a change
    handler for it, programmatically clicking it, and then immediately
    deleting it from the document.
    """

    i = html.INPUT(type='file')
    result = Future()

    @run_async()
    def change_handler(evt):
        ret = yield open(i.files[0])
        result.set_result(ret)

    i.bind('change', change_handler)
    doc <= i
    i.click()
    doc.body.removeChild(i)
    return result


@run_async()
def open(file, mode='r', size_limit=None):
    """
        Opens a local or remote file and returns a Future, which, upon completion,
        will resolve to an `asyncio.fs.BrowserFile` object with the file contents.

        Args:
          file(instance of the javascript File object/str):
                if opening a local file, the parameter must be an instance of the javascript File object
                if opening a remote file, the parameter should be the url of the file
          mode(str): unused, present for compatibility with the builtin open method
    """
    if 'r' in mode:
        if type(file) == str:
            req = yield HTTPRequest(file)
            if size_limit is not None and req.response.length > size_limit:
                raise IOError("Maximum file size exceeded:"+str(req.response.length)+"(max allowed:"+str(size_limit)+")")
            ret = BrowserFile(file, req.response)
        else:
            if size_limit is not None and file.size > size_limit:
                raise IOError("Maximum file size exceeded:"+str(file.size)+"(max allowed:"+str(size_limit)+")")
            ret = yield FutureLocalFile(file)
    else:
        ret = BrowserFile(file, '')
    return ret
