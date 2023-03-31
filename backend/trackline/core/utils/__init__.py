import random
import re
from typing import Collection, List, TypeVar


def to_snake_case(name):
    name = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    name = re.sub("__([A-Z])", r"_\1", name)
    name = re.sub("([a-z0-9])([A-Z])", r"\1_\2", name)
    return name.lower()


T = TypeVar("T")


def shuffle(seq: Collection[T]) -> List[T]:
    copy = list(seq)
    random.shuffle(copy)
    return copy
