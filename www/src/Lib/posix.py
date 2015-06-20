"""This module provides access to operating system functionality that is
standardized by the C Standard and the POSIX standard (a thinly
disguised Unix interface).  Refer to the library manual and
corresponding Unix manual entries for more information on calls."""

import datetime

from browser import window

def _randint(a, b):
    return int(window.Math.random()*(b-a+1)+a)
    
F_OK = 0

O_APPEND = 8

O_BINARY = 32768

O_CREAT = 256

O_EXCL = 1024

O_NOINHERIT = 128

O_RANDOM = 16

O_RDONLY = 0

O_RDWR = 2

O_SEQUENTIAL = 32

O_SHORT_LIVED = 4096

O_TEMPORARY = 64

O_TEXT = 16384

O_TRUNC = 512

O_WRONLY = 1

P_DETACH = 4

P_NOWAIT = 1

P_NOWAITO = 3

P_OVERLAY = 2

P_WAIT = 0

R_OK = 4

TMP_MAX = 32767

W_OK = 2

X_OK = 1

class __loader__:
    pass

def _exit(*args,**kw):
    """_exit(status)    
    Exit to the system with specified status, without normal exit processing."""
    pass

def _getdiskusage(*args,**kw):
    """_getdiskusage(path) -> (total, free)    
    Return disk usage statistics about the given path as (total, free) tuple."""
    pass

def _getfileinformation(*args,**kw):
    pass

def _getfinalpathname(*args,**kw):
    pass

def _getfullpathname(*args,**kw):
    pass

_have_functions = ['MS_WINDOWS']

def _isdir(*args,**kw):
    """Return true if the pathname refers to an existing directory."""
    pass

def abort(*args,**kw):
    """abort() -> does not return!    
    Abort the interpreter immediately.  This 'dumps core' or otherwise fails
    in the hardest way possible on the hosting operating system."""
    pass

def access(*args,**kw):
    """access(path, mode, *, dir_fd=None, effective_ids=False, follow_symlinks=True)    
    Use the real uid/gid to test for access to a path.  Returns True if granted,
    False otherwise.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    If effective_ids is True, access will use the effective uid/gid instead of
      the real uid/gid.
    If follow_symlinks is False, and the last element of the path is a symbolic
      link, access will examine the symbolic link itself instead of the file the
      link points to.
    dir_fd, effective_ids, and follow_symlinks may not be implemented
      on your platform.  If they are unavailable, using them will raise a
      NotImplementedError.
    
    Note that most operations will use the effective uid/gid, therefore this
      routine can be used in a suid/sgid environment to test if the invoking user
      has the specified access to the path.
    The mode argument can be F_OK to test existence, or the inclusive-OR
      of R_OK, W_OK, and X_OK."""
    pass

def chdir(*args,**kw):
    """chdir(path)    
    Change the current working directory to the specified path.
    
    path may always be specified as a string.
    On some platforms, path may also be specified as an open file descriptor.
      If this functionality is unavailable, using it raises an exception."""
    pass

def chmod(*args,**kw):
    """chmod(path, mode, *, dir_fd=None, follow_symlinks=True)    
    Change the access permissions of a file.
    
    path may always be specified as a string.
    On some platforms, path may also be specified as an open file descriptor.
      If this functionality is unavailable, using it raises an exception.
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    If follow_symlinks is False, and the last element of the path is a symbolic
      link, chmod will modify the symbolic link itself instead of the file the
      link points to.
    It is an error to use dir_fd or follow_symlinks when specifying path as
      an open file descriptor.
    dir_fd and follow_symlinks may not be implemented on your platform.
      If they are unavailable, using them will raise a NotImplementedError."""
    pass

def close(*args,**kw):
    """close(fd)    
    Close a file descriptor (for low level IO)."""
    pass

def closerange(*args,**kw):
    """closerange(fd_low, fd_high)    
    Closes all file descriptors in [fd_low, fd_high), ignoring errors."""
    pass

def device_encoding(*args,**kw):
    """device_encoding(fd) -> str    
    Return a string describing the encoding of the device
    if the output is a terminal; else return None."""
    pass

def dup(*args,**kw):
    """dup(fd) -> fd2    
    Return a duplicate of a file descriptor."""
    pass

def dup2(*args,**kw):
    """dup2(old_fd, new_fd)    
    Duplicate file descriptor."""
    pass

environ = {'PYTHONUSERBASE': ' '}

error = OSError

def execv(*args,**kw):
    """execv(path, args)    
    Execute an executable path with arguments, replacing current process.
    
        path: path of executable file
        args: tuple or list of strings"""
    pass

