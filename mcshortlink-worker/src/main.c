/* The MIT License

   Copyright (C) 2012 Zilong Tan (eric.zltan@gmail.com)

   Permission is hereby granted, free of charge, to any person
   obtaining a copy of this software and associated documentation
   files (the "Software"), to deal in the Software without
   restriction, including without limitation the rights to use, copy,
   modify, merge, publish, distribute, sublicense, and/or sell copies
   of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
   BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
   ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
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

const char *BASE66_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.";

char *buffer;

// init() is called from JS to allocate space for the string.
char* EMSCRIPTEN_KEEPALIVE init(size_t size) {
  // Allocate space for the string.
  buffer = (char *)malloc(size);

  // Return the pointer to JavaScript so that it can fill in the string.
  return buffer;
}

void encode_int(uint64_t n, char **result) {
    if (n == 0) {
        *result[0] = BASE66_ALPHABET[0];
        return;
    }
    
    const uint64_t BASE = strlen(BASE66_ALPHABET);
    
    size_t i = 0;
    
    while (n) {
        uint64_t t = n % BASE;
        n = n / BASE;
        (*result)[i] = BASE66_ALPHABET[t];
        i++;
    }
    
    (*result)[i] = '\0';
}

size_t EMSCRIPTEN_KEEPALIVE fasthash64(size_t len, uint64_t seed) {
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

    uint64_t hash = mix(h);

    // HACK: Write to the original buffer string so we don't pass 2 pointers to JS
    encode_int(hash, &buffer);

    return strlen(buffer);
}
