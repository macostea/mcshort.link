import os
from setuptools import setup, Extension

setup(
    name="mcshort",
    version="1.0.0",
    ext_modules=[Extension("fasthash",
                           ["lib/fast_hash/src/fasthash.c", "lib/fast_hash/src/fasthash_wrapper.c"],
                           include_dirs=[os.path.dirname(os.path.realpath(__file__)) + "/lib/fast_hash/include"]
                           )]
)
