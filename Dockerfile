FROM python:3.8

WORKDIR /app
ADD requirements.txt .

RUN pip install -r requirements.txt

ADD . .
RUN python setup.py install

ENV REDIS_URL "127.0.0.1"
ENV REDIS_PORT 6379

CMD [ "gunicorn", "-b :8000", "mcshort.app:app" ]
