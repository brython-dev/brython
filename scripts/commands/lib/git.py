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


def _next_rel(rel):
    if rel is None:
        return 'dev'
    elif rel == 'dev':
        return 'alpha'
    elif rel == 'alpha':
        return 'beta'
    elif rel == 'beta':
        return 'rc'
    elif rel == 'rc':
        return None


def next_version(rel, step='minor'):
    p, major, minor, rel, rel_v = rel.strip().split('.')+[None, None]

    if 'rc' in minor:
        minor, rel, rel_v = ['rc'] + minor.split('rc')
    elif 'beta' in minor:
        minor, rel, rel_v = ['beta'] + minor.split('beta')
    elif 'alpha' in minor:
        minor, rel, rel_v = ['alpha'] + minor.split('alpha')
    elif 'dev' in minor:
        minor, rel, rel_v = ['dev'] + minor.split('dev')

    if step == 'major':
        return int(p), int(major)+1, 0, None, None
    elif step == 'minor':
        return int(p), int(major), int(minor)+1, None, None
    elif step == 'rel':
        if rel is None or rel == 'dev':
            return int(p), int(major)+1, 0, 'alpha', 0
        else:
            return int(p), int(major), int(minor), _next_rel(rel), 0
    elif step == 'rc':
            return int(p), int(major), int(minor), rel, int(rel_v)+1
    else:
        if rel_v is not None:
            rel_v = int(rel_v)
        return int(p), int(major), int(minor), rel, rel_v


def version():
    """
        Returns the current version (for populating the implementation key
        of manifest.json)
    """
    rel = latest_release()
    cp, cmaj, cmin, crel, crel_v = next_version(rel, step='current')
    if crel is not None:
        return next_version(rel, step='rc')
    else:
        cp, cmaj, cmin, _, _ = next_version(rel, step='minor')
        crel, crel_v = 'dev', head_commit_sha()
        return cp, cmaj, cmin, crel, crel_v


def version_string(ver):
    return '.'.join(str(x) for x in ver[:3])+str(ver[3])+str(ver[4])


def is_clean():
    """
        Returns true if there are no uncommitted changes in the repo.
    """

    if str(GIT("status", "--porcelain", "--untracked-files=no")).strip():
        return False
    return True

