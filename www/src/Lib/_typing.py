# Brython-only

def _idfunc(_, x):
    return x

class TypeVar(_Final, _Immutable, _BoundVarianceMixin, _PickleUsingNameMixin,
              _root=True):
    """Type variable.

    Usage::

      T = TypeVar('T')  # Can be anything
      A = TypeVar('A', str, bytes)  # Must be str or bytes

    Type variables exist primarily for the benefit of static type
    checkers.  They serve as the parameters for generic types as well
    as for generic function definitions.  See class Generic for more
    information on generic types.  Generic functions work as follows:

      def repeat(x: T, n: int) -> List[T]:
          '''Return a list containing n references to x.'''
          return [x]*n

      def longest(x: A, y: A) -> A:
          '''Return the longest of two strings.'''
          return x if len(x) >= len(y) else y

    The latter example's signature is essentially the overloading
    of (str, str) -> str and (bytes, bytes) -> bytes.  Also note
    that if the arguments are instances of some subclass of str,
    the return type is still plain str.

    At runtime, isinstance(x, T) and issubclass(C, T) will raise TypeError.

    Type variables defined with covariant=True or contravariant=True
    can be used to declare covariant or contravariant generic types.
    See PEP 484 for more details. By default generic types are invariant
    in all type variables.

    Type variables can be introspected. e.g.:

      T.__name__ == 'T'
      T.__constraints__ == ()
      T.__covariant__ == False
      T.__contravariant__ = False
      A.__constraints__ == (str, bytes)

    Note that only type variables defined in global scope can be pickled.
    """

    def __init__(self, name, *constraints, bound=None,
                 covariant=False, contravariant=False):
        self.__name__ = name
        super().__init__(bound, covariant, contravariant)
        if constraints and bound is not None:
            raise TypeError("Constraints cannot be combined with bound=...")
        if constraints and len(constraints) == 1:
            raise TypeError("A single constraint is not allowed")
        msg = "TypeVar(name, constraint, ...): constraints must be types."
        self.__constraints__ = tuple(_type_check(t, msg) for t in constraints)
        def_mod = _caller()
        if def_mod != 'typing':
            self.__module__ = def_mod

    def __typing_subst__(self, arg):
        msg = "Parameters to generic types must be types."
        arg = _type_check(arg, msg, is_argument=True)
        if ((isinstance(arg, _GenericAlias) and arg.__origin__ is Unpack) or
            (isinstance(arg, GenericAlias) and getattr(arg, '__unpacked__', False))):
            raise TypeError(f"{arg} is not valid as type argument")
        return arg


class TypeVarTuple(_Final, _Immutable, _PickleUsingNameMixin, _root=True):
    """Type variable tuple.

    Usage:

      Ts = TypeVarTuple('Ts')  # Can be given any name

    Just as a TypeVar (type variable) is a placeholder for a single type,
    a TypeVarTuple is a placeholder for an *arbitrary* number of types. For
    example, if we define a generic class using a TypeVarTuple:

      class C(Generic[*Ts]): ...

    Then we can parameterize that class with an arbitrary number of type
    arguments:

      C[int]       # Fine
      C[int, str]  # Also fine
      C[()]        # Even this is fine

    For more details, see PEP 646.

    Note that only TypeVarTuples defined in global scope can be pickled.
    """

    def __init__(self, name):
        self.__name__ = name

        # Used for pickling.
        def_mod = _caller()
        if def_mod != 'typing':
            self.__module__ = def_mod

    def __iter__(self):
        yield Unpack[self]

    def __repr__(self):
        return self.__name__

    def __typing_subst__(self, arg):
        raise TypeError("Substitution of bare TypeVarTuple is not supported")

    def __typing_prepare_subst__(self, alias, args):
        params = alias.__parameters__
        typevartuple_index = params.index(self)
        for param in params[typevartuple_index + 1:]:
            if isinstance(param, TypeVarTuple):
                raise TypeError(f"More than one TypeVarTuple parameter in {alias}")

        alen = len(args)
        plen = len(params)
        left = typevartuple_index
        right = plen - typevartuple_index - 1
        var_tuple_index = None
        fillarg = None
        for k, arg in enumerate(args):
            if not isinstance(arg, type):
                subargs = getattr(arg, '__typing_unpacked_tuple_args__', None)
                if subargs and len(subargs) == 2 and subargs[-1] is ...:
                    if var_tuple_index is not None:
                        raise TypeError("More than one unpacked arbitrary-length tuple argument")
                    var_tuple_index = k
                    fillarg = subargs[0]
        if var_tuple_index is not None:
            left = min(left, var_tuple_index)
            right = min(right, alen - var_tuple_index - 1)
        elif left + right > alen:
            raise TypeError(f"Too few arguments for {alias};"
                            f" actual {alen}, expected at least {plen-1}")

        return (
            *args[:left],
            *([fillarg]*(typevartuple_index - left)),
            tuple(args[left: alen - right]),
            *([fillarg]*(plen - right - left - typevartuple_index - 1)),
            *args[alen - right:],
        )


