# Brython-specific

# copied from PR #3024
class PickleBuffer:
    """Wrapper for potentially out-of-band serialisation of a buffer."""

    def __init__(self, buffer):
        self._view = memoryview(buffer)

    def raw(self):
        if self._view is None:
            raise ValueError("operation forbidden on released "
                             "PickleBuffer object")
        return self._view

    def release(self):
        self._view = None