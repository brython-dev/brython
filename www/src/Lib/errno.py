"""This module makes available standard errno system symbols.

The value of each symbol is the corresponding integer value,
e.g., on most systems, errno.ENOENT equals the integer 2.

The dictionary errno.errorcode maps numeric codes to symbol names,
e.g., errno.errorcode[2] could be the string 'ENOENT'.

Symbols that are not relevant to the underlying system are not defined.

To map error codes to error messages, use the function os.strerror(),
e.g. os.strerror(2) could return 'No such file or directory'."""


E2BIG = 7

EACCES = 13

EADDRINUSE = 10048

EADDRNOTAVAIL = 10049

EAFNOSUPPORT = 10047

EAGAIN = 11

EALREADY = 10037

EBADF = 9

EBADMSG = 104

EBUSY = 16

ECANCELED = 105

ECHILD = 10

ECONNABORTED = 10053

ECONNREFUSED = 10061

ECONNRESET = 10054

EDEADLK = 36

EDEADLOCK = 36

EDESTADDRREQ = 10039

EDOM = 33

EDQUOT = 10069

EEXIST = 17

EFAULT = 14

EFBIG = 27

EHOSTDOWN = 10064

EHOSTUNREACH = 10065

EIDRM = 111

EILSEQ = 42

EINPROGRESS = 10036

EINTR = 4

EINVAL = 22

EIO = 5

EISCONN = 10056

EISDIR = 21

ELOOP = 10062

EMFILE = 24

EMLINK = 31

EMSGSIZE = 10040

ENAMETOOLONG = 38

ENETDOWN = 10050

ENETRESET = 10052

ENETUNREACH = 10051

ENFILE = 23

ENOBUFS = 10055

ENODATA = 120

ENODEV = 19

ENOENT = 2

ENOEXEC = 8

ENOLCK = 39

ENOLINK = 121

ENOMEM = 12

ENOMSG = 122

ENOPROTOOPT = 10042

ENOSPC = 28

ENOSR = 124

ENOSTR = 125

ENOSYS = 40

ENOTCONN = 10057

ENOTDIR = 20

ENOTEMPTY = 41

ENOTRECOVERABLE = 127

ENOTSOCK = 10038

ENOTSUP = 129

ENOTTY = 25

ENXIO = 6

EOPNOTSUPP = 10045

EOVERFLOW = 132

EOWNERDEAD = 133

EPERM = 1

EPFNOSUPPORT = 10046

EPIPE = 32

EPROTO = 134

EPROTONOSUPPORT = 10043

EPROTOTYPE = 10041

ERANGE = 34

EREMOTE = 10071

EROFS = 30

ESHUTDOWN = 10058

ESOCKTNOSUPPORT = 10044

ESPIPE = 29

ESRCH = 3

ESTALE = 10070

ETIME = 137

ETIMEDOUT = 10060

ETOOMANYREFS = 10059

ETXTBSY = 139

EUSERS = 10068

EWOULDBLOCK = 10035

EXDEV = 18

WSABASEERR = 10000

WSAEACCES = 10013

WSAEADDRINUSE = 10048

WSAEADDRNOTAVAIL = 10049

WSAEAFNOSUPPORT = 10047

WSAEALREADY = 10037

WSAEBADF = 10009

WSAECONNABORTED = 10053

WSAECONNREFUSED = 10061

WSAECONNRESET = 10054

WSAEDESTADDRREQ = 10039

WSAEDISCON = 10101

WSAEDQUOT = 10069

WSAEFAULT = 10014

WSAEHOSTDOWN = 10064

WSAEHOSTUNREACH = 10065

WSAEINPROGRESS = 10036

WSAEINTR = 10004

WSAEINVAL = 10022

WSAEISCONN = 10056

WSAELOOP = 10062

WSAEMFILE = 10024

WSAEMSGSIZE = 10040

WSAENAMETOOLONG = 10063

WSAENETDOWN = 10050

WSAENETRESET = 10052

WSAENETUNREACH = 10051

WSAENOBUFS = 10055

WSAENOPROTOOPT = 10042

WSAENOTCONN = 10057

WSAENOTEMPTY = 10066

WSAENOTSOCK = 10038

WSAEOPNOTSUPP = 10045

WSAEPFNOSUPPORT = 10046

WSAEPROCLIM = 10067

WSAEPROTONOSUPPORT = 10043

WSAEPROTOTYPE = 10041

WSAEREMOTE = 10071

WSAESHUTDOWN = 10058

WSAESOCKTNOSUPPORT = 10044

WSAESTALE = 10070

WSAETIMEDOUT = 10060

WSAETOOMANYREFS = 10059

WSAEUSERS = 10068

