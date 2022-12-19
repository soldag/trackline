FROM python:3.10-alpine AS poetry

WORKDIR /tmp

RUN apk add poetry

ADD pyproject.toml poetry.lock /tmp/
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes


FROM python:3.10-alpine AS base

WORKDIR /app

COPY --from=poetry /tmp/requirements.txt /app
RUN apk add --update-cache --virtual build-deps build-base git \
    && pip install --no-cache-dir --upgrade -r requirements.txt \
    && apk del build-deps

ADD . /app


FROM base AS dev

CMD ["uvicorn", "trackline.app:app", "--host", "0.0.0.0", "--port", "80", "--reload"]


FROM base

CMD ["uvicorn", "trackline.app:app", "--host", "0.0.0.0", "--port", "80"]
