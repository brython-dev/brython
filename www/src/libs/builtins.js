var $module = (function(){
    var obj = {
        __class__: __BRYTHON__.module,
        __name__: 'builtins'
    },
        builtin_names = ['ArithmeticError', 'AssertionError', 'AttributeError',
    'BaseException', 'BlockingIOError', 'BrokenPipeError', 'BufferError',
    'BytesWarning', 'ChildProcessError', 'ConnectionAbortedError',
    'ConnectionError', 'ConnectionRefusedError', 'ConnectionResetError',
    'DeprecationWarning', 'EncodingWarning', 'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception',
    'False', 'FileExistsError', 'FileNotFoundError', 'FloatingPointError',
    'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError', 'ImportWarning',
    'IndentationError', 'IndexError', 'InterruptedError', 'IsADirectoryError',
    'KeyError', 'KeyboardInterrupt', 'LookupError', 'MemoryError', 'ModuleNotFoundError', 'NameError',
    'None', 'NotADirectoryError', 'NotImplemented', 'NotImplementedError',
    'OSError', 'OverflowError', 'PendingDeprecationWarning', 'PermissionError',
    'ProcessLookupError', 'RecursionError', 'ReferenceError', 'ResourceWarning', 'RuntimeError',
    'RuntimeWarning', 'StopIteration', 'StopAsyncIteration', 'SyntaxError', 'SyntaxWarning',
    'SystemError', 'SystemExit', 'TabError', 'TimeoutError', 'True', 'TypeError',
    'UnboundLocalError', 'UnicodeDecodeError', 'UnicodeEncodeError',
    'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning',
    'ValueError', 'Warning', 'WindowsError', 'ZeroDivisionError', '_',
    '__build_class__', '__debug__', '__doc__', '__import__', '__name__',
    'abs', 'aiter', 'all', 'anext', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray',
    'bytes','callable', 'chr', 'classmethod', 'compile', 'complex', 'copyright',
    'credits','delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec',
    'exit', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals',
    'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance',
    'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'map', 'max',
    'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
    'property', 'quit', 'range', 'repr', 'reversed', 'round', 'set', 'setattr',
    'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type',
    'vars', 'zip',
    '__newobj__' // defined in py_objects.js ; required for pickle
    ]
    for(var i = 0, len = builtin_names.length; i < len; i++){
        try{eval("obj['" + builtin_names[i] + "'] = __BRYTHON__.builtins." +
            builtin_names[i])}
        catch(err){if (__BRYTHON__.$debug) {console.log(err)}}
    }
    obj.__doc__ = 'builtins module'
    obj.copyright = 'CPython copyright'
    obj.credits = 'CPython builtins credits'
    obj.license = 'CPython license'
    return obj
})()
