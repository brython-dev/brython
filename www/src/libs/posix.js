/*
This module provides access to operating system functionality that is
standardized by the C Standard and the POSIX standard (a thinly
disguised Unix interface).  Refer to the library manual and
corresponding Unix manual entries for more information on calls.
*/
"use strict";
var $B = __BRYTHON__,
    _b_ = $B.builtins

function _randint(a, b){
    return parseInt(Math.random() * (b - a + 1) + a)
}

var stat_result = $B.make_type("stat_result")

stat_result.$factory = function(filename){
    filename = _b_.str.$factory(filename)
    if($B.file_cache && $B.file_cache.hasOwnProperty(filename)){
        var f = $B.file_cache[filename],
            res = {
                ob_type: stat_result,
                st_atime: __BRYTHON__.timestamp,
                st_ctime: f.ctime,
                st_mtime: f.mtime,
                st_uid: -1,
                st_gid: -1,
                st_ino: -1,
                st_mode: 0,
                st_size: f.length
            };
            ["mtime", "ctime", "atime_ns", "mtime_ns", "ctime_ns"].
                forEach(function(item){
                    res["st_" + item] = res.st_atime
                });
        return res
    }else if($B.files && $B.files.hasOwnProperty(filename)){
        var f = $B.files[filename],
            res = {
                ob_type: stat_result,
                st_atime: __BRYTHON__.timestamp,
                st_ctime: f.ctime,
                st_mtime: f.mtime,
                st_uid: -1,
                st_gid: -1,
                st_ino: -1,
                st_mode: 0,
                st_size: f.content.length
            };
        for(var item of ["mtime", "ctime", "atime_ns", "mtime_ns", "ctime_ns"]){
            res["st_" + item] = res.st_atime
        }
        return res

    }else{
        $B.RAISE(_b_.OSError, 'no information available for file ' +
            filename)
    }
}

$B.set_func_names(stat_result, "posix")
$B.finalize_type(stat_result)

var module = {
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
    _have_functions: $B.$list(['MS_WINDOWS']),
    environ: _b_.dict.$from_array(
        [['PYTHONPATH', $B.brython_path],
         ['PYTHONUSERBASE', ' ']]),
    error: _b_.OSError,
    fspath: function(path){
        return path
    },
    getcwd: function(){
        return $B.brython_path
    },
    getpid: function(){
        return 0
    },
    lstat: function(filename){
        return stat_result.$factory(filename)
    },
    open: function(path, flags){
        $B.RAISE(_b_.NotImplementedError, 'os.open is not implemented')
    },
    remove: function(path) {
        var $ = $B.args("remove", 1, { path: null }, ["path"], arguments, {}, null, null)
        console.log($)

        var path = $.path
        var found_file = false

        if ($B.file_cache && $B.file_cache.hasOwnProperty(path)){
            delete $B.file_cache[path]
            found_file = true
        }
        if ($B.files && $B.files.hasOwnProperty(path)){
            delete $B.files[path]
            found_file = true
        }

        if(!found_file) {
            $B.RAISE(_b_.FileNotFoundError, `No such file or directory: '${path}'`)
        }

        return _b_.None
    },
    stat: function(filename){
        return stat_result.$factory(filename)
    },
    stat_result: function(filename){
        return stat_result.$factory(filename)
    },
    urandom: function(n){
        const randbytes = new Uint8Array(n);
        crypto.getRandomValues(randbytes);
        return _b_.bytes.$factory(Array.from(randbytes));
    },
    WTERMSIG: function(){
        return 0
    },
    WNOHANG: function(){
        return _b_.tuple.$factory([0, 0])
    }
};

["WCOREDUMP", "WIFCONTINUED", "WIFSTOPPED", "WIFSIGNALED", "WIFEXITED"].forEach(function(funcname){
        module[funcname] = function(){return false}
    });

["WEXITSTATUS", "WSTOPSIG", "WTERMSIG"].
    forEach(function(funcname){
        module[funcname] = function(){return _b_.None}
    });

["_exit", "_getdiskusage", "_getfileinformation", "_getfinalpathname",
    "_getfullpathname", "_isdir", "abort", "access", "chdir", "chmod",
    "close", "closerange", "device_encoding", "dup", "dup2",
    "execv", "execve", "fsat", "fsync", "get_terminal_size", "getcwdb",
    "getlogin", "getppid", "kill", "link", "listdir", "lseek",
    "mkdir", "pipe", "putenv", "read", "readlink", "rename",
    "replace", "rmdir", "spawnv", "spawnve", "startfile", "stat_float_times",
    "statvfs_result", "strerror", "symlink", "system", "terminal_size",
    "times", "times_result", "umask", "uname_result", "unlink", "utime",
    "waitpid", "write"].forEach(function(funcname){
        module[funcname] = function(){
            $B.RAISE(_b_.NotImplementedError, "posix." + funcname +
                " is not implemented")
        }
    });

module.isatty = function(){
    return false
}

$B.addToImported('posix', module)