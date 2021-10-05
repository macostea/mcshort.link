var $ = require('shelljs')

$.mkdir('-p', 'build')
$.exec(
  'emcc -O2 -s WASM=1 -s EXPORTED_RUNTIME_METHODS=\'["cwrap", "setValue"]\' -s WASM_BIGINT -s ALLOW_MEMORY_GROWTH=1 -s DYNAMIC_EXECUTION=0 -s TEXTDECODER=0 -s MODULARIZE=1 -s ENVIRONMENT=\'web\' -s EXPORT_NAME="emscripten" --pre-js \'./pre.js\' -o ./build/module.js ./src/main.c',
)
