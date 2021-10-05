// import the emscripten glue code
import emscripten from './build/module.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

// this is where the magic happens
// we send our own instantiateWasm function
// to the emscripten module
// so we can initialize the WASM instance ourselves
// since Workers puts your wasm file in global scope
// as a binding. In this case, this binding is called
// `wasm` as that is the name Wrangler uses
// for any uploaded wasm module
let emscripten_module = new Promise((resolve, reject) => {
  emscripten({
    instantiateWasm(info, receive) {
      let instance = new WebAssembly.Instance(WASM_MODULE, info)
      receive(instance)
      return instance.exports
    },
  }).then(module => {
    resolve({
      init: module.cwrap('init', 'number', ['number']),
      fasthash64: module.cwrap('fasthash64', 'bigint', ['number', 'bigint']),
      module: module,
    })
  })
})

const BASE66_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_."
const BASE = BigInt(BASE66_ALPHABET.length)

function encode_int(n) {
  if (n === 0) {
    return BASE66_ALPHABET[0]
  }

  let r = ""

  while (n) {
    n = n / BASE
    let t = n % BASE
    r += BASE66_ALPHABET[t]
  }

  return r
}

async function shorten(path) {
  let hasher = await emscripten_module

  let encoder = new TextEncoder()
  let bytes = encoder.encode(path)

  let ptr = hasher.init(bytes.length)

  hasher.module.HEAPU8.set(bytes, ptr)

  const hashValue = hasher.fasthash64(bytes.length, BigInt(4))
  return encode_int(hashValue)
}

async function setKV(shortPath, longPath) {
  await MCSHORT_LINK_KV.put(shortPath, longPath, {expirationTtl: 60*60*24*30})
}

async function getKV(shortPath) {
  return await MCSHORT_LINK_KV.get(shortPath)
}

async function handleRequest(event) {
  let request = event.request

  let url = new URL(request.url)
  if (request.method.toUpperCase() === "POST" && url.pathname === "/api/shorten") {
    const body = await request.json()
    const path = body.path

    const pathUrl = new URL(path)
    const shortPath = await shorten(pathUrl.toString())
    await setKV(shortPath, path)

    return new Response(JSON.stringify({
      "full_path": path,
      "short_path": `https://${url.host}/${shortPath}`
    }), {
      headers: { "content-type": "application/json;charset=UTF-8" }
    })
  } else {
    const longUrl = await getKV(url.pathname.substr(1))
    if (longUrl) {
      return Response.redirect(longUrl, 302)
    } else {
      return new Response("Key not found " + url.pathname.substr(1))
    }
  }
}
