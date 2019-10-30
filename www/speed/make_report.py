import time
import sys
import traceback

from browser import document, window, ajax
import javascript

def forward(req):
    cpython_time = float(req.text)
    results[-1]['CPython'] = cpython_time
    test_next()

def run_cpython(script_name, next_step):
    """Send an async POST Ajax call to run the CPython script.
    next_step is the function called when the Ajax call is complete.
    """
    ajax.post('/time_cpython',
        oncomplete=next_step,
        data=script_name,
        timeout=4)

def execute(option, src, callback):
    script_name = option.value
    pos = src.find("JS_CODE")
    if pos > -1:
        src = src[:pos]
    result = {
        "test": script_name.split("/")[-1],
        "description": option.text,
        "src": src.strip()
        }

    t0 = time.perf_counter()

    try:
        exec(src, {})
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0

    brython_time = (time.perf_counter() - t0) * 1000.0
    result['Brython'] = brython_time

    results.append(result)

    run_cpython(script_name, callback)

def test_next():
    global script_num, failed
    script_num += 1
    options = document['files'].options

    if script_num < len(options):

        option = document['files'].options[script_num]
        script_name = option.value

        src = open(option.value).read()
        document['files'].selectedIndex = script_num

        execute(option, src, forward)

    else:
        info = sys.implementation.version
        version = f"{info.major}.{info.minor}.{info.micro}"

        ajax.post("/cgi-bin/store_speed.py",
            data={
                "results": javascript.JSON.stringify(results),
                "version": version,
                "userAgent": window.navigator.userAgent
            })

script_num = -1
t_start = time.time()
failed = []
results = []

# run whole test suite
test_next()
