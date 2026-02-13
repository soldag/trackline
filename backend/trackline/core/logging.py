from typing import Any

import sentry_sdk
from sentry_sdk.integrations.aiohttp import AioHttpIntegration
from sentry_sdk.integrations.asyncio import AsyncioIntegration
from sentry_sdk.integrations.pymongo import PyMongoIntegration
from sentry_sdk.types import Event, Hint

from trackline.core.settings import Settings


def get_log_config(settings: Settings) -> dict[str, Any]:
    return {
        "version": 1,
        "formatters": {
            "default": {
                "format": "%(asctime)s [%(name)s] %(levelname)s: %(message)s",
                "datefmt": "%Y-%m-%dT%H:%M:%S%z",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
            },
        },
        "loggers": {
            "root": {
                "level": settings.log_level.value,
                "handlers": ["default"],
            },
            "uvicorn": {
                "level": "WARNING",
                "propagate": True,
            },
        },
    }


def initialize_sentry(settings: Settings) -> None:
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            enable_tracing=True,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
            integrations=[
                AioHttpIntegration(),
                AsyncioIntegration(),
                PyMongoIntegration(),
            ],
            ignore_errors=[KeyboardInterrupt],
            before_send=before_send,
        )


def before_send(event: Event, hint: Hint) -> Event | None:
    exc_info = hint.get("exc_info")

    if exc_info:
        _, exc, _ = exc_info

        if isinstance(exc, OSError) and str(exc) == "connection closed":
            event.setdefault("extra", {})
            event["extra"]["mongo_debug"] = {  # pyright: ignore[reportTypedDictNotRequiredAccess]
                "likely_cause": "mongo_restart_or_socket_close",
                "driver_layer": "pymongo_network",
            }

    return event
