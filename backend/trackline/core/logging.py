import sentry_sdk
from sentry_sdk.integrations.aiohttp import AioHttpIntegration
from sentry_sdk.integrations.pymongo import PyMongoIntegration

from trackline.core.settings import Settings


def get_log_config(settings: Settings) -> dict:
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


def initialize_sentry(settings: Settings):
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            enable_tracing=True,
            integrations=[
                AioHttpIntegration(),
                PyMongoIntegration(),
            ],
        )
