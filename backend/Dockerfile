FROM python:3.13-alpine AS poetry

WORKDIR /tmp

RUN pip install poetry==2.1.1 \
    && poetry self add poetry-plugin-export

ADD pyproject.toml poetry.lock /tmp/
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes


FROM python:3.13-alpine

ENV PORT=80

WORKDIR /app

COPY --from=poetry /tmp/requirements.txt /app
RUN apk add --update-cache --virtual build-deps build-base git \
    && pip install --no-cache-dir --upgrade -r requirements.txt \
    && apk del build-deps

ADD . /app

CMD ["python3", "main.py"]
