# compare Brython stdlib and CPython stdlib
import os
import filecmp
import shutil

bdir = os.path.join(os.path.dirname(os.getcwd()),
    "www", "src", "Lib")

old = "3.13"
new = "3.13"
p_old_dir = rf'c:\Python{old.replace(".", "")}\Lib'
p_new_dir = rf'c:\Python{new.replace(".", "")}\Lib'

force_update = ['argparse.py',
    'base64.py',
    'bdb.py',
    'calendar.py',
    'code.py',
    'codeop.py',
    'configparser.py',
    'copy.py',
    'dataclasses.py',
    'enum.py',
    'fractions.py',
    'functools.py',
    'glob.py',
    'inspect.py',
    'operator.py',
    'pdb.py',
    'pickle.py',
    'symtable.py',
    'traceback.py',
    'typing.py',
    'zipimport.py',
    '_pydatetime.py'
    ]

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
                        print(brython_short, f"same as CPython {old}",
                            f"replace by {new} version")
                        shutil.copyfile(p_new_path, brython_path)
                else:
                    print('***', brython_short, f"same as CPython {old}",
                        f"not in Python {new}")
            else:
                p_new_path = p_new_dir + "\\" + prefix + "\\" + filename
                if os.path.exists(p_new_path):
                    if filecmp.cmp(brython_path, p_new_path, shallow=False):
                        #print(brython_short, "already changed to Python 3.10")
                        pass
                    else:
                        print('***', brython_short, f'not the same as CPython {old}')
                        if brython_short in force_update:
                            print('>>> force update', brython_short)
                            shutil.copyfile(p_new_path, brython_path)
                else:
                    print('***', brython_short, f"not in Python {new}")
        else:
            p_new_path = p_new_dir + "\\" + prefix + "\\" + filename
            if os.path.exists(p_new_path):
                print(ppath, f"not in CPython {old}, but present in {new}")
            else:
                print(ppath, f"not in CPython {old} and {new}")