def execve(*args,**kw):
    """execve(path, args, env)    
    Execute a path with arguments and environment, replacing current process.
    
        path: path of executable file
        args: tuple or list of arguments
        env: dictionary of strings mapping to strings
    
    On some platforms, you may specify an open file descriptor for path;
      execve will execute the program the file descriptor is open to.
      If this functionality is unavailable, using it raises NotImplementedError."""
    pass

def fstat(*args,**kw):
    """fstat(fd) -> stat result    
    Like stat(), but for an open file descriptor.
    Equivalent to stat(fd=fd)."""
    pass

def fsync(*args,**kw):
    """fsync(fildes)    
    force write of file with filedescriptor to disk."""
    pass

def get_terminal_size(*args,**kw):
    """Return the size of the terminal window as (columns, lines).    
    The optional argument fd (default standard output) specifies
    which file descriptor should be queried.
    
    If the file descriptor is not connected to a terminal, an OSError
    is thrown.
    
    This function will only be defined if an implementation is
    available for this system.
    
    shutil.get_terminal_size is the high-level function which should 
    normally be used, os.get_terminal_size is the low-level implementation."""
    pass

def getcwd(*args,**kw):
    """getcwd() -> path    
    Return a unicode string representing the current working directory."""
    return __BRYTHON__.brython_path # XXX fix me

def getcwdb(*args,**kw):
    """getcwdb() -> path    
    Return a bytes string representing the current working directory."""
    pass

def getlogin(*args,**kw):
    """getlogin() -> string    
    Return the actual login name."""
    pass

def getpid(*args,**kw):
    """getpid() -> pid    
    Return the current process id"""
    return 0

def getppid(*args,**kw):
    """getppid() -> ppid    
    Return the parent's process id.  If the parent process has already exited,
    Windows machines will still return its id; others systems will return the id
    of the 'init' process (1)."""
    pass

def isatty(*args,**kw):
    """isatty(fd) -> bool    
    Return True if the file descriptor 'fd' is an open file descriptor
    connected to the slave end of a terminal."""
    pass

def kill(*args,**kw):
    """kill(pid, sig)    
    Kill a process with a signal."""
    pass

def link(*args,**kw):
    """link(src, dst, *, src_dir_fd=None, dst_dir_fd=None, follow_symlinks=True)    
    Create a hard link to a file.
    
    If either src_dir_fd or dst_dir_fd is not None, it should be a file
      descriptor open to a directory, and the respective path string (src or dst)
      should be relative; the path will then be relative to that directory.
    If follow_symlinks is False, and the last element of src is a symbolic
      link, link will create a link to the symbolic link itself instead of the
      file the link points to.
    src_dir_fd, dst_dir_fd, and follow_symlinks may not be implemented on your
      platform.  If they are unavailable, using them will raise a
      NotImplementedError."""
    pass

def listdir(*args,**kw):
    """listdir(path='.') -> list_of_filenames    
    Return a list containing the names of the files in the directory.
    The list is in arbitrary order.  It does not include the special
    entries '.' and '..' even if they are present in the directory.
    
    path can be specified as either str or bytes.  If path is bytes,
      the filenames returned will also be bytes; in all other circumstances
      the filenames returned will be str.
    On some platforms, path may also be specified as an open file descriptor;
      the file descriptor must refer to a directory.
      If this functionality is unavailable, using it raises NotImplementedError."""
    pass

def lseek(*args,**kw):
    """lseek(fd, pos, how) -> newpos    
    Set the current position of a file descriptor.
    Return the new cursor position in bytes, starting from the beginning."""
    pass

def lstat(*args,**kw):
    """lstat(path, *, dir_fd=None) -> stat result    
    Like stat(), but do not follow symbolic links.
    Equivalent to stat(path, follow_symlinks=False)."""
    return stat_result()

def mkdir(*args,**kw):
    """mkdir(path, mode=0o777, *, dir_fd=None)    
    Create a directory.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError.
    
    The mode argument is ignored on Windows."""
    pass

