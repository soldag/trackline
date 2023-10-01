import string

from Levenshtein import ratio
from unidecode import unidecode


def compare_strings(value1: str, value2: str) -> float:
    return ratio(value1, value2, processor=normalize_string)


def normalize_string(value: str) -> str:
    value = " ".join(value.lower().split())
    value = value.translate(str.maketrans("", "", string.punctuation))
    return unidecode(value)
