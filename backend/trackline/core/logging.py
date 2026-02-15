import traceback
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
    if exc_info := hint.get("exc_info"):
        _, exc, tb = exc_info

        # Ignore 'connection closed' errors from pymongo, as
        # they commonly occur during normal server restarts
        stack_trace = traceback.extract_tb(tb)
        if (
            isinstance(exc, OSError)
            and str(exc) == "connection closed"
            and any("pymongo" in frame.filename for frame in stack_trace)
        ):
            return None

    return event
