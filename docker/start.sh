#!/bin/sh
set -eu
cd /var/www/html
php artisan config:cache
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
