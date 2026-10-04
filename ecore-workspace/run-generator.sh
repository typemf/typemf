#!/usr/bin/env bash
# Regenerates the Ecore metamodel code in packages/core/src/metamodel from Ecore.ecore.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(dirname "$here")"

# Build the generator and the packages it depends on.
pnpm --dir "$root" exec turbo run build --filter=@typemf/generator --output-logs=errors-only

node "$root/packages/generator/dist/cli.js" "$here/typemf-ecore-generator.config.json"

pnpm --dir "$root" exec prettier --write packages/core/src/metamodel --log-level warn
