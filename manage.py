#!/usr/bin/env python3
from scripts.commands.lib.cli import M
from scripts.commands.lib.info import MANIFEST
from scripts.commands.lib.git import latest_release, head_commit_sha

if __name__ == '__main__':
    M.PROGNAME = 'manage.py'
    M.DESCRIPTION = "Interface to various development tasks (think make install ...)"
    M.VERSION = "0.1 (Brython "+latest_release()+", git sha "+head_commit_sha()+")"
    app = M()
    app.run()


