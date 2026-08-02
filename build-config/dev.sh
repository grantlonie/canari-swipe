#!/usr/bin/env bash
set -euo pipefail

rm -rf dev
mkdir dev
cp src/index.html dev
cp llms.txt llms-full.txt dev

rollup --config build-config/rollup.config.js --watch
