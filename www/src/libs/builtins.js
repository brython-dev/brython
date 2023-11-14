(function(){
    var obj = {},
        builtin_names = ['ArithmeticError', 'AssertionError',
            'AttributeError', 'BaseException', 'BaseExceptionGroup',
            'BlockingIOError', 'BrokenPipeError', 'BufferError',
            'BytesWarning', 'ChildProcessError', 'ConnectionAbortedError',
            'ConnectionError', 'ConnectionRefusedError',
            'ConnectionResetError', 'DeprecationWarning', 'EOFError',
            'Ellipsis', 'EncodingWarning', 'EnvironmentError', 'Exception',
            'ExceptionGroup', 'False', 'FileExistsError', 'FileNotFoundError',
            'FloatingPointError', 'FutureWarning', 'GeneratorExit', 'IOError',
            'ImportError', 'ImportWarning', 'IndentationError', 'IndexError',
            'InterruptedError', 'IsADirectoryError', 'KeyError',
            'KeyboardInterrupt', 'LookupError', 'MemoryError',
            'ModuleNotFoundError', 'NameError', 'None', 'NotADirectoryError',
            'NotImplemented', 'NotImplementedError', 'OSError',
            'OverflowError', 'PendingDeprecationWarning', 'PermissionError',
            'ProcessLookupError', 'RecursionError', 'ReferenceError',
            'ResourceWarning', 'RuntimeError', 'RuntimeWarning',
            'StopAsyncIteration', 'StopIteration', 'SyntaxError',
            'SyntaxWarning', 'SystemError', 'SystemExit', 'TabError',
            'TimeoutError', 'True', 'TypeError', 'UnboundLocalError',
            'UnicodeDecodeError', 'UnicodeEncodeError', 'UnicodeError',
            'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning',
            'ValueError', 'Warning', 'WindowsError', 'ZeroDivisionError',
            '_', '__build_class__', '__debug__', '__import__',
            'abs', 'aiter', 'all', 'anext', 'any', 'ascii', 'bin', 'bool',
            'breakpoint', 'bytearray', 'bytes', 'callable', 'chr',
            'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
            'divmod', 'enumerate', 'eval', 'exec', 'exit', 'filter', 'float',
            'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash',
            'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass',
            'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview',
            'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
            'property', 'quit', 'range', 'repr', 'reversed', 'round', 'set',
            'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum',
            'super', 'tuple', 'type', 'vars', 'zip']
    for(var key of builtin_names){
        if(__BRYTHON__.builtins[key] !== undefined){
            obj[key] = __BRYTHON__.builtins[key]
        }
    }
    obj.__doc__ = 'builtins module'
    obj.copyright = 'CPython copyright'
    obj.credits = 'CPython builtins credits'
    obj.license = 'CPython license'
    
    $B.addToImported('builtins', obj)
})()
