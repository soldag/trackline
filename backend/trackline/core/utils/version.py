import os

import toml


def get_version() -> str | None:
    path = os.path.join(os.path.dirname(__file__), "../../../pyproject.toml")
    try:
        return toml.load(path)["project"]["version"]
    except (FileNotFoundError, toml.TomlDecodeError, KeyError):
        return None
