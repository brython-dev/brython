/*
This module provides access to operating system functionality that is
standardized by the C Standard and the POSIX standard (a thinly
disguised Unix interface).  Refer to the library manual and
corresponding Unix manual entries for more information on calls.
*/

var $B = __BRYTHON__,
    _b_ = $B.builtins

function _randint(a, b){
    return parseInt(Math.random() * (b - a + 1) + a)
}

var stat_result = $B.make_class("stat_result",
    function(){
        var res = {
            __class__: stat_result,
            st_atime: new Date(),
            st_uid: -1,
            st_gid: -1,
            st_ino: -1,
            st_mode: 0,
            st_size: 1
        };
        ["mtime", "ctime", "atime_ns", "mtime_ns", "ctime_ns"].
            forEach(function(item){
                res["st_" + item] = res.st_atime
            });
        return res
    }
)
$B.set_func_names(stat_result, "posix")

var $module = {
    F_OK: 0,
    O_APPEND: 8,
    O_BINARY: 32768,
    O_CREAT: 256,
    O_EXCL: 1024,
    O_NOINHERIT: 128,
    O_RANDOM: 16,
    O_RDONLY: 0,
    O_RDWR: 2,
    O_SEQUENTIAL: 32,
    O_SHORT_LIVED: 4096,
    O_TEMPORARY: 64,
    O_TEXT: 16384,
    O_TRUNC: 512,
    O_WRONLY: 1,
    P_DETACH: 4,
    P_NOWAIT: 1,
    P_NOWAITO: 3,
    P_OVERLAY: 2,
    P_WAIT: 0,
    R_OK: 4,
    TMP_MAX: 32767,
    W_OK: 2,
    X_OK: 1,
    _have_functions: ['MS_WINDOWS'],
    environ: _b_.dict.$factory(
        [['PYTHONPATH', $B.brython_path],
         ['PYTHONUSERBASE', ' ']]),
    error: _b_.OSError,
    getcwd: function(){return $B.brython_path},
    getpid: function(){return 0},
    lstat: function(){return stat_result.$factory()},
    open: function(path, flags){return _b_.open(path, flags)},
    stat: function(){return stat_result.$factory()},
    urandom: function(n){
        var randbytes = []
        for(var i = 0; i < n; i++){
            randbytes.push(_randint(0, 255))
        }
        return _b_.bytes.$factory(randbytes)
    },
    WTERMSIG: function(){return 0},
    WNOHANG: function(){return _b_.tuple.$factory([0, 0])}
};

["WCOREDUMP", "WIFCONTINUED", "WIFSTOPPED", "WIFSIGNALED", "WIFEXITED"].forEach(function(funcname){
        $module[funcname] = function(){return false}
    });

["WEXITSTATUS", "WSTOPSIG", "WTERMSIG"].
    forEach(function(funcname){
        $module[funcname] = function(){return _b_.None}
    });

["_exit", "_getdiskusage", "_getfileinformation", "_getfinalpathname",
    "_getfullpathname", "_isdir", "abort", "access", "chdir", "chmod",
    "close", "closerange", "device_encoding", "dup", "dup2",
    "execv", "execve", "fsat", "fsync", "get_terminal_size", "getcwdb",
    "getlogin", "getppid", "isatty", "kill", "link", "listdir", "lseek",
    "mkdir", "pipe", "putenv", "read", "readlink", "remove", "rename",
    "replace", "rmdir", "spawnv", "spawnve", "startfile", "stat_float_times",
    "statvfs_result", "strerror", "symlink", "system", "terminal_size",
    "times", "times_result", "umask", "uname_result", "unlink", "utime",
    "waitpid", "write"].forEach(function(funcname){
        $module[funcname] = function(){
            throw _b_.NotImplementedError.$factory("posix." + funcname +
                " is not implemented")
        }
    });
