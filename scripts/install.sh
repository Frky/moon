docker-compose run app npm install
docker-compose run app webpack -p --config webpack-prod.config.js
docker-compose run app ./manage.py migrate