# Copyright 2007 Google, Inc. All Rights Reserved.
# Licensed to PSF under a Contributor Agreement.

"""Abstract Base Classes (ABCs) for collections, according to PEP 3119.

DON'T USE THIS MODULE DIRECTLY!  The classes here should be imported
via collections; they are defined here only to alleviate certain
bootstrapping issues.  Unit tests are in test_collections.
"""

from abc import ABCMeta, abstractmethod
import sys

__all__ = ["Hashable", "Iterable", "Iterator",
           "Sized", "Container", "Callable",
           "Set", "MutableSet",
           "Mapping", "MutableMapping",
           "MappingView", "KeysView", "ItemsView", "ValuesView",
           "Sequence", "MutableSequence",
           "ByteString",
           ]

"""
### collection related types which are not exposed through builtin ###
## iterators ##
#fixme brython
#bytes_iterator = type(iter(b''))
bytes_iterator = type(iter(''))
#fixme brython
#bytearray_iterator = type(iter(bytearray()))
#callable_iterator = ???
dict_keyiterator = type(iter({}.keys()))
dict_valueiterator = type(iter({}.values()))
dict_itemiterator = type(iter({}.items()))
list_iterator = type(iter([]))
list_reverseiterator = type(iter(reversed([])))
range_iterator = type(iter(range(0)))
set_iterator = type(iter(set()))
str_iterator = type(iter(""))
tuple_iterator = type(iter(()))
zip_iterator = type(iter(zip()))
## views ##
dict_keys = type({}.keys())
dict_values = type({}.values())
dict_items = type({}.items())
## misc ##
dict_proxy = type(type.__dict__)
"""

def abstractmethod(self):
    return self

### ONE-TRICK PONIES ###


#class Iterable(metaclass=ABCMeta):
class Iterable:

    @abstractmethod
    def __iter__(self):
        while False:
            yield None

    @classmethod
    def __subclasshook__(cls, C):
        if cls is Iterable:
            if any("__iter__" in B.__dict__ for B in C.__mro__):
                return True
        return NotImplemented


#class Sized(metaclass=ABCMeta):
class Sized:

    @abstractmethod
    def __len__(self):
        return 0

    @classmethod
    def __subclasshook__(cls, C):
        if cls is Sized:
            if any("__len__" in B.__dict__ for B in C.__mro__):
                return True
        return NotImplemented


#class Container(metaclass=ABCMeta):
class Container:

    @abstractmethod
    def __contains__(self, x):
        return False

    @classmethod
    def __subclasshook__(cls, C):
        if cls is Container:
            if any("__contains__" in B.__dict__ for B in C.__mro__):
                return True
        return NotImplemented

### MAPPINGS ###


class Mapping(Sized, Iterable, Container):

    @abstractmethod
    def __getitem__(self, key):
        raise KeyError

    def get(self, key, default=None):
        try:
            return self[key]
        except KeyError:
            return default

    def __contains__(self, key):
        try:
            self[key]
        except KeyError:
            return False
        else:
            return True

    def keys(self):
        return KeysView(self)

    def items(self):
        return ItemsView(self)

    def values(self):
        return ValuesView(self)

    def __eq__(self, other):
        if not isinstance(other, Mapping):
            return NotImplemented
        return dict(self.items()) == dict(other.items())

    def __ne__(self, other):
        return not (self == other)


class MutableMapping(Mapping):

    @abstractmethod
    def __setitem__(self, key, value):
        raise KeyError

    @abstractmethod
    def __delitem__(self, key):
        raise KeyError

    __marker = object()

    def pop(self, key, default=__marker):
        try:
            value = self[key]
        except KeyError:
            if default is self.__marker:
                raise
            return default
        else:
            del self[key]
            return value

    def popitem(self):
        try:
            key = next(iter(self))
        except StopIteration:
            raise KeyError
        value = self[key]
        del self[key]
        return key, value

    def clear(self):
        try:
            while True:
                self.popitem()
        except KeyError:
            pass

    def update(*args, **kwds):
        if len(args) > 2:
            raise TypeError("update() takes at most 2 positional "
                            "arguments ({} given)".format(len(args)))
        elif not args:
            raise TypeError("update() takes at least 1 argument (0 given)")
        self = args[0]
        other = args[1] if len(args) >= 2 else ()

        if isinstance(other, Mapping):
            for key in other:
                self[key] = other[key]
        elif hasattr(other, "keys"):
            for key in other.keys():
                self[key] = other[key]
        else:
            for key, value in other:
                self[key] = value
        for key, value in kwds.items():
            self[key] = value

    def setdefault(self, key, default=None):
        try:
            return self[key]
        except KeyError:
            self[key] = default
        return default

#MutableMapping.register(dict)
