#!/bin/sh
set -e

echo ""
echo "========================================"
echo " Backend tests"
echo "========================================"
pnpm --filter backend test

echo ""
echo "========================================"
echo " Frontend tests"
echo "========================================"
pnpm --filter frontend test

echo ""
echo "========================================"
echo " Tests passed"
echo "========================================"
