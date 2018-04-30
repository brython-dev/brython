from plumbum import colors
from plumbum.cli.termsize import get_terminal_size

class StatusLine:
    COLOR_OK    = colors.green
    COLOR_ERROR = colors.red

    def __init__(self):
        self._lead_text = ''
        self._last_len = 0
        self._width = get_terminal_size(default=(0,0))[0]

    def start_action(self, heading):
        self._clear()
        self._lead_text = heading+':'
        self._last_len = 0
        self.update()

    def end_action(self, ok=True, message=None, preserve_status=False):
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

