// import the emscripten glue code
import emscripten from './build/module.js'
import wasm_module from './build/module.wasm'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
}

addEventListener('fetch', (event) => {
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
      let instance = new WebAssembly.Instance(wasm_module, info)
      receive(instance)
      return instance.exports
    },
  }).then((module) => {
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

  return decoder.decode(resultBytes)
}

async function setKV(shortPath, longPath) {
  await MCSHORT_LINK_KV.put(shortPath, longPath, {
    expirationTtl: 60 * 60 * 24 * 30,
  })
}

async function getKV(shortPath) {
  return await MCSHORT_LINK_KV.get(shortPath)
}

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get(
        'Access-Control-Request-Headers',
      ),
    }
    return new Response(null, {
      headers: respHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}

async function handleRequest(event) {
  let request = event.request

  if (request.method === 'OPTIONS') {
    return handleOptions(request)
  }

  let url = new URL(request.url)
  let pathsubstr = url.pathname.substring(1)
  if (
    request.method.toUpperCase() === 'POST' &&
    url.pathname === '/api/shorten'
  ) {
    const body = await request.json()
    const path = body.path

    const blockedDomains = (await getKV('blocked_domains')).split(',')
    const blocked = blockedDomains.some((domain) => path.includes(domain))

    if (blocked) {
      return new Response('', {
        status: 403,
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
      })
    }

    const pathUrl = new URL(path)
    const shortPath = await shorten(pathUrl.toString())
    await setKV(shortPath, path)

    return new Response(
      JSON.stringify({
        full_path: path,
        short_path: `https://${url.host}/${shortPath}`,
      }),
      {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
      },
    )
  } else if (request.method.toUpperCase() === 'GET' && !pathsubstr) {
    const response = await fetch(request)
    return response
  } else {
    const longUrl = await getKV(pathsubstr)
    if (longUrl) {
      return Response.redirect(longUrl, 302)
    } else {
      return new Response('Key not found ' + pathsubstr)
    }
  }
}
