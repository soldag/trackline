import argon2


def hash_password(password: str) -> str:
    hasher = argon2.PasswordHasher()
    return hasher.hash(password)


def verify_password(password: str, password_hash: str) -> tuple[bool, str | None]:
    hasher = argon2.PasswordHasher()

    new_hash = None
    if hasher.check_needs_rehash(password_hash):
        new_hash = hasher.hash(password)

    try:
        hasher.verify(password_hash, password)
        return True, new_hash
    except argon2.exceptions.VerifyMismatchError:
        return False, new_hash
