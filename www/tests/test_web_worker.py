from browser import worker, is_webworker, document
from tester import async_tester

msg_num = 0

def main(w):
    global ww
    ww = w
    ww.send('hello')

def onmessage(ev):
    global msg_num
    print('message', msg_num)
    async_tester.assertFalse(is_webworker)
    if msg_num == 0:
        async_tester.assertEqual(ev.data, 'sent by web worker')
        ww.send(['a', 1])
    elif msg_num == 1:
        async_tester.assertEqual(ev.data, ['a'])
        async_tester.assertIs(type(ev.data), list)
        ww.send(1)
    elif msg_num == 2:
        async_tester.assertEqual(ev.data, ['coucou', {'x': 1}])
        print('all tests ok')
    msg_num += 1

worker.create_worker('test_web_worker', main, onmessage)

# issue 2389
wid="webworker_82c5f471-0adf-47b1-8d1c-7bcc11aa54e6"
element = document.getElementById(wid)

def onready(*args):
  print('ready')
def onmessage(*args):
  print('message')
def onerror(*args):
  print('error')
  
worker.create_worker(wid, onready, onmessage, onerror)