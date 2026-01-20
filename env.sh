#!/bin/sh

echo "window._env_ = {" > /srv/env-config.js

printenv | grep VITE_ | while read -r line; do
  key=$(echo "$line" | cut -d '=' -f 1)
  value=$(echo "$line" | cut -d '=' -f 2-)
  echo "  \"$key\": \"$value\"," >> /srv/env-config.js
done

echo "};" >> /srv/env-config.js
