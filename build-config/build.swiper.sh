rm -rf dist/*

rollup --config build-config/rollup.config.swiper.js

cp ./{README.md,LICENSE,package.json} dist
rm dist/utils.d.ts dist/style.d.ts
mv dist/Swiper.d.ts dist/index.d.ts