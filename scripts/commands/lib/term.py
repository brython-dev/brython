"""
    Provides helper functions for terminal output.
"""
from plumbum import colors
from plumbum.cli.termsize import get_terminal_size


class StatusLine:
    """
        A class for creating & updating status lines (something like a progressbar, but with textual updates).
        A new status line is created by calling `start_action`, the status is updated by calling `update`
        (which has a signature similar to the print function) and the status is finished by calling `end_action`.
        A progressbar-like usage might be implemented as follows:

        from term import status
        status.start_action("Doing bar")
        for i in range(100):
            status.update(i,"% finished")
        status.end_action()

    """
    COLOR_OK    = colors.green
    COLOR_ERROR = colors.red

    def __init__(self):
        self._lead_text = ''
        self._last_len = 0
        self._width = get_terminal_size(default=(0,0))[0]

    def start_action(self, heading):
        """
        Starts a new statusline, printing out heading followed by a semicolon and empty status.
        """
        self._clear()
        self._lead_text = heading+':'
        self._last_len = 0
        self.update()

    def end_action(self, ok=True, message=None, preserve_status=False):
        """
        If no message is provided, the status is updated with a green 'OK' if (ok=True) or a
        red 'ERROR' (if ok=False). If a message is provided, the status is updated with this message
        instead. If preserve_status is True, the status is not updated (i.e. the last status update
        remains). Finally a new line is started.

        """
        if not preserve_status:
            mlen = 0
            if message:
                message = '('+message+') '
                mlen += len(message)
            else:
                message = ''
            if ok:
                mlen += len('OK')
                result_text = message + (self.COLOR_OK | 'OK')
            else:
                mlen += len('ERROR')
                result_text = message + (self.COLOR_ERROR | 'ERROR')
            mlen += len(self._lead_text+' ')
            indent = (self._width-10) - mlen
            if indent > 0:
                result_text = str(' '*indent) + result_text
            self.update(result_text)
        print()

    def update(self, *args, finish=False):
        """
            Updates the current status (i.e. deletes the old status and replaces it with the new status).
            Status is composed by joining the stringified arguments (similar to how print works)
        """
        self._clear()
        if finish:
            end = '\n'
        else:
            end = ''
        print(self._lead_text, *args, end=end, flush=True)
        out_str = ' '.join([str(x) for x in args])
        self._last_len = len(self._lead_text+' '+out_str)

    def _clear(self):
        print("\r", self._last_len * " ", "\r", end='', sep='')


status = StatusLine()

