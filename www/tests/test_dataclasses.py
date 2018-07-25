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