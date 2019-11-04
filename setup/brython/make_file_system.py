import json
import os
import sys
import binascii

def make(vfs_name):

    files = {}

    this_dir = os.getcwd()
    dest_file = f"{vfs_name}.vfs.js"
    virtual_dir = vfs_name.split("/") if vfs_name else []
    print("virtual dir", virtual_dir)

    for dirpath, dirnames, filenames in os.walk(this_dir):
        del dirnames[:]
        if dirpath == this_dir:
            path = []
        else:
            path = dirpath[len(this_dir) + len(os.sep):].split(os.sep)
        for filename in filenames:
            if filename.endswith(".vfs.js"):
                # avoid recursion
                continue
            rel_path = "/".join(virtual_dir + path + [filename])
            with open(os.path.join(dirpath, filename), "rb") as f:
                files[rel_path] = binascii.b2a_base64(f.read()).decode('ascii')
                print(rel_path, type(files[rel_path]))

    print(list(files))
    with open(dest_file, "w", encoding="utf-8") as out:
        out.write("__BRYTHON__.add_files(")
        json.dump(files, out, indent=4)
        out.write(")")