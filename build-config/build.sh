#!/usr/bin/env bash
set -euo pipefail

rm -rf build
mkdir build
cp src/index.html build
cp llms.txt llms-full.txt build

rollup --config build-config/rollup.config.js