WSAEWOULDBLOCK = 10035

WSANOTINITIALISED = 10093

WSASYSNOTREADY = 10091

WSAVERNOTSUPPORTED = 10092

class __loader__(object):
    """Meta path import for built-in modules.

        All methods are either class or static methods to avoid the need to
        instantiate the class.

        """


    __delattr__ = "<slot wrapper '__delattr__' of 'object' objects>"

    __dict__ = "{'__module__': '_frozen_importlib', '__doc__': 'Meta path import for built-in modules.\n\n    All methods are either class or static methods to avoid the need to\n    instantiate the class.\n\n    ', 'module_repr': <staticmethod object at 0x00000153E1934208>, 'find_spec': <classmethod object at 0x00000153E1934240>, 'find_module': <classmethod object at 0x00000153E1934278>, 'create_module': <classmethod object at 0x00000153E19342B0>, 'exec_module': <classmethod object at 0x00000153E19342E8>, 'get_code': <classmethod object at 0x00000153E1934358>, 'get_source': <classmethod object at 0x00000153E19343C8>, 'is_package': <classmethod object at 0x00000153E1934438>, 'load_module': <classmethod object at 0x00000153E1934470>, '__dict__': <attribute '__dict__' of 'BuiltinImporter' objects>, '__weakref__': <attribute '__weakref__' of 'BuiltinImporter' objects>}"

    __dir__ = "<method '__dir__' of 'object' objects>"

    __eq__ = "<slot wrapper '__eq__' of 'object' objects>"

    __format__ = "<method '__format__' of 'object' objects>"

    __ge__ = "<slot wrapper '__ge__' of 'object' objects>"

    __getattribute__ = "<slot wrapper '__getattribute__' of 'object' objects>"

    __gt__ = "<slot wrapper '__gt__' of 'object' objects>"

    __hash__ = "<slot wrapper '__hash__' of 'object' objects>"

    __init__ = "<slot wrapper '__init__' of 'object' objects>"

    def __init_subclass__(*args,**kw):
        """This method is called when a class is subclassed.
        The default implementation does nothing. It may be
        overridden to extend subclasses.
        """
        pass

    __le__ = "<slot wrapper '__le__' of 'object' objects>"

    __lt__ = "<slot wrapper '__lt__' of 'object' objects>"

    __module__ = """_frozen_importlib"""

    __ne__ = "<slot wrapper '__ne__' of 'object' objects>"

    def __new__(*args,**kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        pass

    __reduce__ = "<method '__reduce__' of 'object' objects>"

    __reduce_ex__ = "<method '__reduce_ex__' of 'object' objects>"

    __repr__ = "<slot wrapper '__repr__' of 'object' objects>"

    __setattr__ = "<slot wrapper '__setattr__' of 'object' objects>"

    __sizeof__ = "<method '__sizeof__' of 'object' objects>"

    __str__ = "<slot wrapper '__str__' of 'object' objects>"

    def __subclasshook__(*args,**kw):
        """Abstract classes can override this to customize issubclass().
        This is invoked early on by abc.ABCMeta.__subclasscheck__().
        It should return True, False or NotImplemented.  If it returns
        NotImplemented, the normal algorithm is used.  Otherwise, it
        overrides the normal algorithm (and the outcome is cached).
        """
        pass

    __weakref__ = "<attribute '__weakref__' of 'BuiltinImporter' objects>"

    create_module = "<bound method BuiltinImporter.create_module of <class '_frozen_importlib.BuiltinImporter'>>"

    exec_module = "<bound method BuiltinImporter.exec_module of <class '_frozen_importlib.BuiltinImporter'>>"

    find_module = "<bound method BuiltinImporter.find_module of <class '_frozen_importlib.BuiltinImporter'>>"

    find_spec = "<bound method BuiltinImporter.find_spec of <class '_frozen_importlib.BuiltinImporter'>>"

    get_code = "<bound method BuiltinImporter.get_code of <class '_frozen_importlib.BuiltinImporter'>>"

    get_source = "<bound method BuiltinImporter.get_source of <class '_frozen_importlib.BuiltinImporter'>>"

    is_package = "<bound method BuiltinImporter.is_package of <class '_frozen_importlib.BuiltinImporter'>>"

    load_module = "<bound method _load_module_shim of <class '_frozen_importlib.BuiltinImporter'>>"

    def module_repr(*args,**kw):
        """Return repr for the module.
                The method is deprecated.  The import machinery does the job itself.

                """
        pass
__spec__ = "ModuleSpec(name='errno', loader=<class '_frozen_importlib.BuiltinImporter'>, origin='built-in')"

errorcode = {v:k for (k, v) in globals().items() if k == k.upper()}
