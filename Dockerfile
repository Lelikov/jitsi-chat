# Build stage
FROM node:20-alpine as build

WORKDIR /app

# events-design-system is a git dependency, but node:alpine ships no git and npm
# pins it to git+ssh (no key in-build). Install git and rewrite GitHub ssh URLs →
# anonymous https so `npm install` can clone the (now public) repo.
RUN apk add --no-cache git \
 && git config --global url."https://github.com/".insteadOf "git+ssh://git@github.com/" \
 && git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" \
 && git config --global url."https://github.com/".insteadOf "git@github.com:"
COPY package*.json ./
# --legacy-peer-deps: events-design-system peers react@^19.2.4 while jitsi's
# stream-chat-react/floating-ui tree resolves react to 19.2.3 (a non-breaking
# patch diff); the strict peer check would otherwise ERESOLVE.
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM caddy:alpine

# Copy built assets
COPY --from=build /app/dist /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copy env script and make it executable
COPY env.sh /bin/env.sh
RUN chmod +x /bin/env.sh

EXPOSE 80

# Run env script then caddy
CMD ["/bin/sh", "-c", "/bin/env.sh && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]
