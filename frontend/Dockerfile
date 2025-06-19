FROM node:24.2-alpine AS base

WORKDIR /app

ADD package.json package-lock.json /app/
RUN npm ci

ADD . /app/


FROM base AS builder

RUN npm run build


FROM base AS dev

ENV WATCHPACK_POLLING=true

CMD ["npm", "run", "start"]


FROM caddy:2.10-alpine

WORKDIR /app

COPY --from=builder /app/build /app/
ADD Caddyfile /app

CMD ["caddy", "run"]
