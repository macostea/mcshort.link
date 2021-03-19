#!/bin/sh
gunicorn -b :${PORT} mcshort.app:app