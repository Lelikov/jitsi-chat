#!/bin/sh

echo "window._env_ = {" > /srv/env-config.js

printenv | grep VITE_ | while read -r line; do
  key=$(echo "$line" | cut -d '=' -f 1)
  value=$(echo "$line" | cut -d '=' -f 2-)
  echo "  \"$key\": \"$value\"," >> /srv/env-config.js
done

echo "};" >> /srv/env-config.js

if [ -n "$VITE_STREAM_CHAT_API_KEY" ]; then
  sed -i "s/VITE_STREAM_CHAT_API_KEY_PLACEHOLDER/$VITE_STREAM_CHAT_API_KEY/g" /srv/index.html
fi
