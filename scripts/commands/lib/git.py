"""
    Miscellaneous utility functions to deal with the git repository
"""
import pathlib

from plumbum import local


GIT = local['git']

_GIT_INDEX = (pathlib.Path(__file__).parent.parent.parent.parent/'.git'/'index').read_bytes()


def in_git(p):
    """
        Returns true if the given path is under version control.
    """
    return str(p).encode('ascii', 'ignore') in _GIT_INDEX


def head_commit_sha():
    """
        Returns the commit id of HEAD
    """
    return str(GIT("show", "--format=%h", "-q", "HEAD")).strip()


def get_releases():
    """
        Returns a list of tags in the repository.
    """
    return [v for v in str(GIT("tag", "-l")).strip().split('\n') if not v == 'stable']


def latest_release():
    """
        Returns the tag of the latest release.
    """
    return get_releases()[-1]

