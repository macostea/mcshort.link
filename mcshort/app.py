from flask import Flask, redirect, abort, request, render_template, jsonify
from flask_cors import CORS
import os
import redis
import validators

from .encoder import encode_string

app = Flask(__name__)
CORS(app)

redis_url = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/0')

r = redis.Redis.from_url(redis_url, decode_responses=True)

day = 60 * 60 * 24

expiry_human = {
    "1d": day,
    "30d": 30 * day,
    "60d": 60 * day
}


@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")


@app.route('/shorten', methods=['POST'])
def shorten():
    path = request.form.get('path')
    expiry = request.form.get('expiry')
    shortened_obj = __shorten(path, expiry)

    if shortened_obj is not None:
        return render_template("index.html", short_path=shortened_obj['short_path'])

    abort(400)


@app.route('/api/shorten', methods=['POST'])
def shorten_api():
    json_body = request.json
    path = json_body.get('path')
    expiry = json_body.get('expiry')

    shortened_obj = __shorten(path, expiry)

    if shortened_obj is not None:
        return jsonify(shortened_obj)

    abort(400)


@app.route('/<path>')
def redirect_path(path):
    long_path = __find_path(path)
    if long_path is not None:
        return redirect(long_path, code=302)

    abort(404)


def __shorten(path, expiry):
    if expiry is None or expiry not in expiry_human.keys():
        expiry = "30d"
    if validators.url(path):
        short_path = __set_path(path, expiry_human[expiry])
        short_path_full_url = f"{request.url_root}{short_path}".replace("http", "https")  # Shitty hack but should work

        return {
            "full_path": path,
            "short_path": short_path_full_url,
            "expiry": expiry
        }

    return None


def __find_path(shortened_path):
    return r.get(shortened_path)


def __set_path(long_path, expiry):  # Expire in 1 month by default
    shortened_path = encode_string(long_path).decode('ascii')
    r.set(shortened_path, long_path)
    r.expire(shortened_path, expiry)

    return shortened_path
