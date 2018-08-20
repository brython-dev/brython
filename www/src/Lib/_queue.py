SimpleQueue = None

class Empty(Exception):
    'Exception raised by Queue.get(block=0)/get_nowait().'
    pass