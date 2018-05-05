# Miscellaneous scripts

This folder contains implementations of command groups of the `manage.py` script in the main Brython directory. To create a new group of commands,
create a file `foo.py` where `foo` is the name of the new group
and then add

```python
from .foo import *
```

to `__init__.py`. This should be enough for `manage.py` to recognize the new group of commands. You can test that the group is correctly recognized by
executing

```bash
$ ./manage.py foo --help
```

which should print the module-level docstring of `foo.py`.

The content of `foo.py` will typically look something like this:

```python
"""
    The commands in the foo group are used for doing bar
"""

from .lib.cli import M, Option, Flag
from .lib.term import status


@M.command()
def bar(
    target: Option('Do bar on the given target', ['-t', '--target']) = "Default Target",
    intense: Flag('Be really intense', ['-i', '--intense'])
):
    """Do bar."""
    status.start_action("Barring" + str(target))
    if not intense:
        status.end_action(message="successfully barred" + str(target))
    else:
        status.end_action(message="too intense", ok=False)


@M.command()
def baz():
    """Does baz."""
    print("Bazzed successfully")
```

Each command in the group should be a python function decorated with the `lib.cli.M.command` decorator.
Any command options/flags should be specified as arguments of the function and be [annotated](https://www.python.org/dev/peps/pep-3107/) using either the `lib.cli.Option` type or `lib.cli.Flag` type.
Unannotated arguments of the function correspond to the command arguments. The function docstring should provide a short explanation of what the command does (it will be printed out, e.g., when executing `./manage.py foo bar --help`).

The lib subdirectory contains some general utilities for use in commands, see the module level documentation of each file for more information.
