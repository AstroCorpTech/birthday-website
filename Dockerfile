# Static birthday website served by Nginx
FROM nginx:1.27-alpine

# Replace default Nginx config with our own
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the site into Nginx's web root
COPY index.html style.css script.js /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
