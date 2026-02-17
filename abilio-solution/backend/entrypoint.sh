#!/bin/sh
set -e
echo "Running migrations..."
node node_modules/typeorm/cli.js migration:run -d dist/src/data-source.js
echo "Starting app..."
exec node dist/src/main.js
