#include <Python.h>
#include "fasthash.h"

static PyObject *fasthash32_py(PyObject *self, PyObject *args) {
  const char *data;

  if (!PyArg_ParseTuple(args, "s", &data)) {
    return NULL;
  }

  uint32_t result = fasthash32(data, strlen(data), 0);

  return PyLong_FromUnsignedLongLong(result);
}

static PyObject *fasthash64_py(PyObject *self, PyObject *args) {
  const char *data;
  
  if (!PyArg_ParseTuple(args, "s", &data)) {
    return NULL;
  }

  uint64_t result = fasthash64(data, strlen(data), 0);

  return PyLong_FromUnsignedLongLong(result);
}

static PyMethodDef module_methods[] = {
  {"fasthash32", fasthash32_py, METH_VARARGS, "Calculate 32-bit hash value with fasthash"},
  {"fasthash64", fasthash64_py, METH_VARARGS, "Calculate 64-bit hash value with fasthash"},
  {NULL, NULL, 0, NULL}
};

static struct PyModuleDef fasthash_module = {
  PyModuleDef_HEAD_INIT,
  "fasthash",
  NULL,
  -1,
  module_methods
};

PyMODINIT_FUNC PyInit_fasthash(void) {
  PyObject *module = PyModule_Create(&fasthash_module);
  return module;
}

