#!/bin/sh

# Start the backend server in the background
node /var/www/backend/dist/index.js &

# Start nginx in the foreground
nginx -g 'daemon off;'
