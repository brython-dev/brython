from browser import worker

def main(w):
    w.send('hello')

def onmessage(ev):
    assert ev.data == 'sent by web worker'

    
worker.create_worker('test_web_worker', main, onmessage)