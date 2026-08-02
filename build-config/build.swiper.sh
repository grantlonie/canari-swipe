#!/usr/bin/env bash
set -euo pipefail

rm -rf dist/*

rollup --config build-config/rollup.config.swiper.js

cp ./{README.md,LICENSE,package.json} dist
rm -f dist/utils.d.ts dist/style.d.ts dist/types.d.ts