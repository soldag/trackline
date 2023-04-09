from bson import ObjectId


class ResourceId(ObjectId):
    @classmethod
    def validate(cls, value) -> "ResourceId":
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid id")

        return cls(value)

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(
            type="string",
            example="64331790c4f8cec3ba2a6662",
            examples=["64331790c4f8cec3ba2a6662", "643317c90eb8ee03b762841d"],
        )
