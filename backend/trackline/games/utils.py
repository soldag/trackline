import re
import unicodedata
from collections.abc import Iterable
from typing import cast

from Levenshtein import ratio
from text_to_num import alpha2digit  # type: ignore[reportUnknownVariableType]
from unidecode import unidecode

# Languages supported by text2num
TEXT_TO_NUM_LANGUAGES = ("de", "en", "es", "fr", "it", "nl", "pt")


def compare_strings(
    value1: str,
    value2: str,
    *,
    convert_numbers: bool = False,
    stop_words: Iterable[str] | None = None,
) -> float:
    normalized_value1 = normalize_string(
        value1, stop_words=stop_words, convert_numbers=convert_numbers
    )
    normalized_value2 = normalize_string(
        value2, stop_words=stop_words, convert_numbers=convert_numbers
    )

    # If any of the two strings only consists of stop words, keep them
    if stop_words and (
        (value1 and not normalized_value1) or (value2 and not normalized_value2)
    ):
        normalized_value1 = normalize_string(value1, convert_numbers=convert_numbers)
        normalized_value2 = normalize_string(value2, convert_numbers=convert_numbers)

    return ratio(normalized_value1, normalized_value2)


def normalize_string(
    value: str,
    *,
    convert_numbers: bool = False,
    stop_words: Iterable[str] | None = None,
) -> str:
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
    value = " ".join(tokens)

    # Convert spelled-out numbers to digits so that word and digit forms match
    if convert_numbers:
        for language in TEXT_TO_NUM_LANGUAGES:
            value = cast("str", alpha2digit(value, language))

    # ASCII transliteration
    return unidecode(value)


def tokenize_string(value: str) -> set[str]:
    return {normalize_string(token) for token in re.split(r"\W+", value) if token}
