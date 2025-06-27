import re
import unicodedata

from Levenshtein import ratio
from unidecode import unidecode

from trackline.games.models import Track


def compare_strings(value1: str, value2: str) -> float:
    return ratio(value1, value2, processor=normalize_string)


def normalize_string(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(
        ch for ch in value if not unicodedata.category(ch).startswith(("P", "S", "C"))
    )
    value = re.sub(r"\s+", " ", value)
    value = " ".join(value.lower().split())
    return unidecode(value)


def is_valid_release_year(
    timeline: list[Track],
    position: int,
    release_year: int,
) -> bool:
    min_year = 0 if position == 0 else timeline[position - 1].release_year

    if position == len(timeline):
        max_year = float("inf")
    else:
        max_year = timeline[position].release_year

    return min_year <= release_year <= max_year
