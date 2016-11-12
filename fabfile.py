from __future__ import with_statement  # needed for python 2.5
import os

from fabric.api import *


def blef_fr():
    """Use the actual webserver"""
    env.project_name = 'moon'
    env.hosts = ['blef.fr']
    env.user = 'root'
    env.key_filename = '~/.ssh/id_rsa'
    env.path = '/var/www/%(project_name)s' % env
    env.virtualhost_path = '/var/www/%(project_name)s/.venv/%(project_name)s' % env


def deploy(branch='master'):
    """
    Deploy the latest version of the site to the servers,
    install any required third party modules,
    install the virtual host and then restart the webserver
    """
    require('hosts', provided_by=[blef_fr])
    require('path')

    with cd(env.path):
        run('git checkout %s' % branch)
        run('git pull origin %s' % branch)
        run('%(virtualhost_path)s/bin/pip install -r requirements.txt' % env)
        run('%(virtualhost_path)s/bin/python manage.py migrate' % env)

    with lcd(os.getcwd()):
        local('git checkout %s' % branch)
        local('webpack -p --config webpack-prod.config.js')
        run('mkdir -p %(path)s/static/dist;' % env)
        put('website/static/dist/*', '%(path)s/static/dist/' % env)

    with cd(env.path):
        run('%(virtualhost_path)s/bin/python manage.py collectstatic --noinput' % env)
        run('supervisorctl reload')



