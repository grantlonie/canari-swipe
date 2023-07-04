rm -rf build/*

rollup --config

cp ./{README.md,LICENSE,package.json} build
rm build/utils.d.ts build/style.d.ts
mv build/Swiper.d.ts build/index.d.ts