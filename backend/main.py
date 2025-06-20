import uvicorn

from trackline.core.logging import get_log_config
from trackline.core.settings import get_settings


def main() -> None:
    settings = get_settings()

    uvicorn.run(
        "trackline.app:app",
        lifespan="on",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_config=get_log_config(settings),
    )


if __name__ == "__main__":
    main()
