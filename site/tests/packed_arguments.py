# unpacking function parameters
args = [3,16,2]
log(range(*args))
log(range(3,16,2))

def parrot(voltage, state='a stiff', action='voom'):
    log("-- This parrot wouldn't", action, end=' ')
    log("if you put", voltage, "volts through it.", end=' ')
    log("E's", state, "!")
d = {"voltage": "four million", "state": "bleedin' demised", "action": "VOOM"}

parrot(**d)