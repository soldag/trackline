from collections.abc import Collection, Sequence
import random
import re
from typing import TypeVar


T = TypeVar("T")


def list_or_none(lst: Sequence[T] | None) -> list[T] | None:
    return None if lst is None else list(lst)


def shuffle(seq: Collection[T]) -> list[T]:
    copy = list(seq)
    random.shuffle(copy)
    return copy


def to_snake_case(name):
    name = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    name = re.sub("__([A-Z])", r"_\1", name)
    name = re.sub("([a-z0-9])([A-Z])", r"\1_\2", name)
    return name.lower()
