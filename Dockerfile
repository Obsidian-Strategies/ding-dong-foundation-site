# Serves the static site with Caddy. Used by Railway; GitHub Pages ignores this.
FROM caddy:2-alpine
WORKDIR /srv
COPY index.html ./
COPY css ./css
EXPOSE 8080
CMD ["sh", "-c", "caddy file-server --root /srv --listen :${PORT:-8080}"]
