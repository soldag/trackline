import random
import re
from collections.abc import Iterable


def list_or_none[T](lst: Iterable[T] | None) -> list[T] | None:
    return None if lst is None else list(lst)


def shuffle[T](seq: Iterable[T]) -> list[T]:
    copy = list(seq)
    random.shuffle(copy)
    return copy


def to_snake_case(name: str) -> str:
    name = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    name = re.sub("__([A-Z])", r"_\1", name)
    name = re.sub("([a-z0-9])([A-Z])", r"\1_\2", name)
    return name.lower()
