from pathlib import Path

import toml


def get_version() -> str | None:
    path = Path(__file__).parent.parent.parent.parent / "pyproject.toml"
    try:
        return toml.load(path)["project"]["version"]
    except (FileNotFoundError, toml.TomlDecodeError, KeyError):
        return None
