import importlib
import inspect

from plumbum import cli


class Param:
    def __init__(self, doc='', names=[]):
        self._names = names
        self._doc = doc


class Flag:
    def __init__(self, doc='', names=[]):
        self._names = names
        self._doc = doc


class M(cli.Application):
    subcommands = {}

    @classmethod
    def print_commands(cls, root=None, indent=0):
        if root is None:
            root = cls.subcommands
        for name, (app, sub_cmds) in root.items():
            print(" "*indent, "Name:", name, "App:", app._NAME)
            cls.print_commands(root=sub_cmds, indent=indent+2)

    @classmethod
    def command(cls, name=None):
        postfix = name
        def decorator(method):
            if postfix is None:
                name = method.__name__
            else:
                name = postfix
            mod = method.__module__
            if mod.startswith('scripts.commands'):
                mod = mod[len('scripts.commands'):]
                mod = mod.lstrip('.')
            if mod == '__main__':
                full_name = name
            else:
                full_name = mod+'.'+name

            app = cls
            subcmds = cls.subcommands
            for sub in full_name.split('.')[:-1]:
                if sub not in subcmds:
                    sub_app = type(sub+'App', (cli.Application,),{})
                    sub_app = app.subcommand(sub)(sub_app)
                    subcmds[sub] = (sub_app, {})
                else:
                    pass

                app, subcmds = subcmds[sub]
            app.__doc__ = importlib.import_module(method.__module__).__doc__

            signature = inspect.signature(method)
            arguments = []
            for (arg_name, param) in signature.parameters.items():
                tp = param.annotation
                if isinstance(tp, Param) or isinstance(tp, Flag):
                    if tp._names:
                        names = tp._names
                    else:
                        names = ['-'+arg_name[0], '--'+arg_name]
                    arguments.append([tp, arg_name, names, param.default, tp._doc])

            def main(self, *args):
                kw_args = {}
                for tp, name, _, _, _ in arguments:
                    kw_args[name] = getattr(self, name)
                method(*args, **kw_args)

            newclass = type(name+'App', (cli.Application,), {"main": main})
            newclass.__doc__ = method.__doc__
            newclass = app.subcommand(name)(newclass)

            for tp, name, names, default, doc in arguments:
                if isinstance(tp, Param):
                    setattr(newclass, name, cli.SwitchAttr(names, default=default, help=doc))
                elif isinstance(tp, Flag):
                    setattr(newclass, name, cli.Flag(names, help=doc))
            return method

        return decorator
