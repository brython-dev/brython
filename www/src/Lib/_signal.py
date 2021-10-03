"""This module provides mechanisms to use signal handlers in Python.

Functions:

alarm() -- cause SIGALRM after a specified time [Unix only]
setitimer() -- cause a signal (described below) after a specified
               float time and the timer may restart then [Unix only]
getitimer() -- get current value of timer [Unix only]
signal() -- set the action for a given signal
getsignal() -- get the signal action for a given signal
pause() -- wait until a signal arrives [Unix only]
default_int_handler() -- default SIGINT handler

signal constants:
SIG_DFL -- used to refer to the system default handler
SIG_IGN -- used to ignore the signal
NSIG -- number of defined signals
SIGINT, SIGTERM, etc. -- signal numbers

itimer constants:
ITIMER_REAL -- decrements in real time, and delivers SIGALRM upon
               expiration
ITIMER_VIRTUAL -- decrements only when the process is executing,
               and delivers SIGVTALRM upon expiration
ITIMER_PROF -- decrements both when the process is executing and
               when the system is executing on behalf of the process.
               Coupled with ITIMER_VIRTUAL, this timer is usually
               used to profile the time spent by the application
               in user and kernel space. SIGPROF is delivered upon
               expiration.


*** IMPORTANT NOTICE ***
A signal handler function is called with two arguments:
the first is the signal number, the second is the interrupted stack frame."""


CTRL_BREAK_EVENT = 1

CTRL_C_EVENT = 0

NSIG = 23

SIGABRT = 22

SIGBREAK = 21

SIGFPE = 8

SIGILL = 4

SIGINT = 2

SIGSEGV = 11

SIGTERM = 15

SIG_DFL = 0

SIG_IGN = 1

def default_int_handler(*args,**kw):
    """The default handler for SIGINT installed by Python.    
    It raises KeyboardInterrupt."""
    pass

def getsignal(*args,**kw):
    """Return the current action for the given signal.    
    The return value can be:
      SIG_IGN -- if the signal is being ignored
      SIG_DFL -- if the default action for the signal is in effect
      None    -- if an unknown handler is in effect
      anything else -- the callable Python object used as a handler"""
    pass

def raise_signal(*args,**kw):
    """Send a signal to the executing process."""
    pass

def set_wakeup_fd(*args,**kw):
    """set_wakeup_fd(fd, *, warn_on_full_buffer=True) -> fd    
    Sets the fd to be written to (with the signal number) when a signal
    comes in.  A library can use this to wakeup select or poll.
    The previous fd or -1 is returned.
    
    The fd must be non-blocking."""
    pass

def signal(*args,**kw):
    """Set the action for the given signal.    
    The action can be SIG_DFL, SIG_IGN, or a callable Python object.
    The previous action is returned.  See getsignal() for possible return values.
    
    *** IMPORTANT NOTICE ***
    A signal handler function is called with two arguments:
    the first is the signal number, the second is the interrupted stack frame."""
    pass

def strsignal(*args,**kw):
    """Return the system description of the given signal.    
    The return values can be such as "Interrupt", "Segmentation fault", etc.
    Returns None if the signal is not recognized."""
    pass

def valid_signals(*args,**kw):
    """Return a set of valid signal numbers on this platform.    
    The signal numbers returned by this function can be safely passed to
    functions like `pthread_sigmask`."""
    pass
