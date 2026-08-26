# Builds the Eleventy site, then serves the static output with Caddy. Used by Railway.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx @11ty/eleventy

FROM caddy:2-alpine
COPY --from=build /app/_site /srv
EXPOSE 8080
CMD ["sh", "-c", "caddy file-server --root /srv --listen :${PORT:-8080}"]