class ParamSpecArgs(_Final, _Immutable, _root=True):
    """The args for a ParamSpec object.

    Given a ParamSpec object P, P.args is an instance of ParamSpecArgs.

    ParamSpecArgs objects have a reference back to their ParamSpec:

       P.args.__origin__ is P

    This type is meant for runtime introspection and has no special meaning to
    static type checkers.
    """
    def __init__(self, origin):
        self.__origin__ = origin

    def __repr__(self):
        return f"{self.__origin__.__name__}.args"

    def __eq__(self, other):
        if not isinstance(other, ParamSpecArgs):
            return NotImplemented
        return self.__origin__ == other.__origin__


class ParamSpecKwargs(_Final, _Immutable, _root=True):
    """The kwargs for a ParamSpec object.

    Given a ParamSpec object P, P.kwargs is an instance of ParamSpecKwargs.

    ParamSpecKwargs objects have a reference back to their ParamSpec:

       P.kwargs.__origin__ is P

    This type is meant for runtime introspection and has no special meaning to
    static type checkers.
    """
    def __init__(self, origin):
        self.__origin__ = origin

    def __repr__(self):
        return f"{self.__origin__.__name__}.kwargs"

    def __eq__(self, other):
        if not isinstance(other, ParamSpecKwargs):
            return NotImplemented
        return self.__origin__ == other.__origin__


class ParamSpec(_Final, _Immutable, _BoundVarianceMixin, _PickleUsingNameMixin,
                _root=True):
    """Parameter specification variable.

    Usage::

       P = ParamSpec('P')

    Parameter specification variables exist primarily for the benefit of static
    type checkers.  They are used to forward the parameter types of one
    callable to another callable, a pattern commonly found in higher order
    functions and decorators.  They are only valid when used in ``Concatenate``,
    or as the first argument to ``Callable``, or as parameters for user-defined
    Generics.  See class Generic for more information on generic types.  An
    example for annotating a decorator::

       T = TypeVar('T')
       P = ParamSpec('P')

       def add_logging(f: Callable[P, T]) -> Callable[P, T]:
           '''A type-safe decorator to add logging to a function.'''
           def inner(*args: P.args, **kwargs: P.kwargs) -> T:
               logging.info(f'{f.__name__} was called')
               return f(*args, **kwargs)
           return inner

       @add_logging
       def add_two(x: float, y: float) -> float:
           '''Add two numbers together.'''
           return x + y

    Parameter specification variables can be introspected. e.g.:

       P.__name__ == 'P'

    Note that only parameter specification variables defined in global scope can
    be pickled.
    """

    @property
    def args(self):
        return ParamSpecArgs(self)

    @property
    def kwargs(self):
        return ParamSpecKwargs(self)

    def __init__(self, name, *, bound=None, covariant=False, contravariant=False):
        self.__name__ = name
        super().__init__(bound, covariant, contravariant)
        def_mod = _caller()
        if def_mod != 'typing':
            self.__module__ = def_mod

    def __typing_subst__(self, arg):
        if isinstance(arg, (list, tuple)):
            arg = tuple(_type_check(a, "Expected a type.") for a in arg)
        elif not _is_param_expr(arg):
            raise TypeError(f"Expected a list of types, an ellipsis, "
                            f"ParamSpec, or Concatenate. Got {arg}")
        return arg

    def __typing_prepare_subst__(self, alias, args):
        params = alias.__parameters__
        i = params.index(self)
        if i >= len(args):
            raise TypeError(f"Too few arguments for {alias}")
        # Special case where Z[[int, str, bool]] == Z[int, str, bool] in PEP 612.
        if len(params) == 1 and not _is_param_expr(args[0]):
            assert i == 0
            args = (args,)
        # Convert lists to tuples to help other libraries cache the results.
        elif isinstance(args[i], list):
            args = (*args[:i], tuple(args[i]), *args[i+1:])
        return args

