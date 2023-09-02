import string

from jaro import jaro_winkler_metric
from unidecode import unidecode


def compare_strings(value1: str, value2: str) -> float:
    return jaro_winkler_metric(normalize_string(value1), normalize_string(value2))


def normalize_string(value: str) -> str:
    value = " ".join(value.lower().split())
    value = value.translate(str.maketrans("", "", string.punctuation))
    return unidecode(value)
