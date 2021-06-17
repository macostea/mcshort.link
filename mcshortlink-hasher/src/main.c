#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>

// Basic types and decls.
typedef   signed char        int8_t;
typedef unsigned char       uint8_t;
typedef          short      int16_t;
typedef unsigned short     uint16_t;
typedef          int        int32_t;
typedef unsigned int       uint32_t;
typedef          long long  int64_t;
typedef unsigned long long uint64_t;

typedef unsigned long size_t;
typedef unsigned char byte;
typedef unsigned int uint;

#define NULL ((void*)0)
#define mix(h) ({					\
            (h) ^= (h) >> 23;		\
            (h) *= 0x2127599bf4325c37ULL;	\
            (h) ^= (h) >> 47; })

char *buffer;
char *outBuffer;

// init() is called from JS to allocate space for the string.
char* EMSCRIPTEN_KEEPALIVE init(size_t size) {
  // Allocate space for the string.
  buffer = (char *)malloc(size);

  // Return the pointer to JavaScript so that it can fill in the string.
  return buffer;
}

// resize() is called from JS once the image file has been copied into
// WASM memory. It resizes the image to be target_width pixels wide.
uint64_t EMSCRIPTEN_KEEPALIVE fasthash64(size_t len, uint64_t seed) {
    char *buf = buffer;
    const uint64_t    m = 0x880355f21e6d1965ULL;
    const uint64_t *pos = (const uint64_t *)buf;
    const uint64_t *end = pos + (len / 8);
    const unsigned char *pos2;
    uint64_t h = seed ^ (len * m);
    uint64_t v;

    while (pos != end) {
        v  = *pos++;
        h ^= mix(v);
        h *= m;
    }

    pos2 = (const unsigned char*)pos;
    v = 0;

    switch (len & 7) {
        case 7: v ^= (uint64_t)pos2[6] << 48;
        case 6: v ^= (uint64_t)pos2[5] << 40;
        case 5: v ^= (uint64_t)pos2[4] << 32;
        case 4: v ^= (uint64_t)pos2[3] << 24;
        case 3: v ^= (uint64_t)pos2[2] << 16;
        case 2: v ^= (uint64_t)pos2[1] << 8;
        case 1: v ^= (uint64_t)pos2[0];
        h ^= mix(v);
        h *= m;
    }

    return mix(h);
}

//uint64_t EMSCRIPTEN_KEEPALIVE encode(size_t len, uint64_t seed) {
//    uint64_t h = fasthash64(len, seed);
//    const std::string BASE66_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.";
//    const size_t BASE = BASE66_ALPHABET.length();
//
//    std::string ret = "";
//
//    if (h == 0) {
//        ret += BASE66_ALPHABET[0];
//    } else {
//        while (h != 0) {
//            h = h / BASE;
//        }
//    }
//}