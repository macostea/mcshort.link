from io import StringIO
import fasthash

BASE66_ALPHABET = u"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_."
BASE = len(BASE66_ALPHABET)


def encode_int(n):
    if n == 0:
        return BASE66_ALPHABET[0].encode('ascii')
    r = StringIO()
    while n:
        n, t = divmod(n, BASE)
        r.write(BASE66_ALPHABET[t])
    return r.getvalue().encode('ascii')[::-1]


def encode_string(string):
    i = fasthash.fasthash64(string)
    return encode_int(i)
