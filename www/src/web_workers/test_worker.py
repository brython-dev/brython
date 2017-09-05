"""
    An example of a simple worker 
    Run as follows:
        
        from browser import webworker as ww
        w = ww.WorkerParent('web_workers/test_worker.py',[1,2,3],{"test":"Ahoj"})
        m = ww.Message('ping',"ahoj")
        r = w.post_message(m,want_reply=True)
        w.post_message(ww.Message('quit',None))
        
"""
from browser.webworker import current_worker, Message
from browser import console

from sys import argv
from os import environ

def pong(self, message, **_):
    print('Web worker received message (',message.id,')', message.name, message.data)
    current_worker.post_reply(message, Message('pong', message.data))
        
def quit(self, *args, **kwargs):
    current_worker.terminate()
        
print("Starting test worker with args:", argv, "and environment", environ)

current_worker.bind_message('ping', pong)
current_worker.bind_message('quit', quit)
current_worker.exec()
        
        
