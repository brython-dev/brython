"""
    Commands used on CI (Travis, ...)
"""
import pathlib
import sys

from plumbum import local

from .lib.cli import M
from .lib.term import status


TAR_FILE = 'phantomjs-2.1.1-linux-x86_64.tar.bz2'
PHANTOMJS_URL = "https://bitbucket.org/ariya/phantomjs/downloads/"+TAR_FILE
PHANTOMJS_DIR = pathlib.Path(__file__).parent.parent.parent / 'travis_phantomjs'


@M.command()
def get_phantomjs():
    """Download PhantomJS if not already present."""
    status.start_action("Ensuring Phantomjs")
    if not (PHANTOMJS_DIR / 'phantomjs-2.1.1-linux-x86_64/bin/phantomjs').exists():
        PHANTOMJS_DIR.mkdir(parents=True, exists_ok=True)

        tar_file = str(p.parent.parent)+'.tar.bz2'
        p.parent.parent.parent.mkdir()
        status.update("downloading PhantomJS")
        local['wget'](PHANTOMJS_URL, '-O', str(PHANTOMJS_DIR / TAR_FILE))
        status.update("unpacking PhantomJS")
        local['tar']('-xvf', str(PHANTOMJS_DIR / TAR_FILE), '-C', PHANTOMJS_DIR)
        status.end_action(message='successfuly downloaded')
    else:
        status.end_action(message='already present')


@M.command()
def get_testem():
    """Install the testem javascript testing library"""
    try:
        local['npm']('install', 'testem')
    except:
        status.error("Unable to install testem (is npm installed and on your path?).")


@M.command()
def run_tests():
    """Run CI tests using testem."""
    if not pathlib.Path('./node_modules/.bin/testem').exists():
        status.error("Please install testem (./manage.py ci get_testem)")
    else:
        local['./node_modules/.bin/testem']('--skip', 'PhantomJS', '-t', 'www/tests/qunit/run_tests.html', 'ci', stdout=sys.stdout, stderr=sys.stderr)
