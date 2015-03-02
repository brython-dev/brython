import ui
import random
from browser import html

# Global Constants/Variables for testing are prepared
EVENT_TYPES = ['mouseenter', 'mouseleave', 'mouseover', 'mouseout',
'mousemove', 'mousedown', 'mouseup', 'click', 'dblclick']
TESTS = 3

# Objects to be used in testing are prepared
def listener(value):
    'Closure of dummy listeners to test binding/unbinding'
    return lambda _: responses.append(value)
target = html.BUTTON('Target', id='Target')

# Listeners of each type are bound then randomly unbound while being tested
for event in EVENT_TYPES:
    responses = []
    listeners = []
    tests = list(range(TESTS))
    for test in tests:
        listeners.append(listener(test))
        target.bind(event, listeners[-1])
    while tests:
        # The event is triggered and the results examined
        target.trigger(event)
        assert responses == tests

        # The results are cleared, one random listener is removed
        responses.clear()
        removed = tests.index(random.choice(tests))
        target.unbind(event, listeners[removed])
        del tests[removed]
        del listeners[removed]

# TODO: new UI elements like slider etc
