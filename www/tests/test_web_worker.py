from browser import worker
from tester import async_tester

msg_num = 0

def main(w):
    global ww
    ww = w
    ww.send('hello')

def onmessage(ev):
    global msg_num
    if msg_num == 0:
        async_tester.assertEqual(ev.data, 'sent by web worker')
        ww.send(['a', 1])
    elif msg_num == 1:
        async_tester.assertEqual(ev.data, ['a'])
        async_tester.assertIs(type(ev.data), list)
        print('all tests ok')
    msg_num += 1

worker.create_worker('test_web_worker', main, onmessage)