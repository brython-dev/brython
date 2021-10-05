# compare Brython stdlib and CPython stdlib
import os
import filecmp
import shutil

bdir = os.path.join(os.path.dirname(os.getcwd()),
    "www", "src", "Lib")

p_old_dir = r'c:\Python39\Lib'
p_new_dir = r'c:\Python310\Lib'

for dirpath, dirnames, filenames in os.walk(bdir):
    if "site-packages" in dirnames:
        dirnames.remove("site-packages")
    prefix = dirpath[len(bdir) + 1:]
    print(prefix)
    for filename in filenames:
        if not filename.endswith(".py"):
            continue
        ppath = p_old_dir + "\\" + prefix + "\\" + filename
        if os.path.exists(ppath):
            brython_path = os.path.join(dirpath, filename)
            brython_short = brython_path[len(bdir) + 1:]
            if filecmp.cmp(brython_path, ppath, shallow=False):
                p_new_path = p_new_dir + "\\" + prefix + "\\" + filename
                if os.path.exists(p_new_path):
                    if filecmp.cmp(brython_path, p_new_path, shallow=False):
                        #print(brython_short, "same as CPython 3.9",
                        #    "not changed in Python 3.10")
                        pass
                    else:
                        print(brython_short, "same as CPython 3.9",
                            "replace by 3.10 version")
                        shutil.copyfile(p_new_path, brython_path)
                else:
                    print('***', brython_short, "same as CPython 3.9",
                        "not in Python 3.10")
            else:
                p_new_path = p_new_dir + "\\" + prefix + "\\" + filename
                if os.path.exists(p_new_path):
                    if filecmp.cmp(brython_path, p_new_path, shallow=False):
                        #print(brython_short, "already changed to Python 3.10")
                        pass
                    else:
                        print('***', brython_short, 'not the same as CPython 3.9')
                else:
                    print('***', brython_short, "not in Python 3.10")
        else:
            p_new_path = p_new_dir + "\\" + prefix + "\\" + filename
            if os.path.exists(p_new_path):
                print(ppath, "not in CPython 3.9, but present in 3.10")
            else:
                print(ppath, "not in CPython 3.9 and 3.10")
