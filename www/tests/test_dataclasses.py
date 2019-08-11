from dataclasses import dataclass, asdict
from typing import List

@dataclass
class Point:
     x: int
     y: int

@dataclass
class C:
     z: List[Point]

p = Point(10, 20)
assert asdict(p) == {'x': 10, 'y': 20}

c = C([Point(0, 0), Point(10, 4)])
assert asdict(c) == {'z': [{'x': 0, 'y': 0}, {'x': 10, 'y': 4}]}

# issue 1178
# validate only positive numbers
def positive_validator(name, value):
    if value <= 0:
        raise ValueError(f"values for {name!r} have to be positive")

# double whatever comes in
def double_mutator(name, value):
    return int(value) * 2

# custom property to validate, mutate, and call on_{prop name} when fields are updated
class Property:

    count = 0

    def __init__(self, type, validators=(), mutators=()):
        self.type = type
        self.validators = validators
        self.mutators = mutators

    def __set_name__(self, owner, name):
        Property.count += 1
        self.name = name

    def __get__(self, instance, owner):
        if not instance: return self
        return instance.__dict__[self.name]

    def __delete__(self, instance):
        del instance.__dict__[self.name]

    def __set__(self, instance, value):
        if not isinstance(value, self.type):
            raise TypeError(f"{self.name!r} values must be of type {self.type!r}")
        for validator in self.validators:
            validator(self.name, value)
        if self.name in instance.__dict__:
            oldval = instance.__dict__[self.name]
            for mutator in self.mutators:
                value = mutator(self.name, value)
            if value != oldval:
                on_prop = getattr(instance, f'on_{self.name}', None)
                if on_prop:
                    on_prop(self.name, oldval, value)
        instance.__dict__[self.name] = value

@dataclass
class Person:
  name: str = Property(str)
  age: float = Property((int, float), [positive_validator], [double_mutator])

  def on_name(self, *l):
    print('woo')

# check that __set_name__ was called twice (for attributes "name" and "age")
assert Property.count == 2

p = Person('dan', 15)
