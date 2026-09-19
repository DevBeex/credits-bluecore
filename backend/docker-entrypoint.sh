#!/bin/sh
set -e

cd /app/backend

echo "Running database migrations..."
pnpm exec typeorm migration:run -d dist/database/data-source.js

echo "Starting API..."
exec node dist/main.js
