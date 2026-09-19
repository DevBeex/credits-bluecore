FROM node:24.21.0-bookworm-slim AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile --filter=backend...

COPY backend ./backend

RUN pnpm --filter backend build

FROM node:24.21.0-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile --prod --filter=backend...

COPY --from=build /app/backend/dist ./backend/dist
COPY certs ./certs
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh

RUN sed -i 's/\r$//' ./backend/docker-entrypoint.sh \
  && chmod +x ./backend/docker-entrypoint.sh

WORKDIR /app/backend
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
