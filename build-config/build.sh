rm -rf build
mkdir build
cp src/index.html build

rollup --config build-config/rollup.config.js
