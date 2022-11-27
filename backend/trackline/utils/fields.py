from typing import Any

from bson import ObjectId


class StringId(str):
    def __new__(cls, value: Any = None):
        if not value:
            value = str(ObjectId())
        return str.__new__(cls, value)

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid id")

        return StringId(value)

    @classmethod
    def __get_validators__(cls):
        yield cls.validate
