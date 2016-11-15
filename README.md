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

# To deploy

1. webpack -p --config webpack-prod.config.js
2. scp website/static/dist/app.bundle.js  root@blef.fr:/var/www/moon/static/dist/app.bundle.js

# Test

1. Run django command out of the box `./manage.py test website`
2. With coverage `coverage run --source='.' manage.py test website` and get your report `coverage report`