class Generic:
    """Abstract base class for generic types.

    A generic type is typically declared by inheriting from
    this class parameterized with one or more type variables.
    For example, a generic mapping type might be defined as::

      class Mapping(Generic[KT, VT]):
          def __getitem__(self, key: KT) -> VT:
              ...
          # Etc.

    This class can then be used as follows::

      def lookup_name(mapping: Mapping[KT, VT], key: KT, default: VT) -> VT:
          try:
              return mapping[key]
          except KeyError:
              return default
    """
    __slots__ = ()
    _is_protocol = False

    @_tp_cache
    def __class_getitem__(cls, params):
        """Parameterizes a generic class.

        At least, parameterizing a generic class is the *main* thing this method
        does. For example, for some generic class `Foo`, this is called when we
        do `Foo[int]` - there, with `cls=Foo` and `params=int`.

        However, note that this method is also called when defining generic
        classes in the first place with `class Foo(Generic[T]): ...`.
        """
        if not isinstance(params, tuple):
            params = (params,)

        params = tuple(_type_convert(p) for p in params)
        if cls in (Generic, Protocol):
            # Generic and Protocol can only be subscripted with unique type variables.
            if not params:
                raise TypeError(
                    f"Parameter list to {cls.__qualname__}[...] cannot be empty"
                )
            if not all(_is_typevar_like(p) for p in params):
                raise TypeError(
                    f"Parameters to {cls.__name__}[...] must all be type variables "
                    f"or parameter specification variables.")
            if len(set(params)) != len(params):
                raise TypeError(
                    f"Parameters to {cls.__name__}[...] must all be unique")
        else:
            # Subscripting a regular Generic subclass.
            for param in cls.__parameters__:
                prepare = getattr(param, '__typing_prepare_subst__', None)
                if prepare is not None:
                    params = prepare(cls, params)
            _check_generic(cls, params, len(cls.__parameters__))

            new_args = []
            for param, new_arg in zip(cls.__parameters__, params):
                if isinstance(param, TypeVarTuple):
                    new_args.extend(new_arg)
                else:
                    new_args.append(new_arg)
            params = tuple(new_args)

        return _GenericAlias(cls, params,
                             _paramspec_tvars=True)

    def __init_subclass__(cls, *args, **kwargs):
        super().__init_subclass__(*args, **kwargs)
        tvars = []
        if '__orig_bases__' in cls.__dict__:
            error = Generic in cls.__orig_bases__
        else:
            error = (Generic in cls.__bases__ and
                        cls.__name__ != 'Protocol' and
                        type(cls) != _TypedDictMeta)
        if error:
            raise TypeError("Cannot inherit from plain Generic")
        if '__orig_bases__' in cls.__dict__:
            tvars = _collect_parameters(cls.__orig_bases__)
            # Look for Generic[T1, ..., Tn].
            # If found, tvars must be a subset of it.
            # If not found, tvars is it.
            # Also check for and reject plain Generic,
            # and reject multiple Generic[...].
            gvars = None
            for base in cls.__orig_bases__:
                if (isinstance(base, _GenericAlias) and
                        base.__origin__ is Generic):
                    if gvars is not None:
                        raise TypeError(
                            "Cannot inherit from Generic[...] multiple times.")
                    gvars = base.__parameters__
            if gvars is not None:
                tvarset = set(tvars)
                gvarset = set(gvars)
                if not tvarset <= gvarset:
                    s_vars = ', '.join(str(t) for t in tvars if t not in gvarset)
                    s_args = ', '.join(str(g) for g in gvars)
                    raise TypeError(f"Some type variables ({s_vars}) are"
                                    f" not listed in Generic[{s_args}]")
                tvars = gvars
        cls.__parameters__ = tuple(tvars)

class TypeAliasType:
    pass