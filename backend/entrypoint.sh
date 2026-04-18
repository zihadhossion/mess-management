#!/bin/sh
set -e

echo "Running database migrations..."
node dist-scripts/database/migrate.js

echo "Starting server..."
exec node dist/main
