import json
import os
import stat
import sys
import binascii

def make(vfs_name, prefix=None):
    """Called by

        python -m brython --make_file_system <vfs_name> <prefix>

    Creates a Virtual File System : a Javascript file with the files in
    current directory and its children.

    The file is stored in current directory as "<vfs_name>.vfs.js".

    A dictionary "files" is created. Keys are the file names, relative to the
    current directory (ie a file "data.txt" in current directory has the key
    "data.txt", and a file "names.txt" in the subdirectory "address" has key
    "address/names.txt").

    If <prefix> was specified, it is prepended to the keys, followed by a /.
    For instance, if prefix is "info", the files above will have keys
    "info/data.txt" and "info/adress/names.txt"

    Python files can be included in such files, but *programs will not be
    able to import them*; for this, use --modules instead.
    """

    files = {}

    this_dir = os.getcwd()
    dest_file = f"{vfs_name}.vfs.js"
    virtual_dir = prefix.split("/") if prefix else []
    print("virtual dir", virtual_dir)

    for dirpath, dirnames, filenames in os.walk(this_dir):
        if dirpath == this_dir:
            path = []
        else:
            path = dirpath[len(this_dir) + len(os.sep):].split(os.sep)
        for filename in filenames:
            if filename.endswith(".vfs.js"):
                continue
            rel_path = "/".join(virtual_dir + path + [filename])
            with open(os.path.join(dirpath, filename), "rb") as f:
                # File content is base64-encoded
                content = binascii.b2a_base64(f.read()).decode('ascii')
                file_stat = os.fstat(f.fileno())
                files[rel_path] = {
                    "content": content,
                    "ctime": file_stat.st_ctime,
                    "mtime": file_stat.st_mtime
                }

    print(list(files))
    with open(dest_file, "w", encoding="utf-8") as out:
        out.write("__BRYTHON__.add_files(")
        json.dump(files, out, indent=4)
        out.write(")")