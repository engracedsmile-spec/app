# Use nginx as the base image for serving static files
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the application files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/
COPY browserconfig.xml /usr/share/nginx/html/
COPY icon.png /usr/share/nginx/html/
COPY ms-tile-150.png /usr/share/nginx/html/
COPY shortcut-192.png /usr/share/nginx/html/
COPY shortcut-96.png /usr/share/nginx/html/

# Create a custom nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security headers \
    add_header X-Content-Type-Options nosniff; \
    add_header X-XSS-Protection "1; mode=block"; \
    \
    # Enable gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/manifest+json; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache static files \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Service worker should not be cached \
    location = /sw.js { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        expires 0; \
    } \
}' > /etc/nginx/conf.d/app.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

