#!/usr/bin/env python
"""Central management point for Brython development
"""
import sys
from pathlib import Path

from mypy.stubgen import generate_stubs, parse_options

import scripts.make_dist

BASE_DIR = Path(__file__).resolve().parent


def gen_stubs():
    """Generate `.pyi` files for Brython"""
    output_dir = BASE_DIR / "brython-stubs"
    search_path = BASE_DIR / "www" / "src" / "Lib"

    opts = ["-o", str(output_dir)]

    # To skip test folder we need to follow modules one by one
    modules = ["browser"]
    for module in modules:
        module_path = search_path / module
        # Create `__init__.py` if does not exist for `genstubs` to work
        if module_path.is_dir():
            init_path = module_path / "__init__.py"
            if not init_path.exists():
                init_path.touch()

        opts.append(str(search_path / module))

    generate_stubs(parse_options(opts))


def assemble():
    scripts.make_dist.run()


if __name__ == "__main__":
    args = sys.argv
    if len(args) == 1:
        print("Options:")
        print("\t --gen-stubs \t generate *.pyi files")
        print("\t --make-dist \t compact all Brython scripts in a single one.")
        sys.exit()

    if "--gen-stubs" in args:
        gen_stubs()

    if "--make-dist" in args:
        assemble()
