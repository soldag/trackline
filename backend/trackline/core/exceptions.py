from collections.abc import Sequence


class RequestException(Exception):
    def __init__(
        self,
        code: str,
        description: str,
        location: Sequence[str] | None = None,
        status_code: int = 400,
    ):
        self.code = code
        self.description = description
        self.location = location
        self.status_code = status_code


class UseCaseException(RequestException):
    pass
