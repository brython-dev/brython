# Brython-specific version

from browser import window

def open(url, new=0, autoraise=True):
    window.open(url)

def open_new(url):
    return window.open(url, "_blank")

def open_new_tab(url):
    return open(url)

