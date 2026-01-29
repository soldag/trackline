import re
import unicodedata
from collections.abc import Iterable

from Levenshtein import ratio
from unidecode import unidecode

from trackline.games.models import Track


def compare_strings(
    value1: str, value2: str, stop_words: Iterable[str] | None = None
) -> float:
    def processor(value: str) -> str:
        return normalize_string(value, stop_words=stop_words)

    return ratio(value1, value2, processor=processor)


def normalize_string(value: str, stop_words: Iterable[str] | None = None) -> str:
    # Normalize unicode (decompose accents, compatibility chars, etc.)
    value = unicodedata.normalize("NFKD", value)

    # Remove punctuation and control characters
    value = "".join(
        ch for ch in value if not unicodedata.category(ch).startswith(("P", "C"))
    )
    # Normalize whitespace
    value = re.sub(r"\s+", " ", value).strip()

    # Remove stop words
    tokens = value.lower().split()
    if stop_words:
        stop_words_set = {x.lower() for x in stop_words}
        tokens = [token for token in tokens if token not in stop_words_set]

    # Rejoin tokens & ASCII transliteration
    return unidecode(" ".join(tokens))


def tokenize_string(value: str) -> set[str]:
    return {normalize_string(token) for token in re.split(r"\W+", value) if token}


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