def open(path, flags, mode=0o777, *args, dir_fd=None):
    """open(path, flags, mode=0o777, *, dir_fd=None)    
    Open a file for low level IO.  Returns a file handle (integer).
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError."""
    
    ## lets assume this is reading/writing to a local storage in the browser
    from browser.local_storage import storage
    
    class mystorage:
      def __init__(self, path, flags):
          self._path=path
          self._pos=0
          self._flags=flags

          if self._flags & O_RDONLY == O_RDONLY:
             self._data=storage.get(self._path, None)
             if self._data is None:
                raise FileNotFoundError("%s not found" % self._path)
          elif self._flags & O_WRONLY == O_WRONLY:
             storage[self._path]=''

      def seek(self, pos):
          self._pos=pos

      def read(self, size=None):
          if size is None:
             _result=self._data[self._pos:]
             self._pos=len(self._data)
             return _result

          assert size <= len(self._data) - self._pos
          _result=self._data[self._pos: self._pos+size]
          self._pos+=size
          return _result

      def write(self, data):
          storage[self._path]+=str(data)

      def close(self):
          pass

    return mystorage(path, flags)

def pipe(*args,**kw):
    """pipe() -> (read_end, write_end)    
    Create a pipe."""
    pass

def putenv(*args,**kw):
    """putenv(key, value)    
    Change or add an environment variable."""
    pass

def read(*args,**kw):
    """read(fd, buffersize) -> string    
    Read a file descriptor."""
    pass

def readlink(*args,**kw):
    """readlink(path, *, dir_fd=None) -> path    
    Return a string representing the path to which the symbolic link points.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError."""
    pass

def remove(*args,**kw):
    """remove(path, *, dir_fd=None)    
    Remove a file (same as unlink()).
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError."""
    pass

def rename(*args,**kw):
    """rename(src, dst, *, src_dir_fd=None, dst_dir_fd=None)    
    Rename a file or directory.
    
    If either src_dir_fd or dst_dir_fd is not None, it should be a file
      descriptor open to a directory, and the respective path string (src or dst)
      should be relative; the path will then be relative to that directory.
    src_dir_fd and dst_dir_fd, may not be implemented on your platform.
      If they are unavailable, using them will raise a NotImplementedError."""
    pass

def replace(*args,**kw):
    """replace(src, dst, *, src_dir_fd=None, dst_dir_fd=None)    
    Rename a file or directory, overwriting the destination.
    
    If either src_dir_fd or dst_dir_fd is not None, it should be a file
      descriptor open to a directory, and the respective path string (src or dst)
      should be relative; the path will then be relative to that directory.
    src_dir_fd and dst_dir_fd, may not be implemented on your platform.
      If they are unavailable, using them will raise a NotImplementedError."""
    pass

def rmdir(*args,**kw):
    """rmdir(path, *, dir_fd=None)    
    Remove a directory.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError."""
    pass

def spawnv(*args,**kw):
    """spawnv(mode, path, args)    
    Execute the program 'path' in a new process.
    
        mode: mode of process creation
        path: path of executable file
        args: tuple or list of strings"""
    pass

def spawnve(*args,**kw):
    """spawnve(mode, path, args, env)    
    Execute the program 'path' in a new process.
    
        mode: mode of process creation
        path: path of executable file
        args: tuple or list of arguments
        env: dictionary of strings mapping to strings"""
    pass

def startfile(*args,**kw):
    """startfile(filepath [, operation]) - Start a file with its associated    application.
    
    When "operation" is not specified or "open", this acts like
    double-clicking the file in Explorer, or giving the file name as an
    argument to the DOS "start" command: the file is opened with whatever
    application (if any) its extension is associated.
    When another "operation" is given, it specifies what should be done with
    the file.  A typical operation is "print".
    
    startfile returns as soon as the associated application is launched.
    There is no option to wait for the application to close, and no way
    to retrieve the application's exit status.
    
    The filepath is relative to the current directory.  If you want to use
    an absolute path, make sure the first character is not a slash ("/");
    the underlying Win32 ShellExecute function doesn't work if it is."""
    pass

def stat(*args,**kw):
    """stat(path, *, dir_fd=None, follow_symlinks=True) -> stat result    
    Perform a stat system call on the given path.
    
    path may be specified as either a string or as an open file descriptor.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
      dir_fd may not be supported on your platform; if it is unavailable, using
      it will raise a NotImplementedError.
    If follow_symlinks is False, and the last element of the path is a symbolic
      link, stat will examine the symbolic link itself instead of the file the
      link points to.
    It is an error to use dir_fd or follow_symlinks when specifying path as
      an open file descriptor."""
    return stat_result()

def stat_float_times(*args,**kw):
    """stat_float_times([newval]) -> oldval    
    Determine whether os.[lf]stat represents time stamps as float objects.
    If newval is True, future calls to stat() return floats, if it is False,
    future calls return ints. 
    If newval is omitted, return the current setting.
    """
    pass

