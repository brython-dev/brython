from browser import window

from .futures import Future


MODE_BINARY = 0
MODE_TEXT = 1
MODE_DATAURL = 2

class FileFuture(Future):
    
    def __init__(self, file, mode=MODE_TEXT):
        super().__init__()
        self._reader = window.FileReader.new()
        self._reader.bind('load', self._load_handler)
        self._mode = mode
        if self._mode == MODE_BINARY:
            raise NotImplementedError()
        if mode == MODE_BINARY:
            self._reader.readAsBinaryString(file)
        elif mode == MODE_TEXT:
            self._reader.readAsText(file)
        elif mode == MODE_DATAURL:
            self._reader.readAsDataURL(file)
        
    def _load_handler(self, evt):
        self.set_result(evt.target.result)
        
        


def read(file, mode):
    return FileFuture(file, mode)
