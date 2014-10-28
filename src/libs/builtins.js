var $module = (function(){
    var obj = {__class__:__BRYTHON__.$ModuleDict,__name__:'builtins'}
    var builtin_names = ['ArithmeticError', 'AssertionError', 'AttributeError', 
    'BaseException', 'BlockingIOError', 'BrokenPipeError', 'BufferError', 
    'BytesWarning', 'ChildProcessError', 'ConnectionAbortedError', 
    'ConnectionError', 'ConnectionRefusedError', 'ConnectionResetError', 
    'DeprecationWarning', 'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception', 
    'False', 'FileExistsError', 'FileNotFoundError', 'FloatingPointError', 
    'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError', 'ImportWarning', 
    'IndentationError', 'IndexError', 'InterruptedError', 'IsADirectoryError',
    'KeyError', 'KeyboardInterrupt', 'LookupError', 'MemoryError', 'NameError', 
    'None', 'NotADirectoryError', 'NotImplemented', 'NotImplementedError', 
    'OSError', 'OverflowError', 'PendingDeprecationWarning', 'PermissionError', 
    'ProcessLookupError', 'ReferenceError', 'ResourceWarning', 'RuntimeError', 
    'RuntimeWarning', 'StopIteration', 'SyntaxError', 'SyntaxWarning', 
    'SystemError', 'SystemExit', 'TabError', 'TimeoutError', 'True', 'TypeError', 
    'UnboundLocalError', 'UnicodeDecodeError', 'UnicodeEncodeError', 
    'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning', 
    'ValueError', 'Warning', 'WindowsError', 'ZeroDivisionError', '_', 
    '__build_class__', '__debug__', '__doc__', '__import__', '__name__', 
    '__package__', 'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 
    'bytes','callable', 'chr', 'classmethod', 'compile', 'complex', 'copyright', 
    'credits','delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 
    'exit', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 
    'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 
    'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'map', 'max', 
    'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 
    'property', 'quit', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 
    'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 
    'vars', 'zip']
    for(var i=0, _len_i = builtin_names.length; i < _len_i;i++){
        try{eval("obj['"+builtin_names[i]+"']=__BRYTHON__.builtins."+builtin_names[i])}
        catch(err){if (__BRYTHON__.$debug) {console.log(err)}}
    }
    return obj
})()