class stat_result:

    def __init__(self):
        """st_mode - protection bits, 
        st_ino - inode number, 
        st_dev - device, 
        st_nlink - number of hard links, 
        st_uid - user id of owner, 
        st_gid - group id of owner, 
        st_size - size of file, in bytes, 
        st_atime - time of most recent access expressed in seconds, 
        st_mtime - time of most recent content modification expressed in 
            seconds, 
        st_ctime - platform dependent; time of most recent metadata change on 
            Unix, or the time of creation on Windows, expressed in seconds 
        st_atime_ns - time of most recent access expressed in nanoseconds as an
             integer, 
        st_mtime_ns - time of most recent content modification expressed in 
            nanoseconds as an integer, 
        st_ctime_ns - platform dependent; time of most recent metadata change 
            on Unix, or the time of creation on Windows, expressed in 
            nanoseconds as an integer """
        # Brython : fake values
        self.st_atime = datetime.datetime.now()
        self.st_mtime = self.st_ctime = self.st_atime_ns = \
            self.st_mtime_ns = self.st_ctime_ns = self.st_atime
        self.st_uid = self.st_gid = self.st_ino = -1
        self.st_mode = 0
        self.st_size = 1

class statvfs_result:
    pass

def strerror(*args,**kw):
    """strerror(code) -> string    
    Translate an error code to a message string."""
    pass

def symlink(*args,**kw):
    """symlink(src, dst, target_is_directory=False, *, dir_fd=None)    
    Create a symbolic link pointing to src named dst.
    
    target_is_directory is required on Windows if the target is to be
      interpreted as a directory.  (On Windows, symlink requires
      Windows 6.0 or greater, and raises a NotImplementedError otherwise.)
      target_is_directory is ignored on non-Windows platforms.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError."""
    pass

def system(*args,**kw):
    """system(command) -> exit_status    
    Execute the command (a string) in a subshell."""
    pass

class terminal_size:
    pass

def times(*args,**kw):
    """times() -> times_result    
    Return an object containing floating point numbers indicating process
    times.  The object behaves like a named tuple with these fields:
      (utime, stime, cutime, cstime, elapsed_time)"""
    pass

class times_result:
    pass

def umask(*args,**kw):
    """umask(new_mask) -> old_mask    
    Set the current numeric umask and return the previous umask."""
    pass

class uname_result:
    pass

def unlink(path, *args, dir_fd=None):
    """unlink(path, *, dir_fd=None)    
    Remove a file (same as remove()).
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    dir_fd may not be implemented on your platform.
      If it is unavailable, using it will raise a NotImplementedError."""
    pass

def urandom(n):
    """urandom(n) -> str    
    Return n random bytes suitable for cryptographic use."""
    randbytes= [_randint(0,255) for i in range(n)]
    return bytes(randbytes)

def utime(*args,**kw):
    """utime(path, times=None, *, ns=None, dir_fd=None, follow_symlinks=True)    Set the access and modified time of path.
    
    path may always be specified as a string.
    On some platforms, path may also be specified as an open file descriptor.
      If this functionality is unavailable, using it raises an exception.
    
    If times is not None, it must be a tuple (atime, mtime);
        atime and mtime should be expressed as float seconds since the epoch.
    If ns is not None, it must be a tuple (atime_ns, mtime_ns);
        atime_ns and mtime_ns should be expressed as integer nanoseconds
        since the epoch.
    If both times and ns are None, utime uses the current time.
    Specifying tuples for both times and ns is an error.
    
    If dir_fd is not None, it should be a file descriptor open to a directory,
      and path should be relative; path will then be relative to that directory.
    If follow_symlinks is False, and the last element of the path is a symbolic
      link, utime will modify the symbolic link itself instead of the file the
      link points to.
    It is an error to use dir_fd or follow_symlinks when specifying path
      as an open file descriptor.
    dir_fd and follow_symlinks may not be available on your platform.
      If they are unavailable, using them will raise a NotImplementedError."""
    pass

def waitpid(*args,**kw):
    """waitpid(pid, options) -> (pid, status << 8)    
    Wait for completion of a given process.  options is ignored on Windows."""
    pass

def write(*args,**kw):
    """write(fd, string) -> byteswritten    
    Write a string to a file descriptor."""
    pass

## put WIFSIGNALED here. its needed by os module, and os module imports all
## functions in this module
def WIFSIGNALED(a):
    return False

def WTERMSIG(status):
    return 0

def WIFSIGNALED(status):
    "Return True if the process exited due to a signal, otherwise return False"
    return False

def WIFEXITED(status):
    return False

def WEXITSTATUS(status):
    pass

def WNOHANG():
    return (0,0)
