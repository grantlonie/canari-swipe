#!/usr/bin/env bash
set -euo pipefail

rm -rf dev
mkdir dev
cp src/index.html dev

rollup --config build-config/rollup.config.js --watch
