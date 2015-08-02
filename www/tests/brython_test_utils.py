
import time, traceback

def run(src, in_globals=False):
    t0 = time.perf_counter()
    try:
        if(in_globals):
            exec(src)
        else:
            ns = {}
            exec(src, ns)
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    t1 = time.perf_counter()
    return state, t0, t1



