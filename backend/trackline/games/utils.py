import string

from Levenshtein import ratio
from unidecode import unidecode

from trackline.games.models import Track


def compare_strings(value1: str, value2: str) -> float:
    return ratio(value1, value2, processor=normalize_string)


def normalize_string(value: str) -> str:
    value = " ".join(value.lower().split())
    value = value.translate(str.maketrans("", "", string.punctuation))
    return unidecode(value)


def is_valid_release_year(
    timeline: list[Track], position: int, release_year: int
) -> bool:
    if position == 0:
        min_year = 0
    else:
        min_year = timeline[position - 1].release_year

    if position == len(timeline):
        max_year = float("inf")
    else:
        max_year = timeline[position].release_year

    return min_year <= release_year <= max_year
