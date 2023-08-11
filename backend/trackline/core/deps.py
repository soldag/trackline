import logging

from fastapi import WebSocket
from starlette.requests import HTTPConnection


log = logging.getLogger(__name__)


def websocket_logger(connection: HTTPConnection):
    if not isinstance(connection, WebSocket):
        yield
        return

    log.info(f"GET {connection.url.path} - Websocket opened")
    try:
        yield
    finally:
        log.info(f"GET {connection.url.path} - Websocket closed")
