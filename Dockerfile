# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

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
