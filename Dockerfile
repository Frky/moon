FROM node:4.4.7

RUN apt-get update
RUN apt-get install python3 python3-dev -y
RUN rm /usr/bin/python
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN wget https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py

RUN mkdir /app
COPY requirements.txt /app
RUN pip install -r /app/requirements.txt

COPY . /app

WORKDIR /app

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g webpack@1.13.1

CMD daphne moon.asgi:channel_layer -p 4444 -b 0.0.0.0