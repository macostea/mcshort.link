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
      fasthash64: module.cwrap('fasthash64', 'number', ['number', 'number']),
      module: module,
    })
  })
})

async function shorten(path) {
  let hasher = await emscripten_module

  let encoder = new TextEncoder()
  let bytes = encoder.encode(path)

  let ptr = hasher.init(bytes.length)

  hasher.module.HEAPU8.set(bytes, ptr)

  const newSize = hasher.fasthash64(bytes.length, 4)
  let resultBytes = hasher.module.HEAPU8.slice(ptr, ptr + newSize)
  
  let decoder = new TextDecoder()

  return decoder.decode(resultBytes);
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
  let pathsubstr = url.pathname.substring(1)
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
  } else if (request.method.toUpperCase() === "GET" && !pathsubstr) {
    const response = await fetch(request)
    return response
  } else {
    const longUrl = await getKV(pathsubstr)
    if (longUrl) {
      return Response.redirect(longUrl, 302)
    } else {
      return new Response("Key not found " + pathsubstr)
    }
  }
}
