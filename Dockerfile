FROM python:3.8

WORKDIR /app
ADD requirements.txt .

RUN pip install -r requirements.txt

ADD . .
RUN python setup.py install

ENV REDIS_URL "redis://127.0.0.1:6379/0"
ENV PORT 8000

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]
