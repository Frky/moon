from moon.settings.base import *

DEBUG = os.getenv('DEBUG', '1') == '1'
DEV = os.getenv('DEV', '1') == '1'

ALLOWED_HOSTS = ['*']

STATIC_ROOT = os.getenv('STATIC_ROOT', '/app/static')
