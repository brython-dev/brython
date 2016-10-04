from browser import window

__all__ = ["Error", "open", "open_new", "open_new_tab"]

class Error(Exception):
    pass

_target = { 0: '', 1: '_blank', 2: '_new' }  # hack...


def open(url, new=0, autoraise=True):
    """ 
    new window or tab is not controllable
    on the client side. autoraise not available.
    """
    # javascript window.open doesn't work if you do not specify the protocol
    # A solution is the next hack:
    if '://' in url:
        if url[:6] == 'ftp://':
            print('entro')
        else:
            protocol = url.split('//:')[0]
            url = url.replace(protocol + '//:', '//')
    else:
        url = '//' + url
    print(url)
    if window.open(url, _target[new]):
        return True
    return False

def open_new(url):
    return open(url, 1)

def open_new_tab(url):
    return open(url, 2)


