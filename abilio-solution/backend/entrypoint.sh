#!/bin/sh
set -e
echo "Running migrations..."
node node_modules/typeorm/cli.js migration:run -d dist/src/data-source.js
if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "Running seed..."
  node dist/src/seed/porto-seeder.js
  node dist/src/seed/lisboa-seeder.js
fi
echo "Starting app..."
exec node dist/src/main.js
