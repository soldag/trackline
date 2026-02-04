import re
import unicodedata
from collections.abc import Iterable

from Levenshtein import ratio
from unidecode import unidecode


def compare_strings(
    value1: str, value2: str, stop_words: Iterable[str] | None = None
) -> float:
    normalized_value1 = normalize_string(value1, stop_words=stop_words)
    normalized_value2 = normalize_string(value2, stop_words=stop_words)

    # If any of the two strings only consists of stop words, keep them
    if stop_words and (
        (value1 and not normalized_value1) or (value2 and not normalized_value2)
    ):
        normalized_value1 = normalize_string(value1)
        normalized_value2 = normalize_string(value2)

    return ratio(normalized_value1, normalized_value2)


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
