# Shorty McShort Link

This is a basic URL shortener. It does nothing more, nothing less.

## Requirements
* A running [redis](https://redis.io/) instance
* Python 3.6+ (lower versions not tested)

## Installation
### Docker-compose (preferred)
```shell script
$ docker-compose up -d
```

### Manual
* Create and activate a [Python virtual environment](https://docs.python.org/3/tutorial/venv.html)

* Install dependencies
```shell script
$ pip install -r requirements.txt
```

* Compile the C extensions - Run in folder `mcshort`
```shell script
(in folder mcshort) $ python setup.py install 
```

* Export the env vars for your redis instance
```shell script
# Replace these with your values
$ export REDIS_URL=127.0.0.1
$ export REDIS_PORT=6379
```

* Run the application
```shell script
$ FLASK_APP=mcshort.app:app flask run
```

## License
Shorty McShort Link is released under the MIT License. See [LICENSE](LICENSE) for more information.

## Contact
Follow me on twitter [@mcostea](https://twitter.com/mcostea)
