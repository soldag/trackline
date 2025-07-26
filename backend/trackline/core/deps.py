import logging
from collections.abc import Iterator

from fastapi import WebSocket
from starlette.requests import HTTPConnection

log = logging.getLogger(__name__)


def websocket_logger(connection: HTTPConnection) -> Iterator[None]:
    if not isinstance(connection, WebSocket):
        yield
        return

    log.info("GET %s - Websocket opened", connection.url.path)
    try:
        yield
    finally:
        log.info("GET %s - Websocket closed", connection.url.path)
