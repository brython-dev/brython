# compare Brython stdlib and CPython stdlib
import os
import filecmp
import shutil

bdir = os.path.join(os.path.dirname(os.getcwd()),
    "www", "src", "Lib")

pdir = r'c:\python37\Lib'
p38dir = r'c:\python38\Lib'

for dirpath, dirnames, filenames in os.walk(bdir):
    if "site-packages" in dirnames:
        dirnames.remove("site-packages")
    prefix = dirpath[len(bdir) + 1:]
    print(prefix)
    for filename in filenames:
        if not filename.endswith(".py"):
            continue
        ppath = pdir + "\\" + prefix + "\\" + filename
        if os.path.exists(ppath):
            if filecmp.cmp(os.path.join(dirpath, filename),
                    ppath, shallow=False):
                print(filename, "same as CPython")
                p38path = p38dir + "\\" + prefix + "\\" + filename
                if os.path.exists(p38path):
                    print("exists in Python 3.8")
                    shutil.copyfile(p38path,
                        os.path.join(dirpath, filename))
                else:
                    print("--- not in Python 3.8 !!!")
                    input()

            else:
                print(filename, "not the same")
        else:
            print(ppath, "not in cpython")
