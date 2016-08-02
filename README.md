# moon
Earth famous satellite implemented in Python/JS/...

# Dev installation

1. Create a new virtualenv with python3
2. Install the dependencies

```
$ pip install -r requirements.txt
$ npm install
```

3. Copy the `moon/settings/local_sample.py` to `moon/settings/local.py` and replace the right values
4. Setup the REDIS_URL env variable if needed
5. Play the Django migrations

```
$ ./manage.py migrate
```

6. Run the 3 process

```
$ ./manage.py runserver --noworker
$ npm start
$ ./manage.py runworker
$ daphne moon.asgi:channel_layer --port 8888
```

6. Have fun!
