# Engraced Smile PWA Deployment Summary

## Date: October 12, 2025

## Overview
Successfully deployed the Engraced Smile Progressive Web App (PWA) in a Docker container, configured to be accessible via https://engracedsmile.com.

## Deployment Details

### Container Information
- **Container Name**: `engracedsmile-pwa-site`
- **Image**: `engracedsmile_static-site:latest`
- **Base Image**: `nginx:alpine`
- **Host Port**: `8085`
- **Container Port**: `80`
- **Status**: Running and healthy
- **Restart Policy**: `unless-stopped`

### Application Architecture
The PWA is a static site that:
1. Wraps the main application (https://app.engracedsmile.com/) in an iframe
2. Provides Progressive Web App features:
   - Service Worker for offline functionality
   - Web App Manifest for installability
   - Push notifications support
   - Responsive design optimized for mobile

### Files Deployed
- `index.html` - Main PWA wrapper page
- `manifest.json` - PWA manifest with app metadata
- `sw.js` - Service Worker for offline caching
- `browserconfig.xml` - Microsoft tile configuration
- `icon.png` - Main app icon (192x192 and 512x512)
- `ms-tile-150.png` - Microsoft tile icon
- `shortcut-192.png`, `shortcut-96.png` - App shortcuts icons

### Nginx Configuration

#### Host Nginx (System)
Location: `/etc/nginx/sites-available/engracedsmile.com`

The configuration includes:
- **HTTP (Port 80)**: Redirects to HTTPS unless request comes from Cloudflare
- **HTTPS (Port 443)**: Serves content with SSL/TLS encryption
- **Proxy Configuration**: Routes requests to the Docker container on port 8085
- **SSL Certificates**: Let's Encrypt certificates from `/etc/letsencrypt/`

#### Proxy Rules (from `/etc/nginx/snippets/engracedsmile-locations.conf`)
1. **Root location (/)**: Proxies to `http://127.0.0.1:8085` with rate limiting
2. **Static files**: Cached for 1 year with immutable cache control
3. **Service Worker (/sw.js)**: No caching to ensure updates are immediate
4. **API routes (/api/)**: Proxied to backend services on port 3000

#### Container Nginx
Location: Inside container at `/etc/nginx/conf.d/app.conf`

Configuration:
- Listens on port 80 (mapped to host port 8085)
- Serves static files from `/usr/share/nginx/html/`
- Gzip compression enabled for performance
- Security headers: X-Content-Type-Options, X-XSS-Protection

### Health Check
- **Method**: wget HTTP request to `http://127.0.0.1:80/`
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 10 seconds grace period

### Security Features
1. **Rate Limiting**: 
   - API routes: 10 requests/second
   - General routes: 30 requests/second
2. **Security Headers**:
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security (HSTS)
   - Referrer-Policy: strict-origin-when-cross-origin
3. **SSL/TLS**: TLS 1.2 and 1.3 with strong cipher suites
4. **Cloudflare Integration**: Supports Cloudflare proxy with flexible SSL

### Port Configuration
The deployment uses **port 8085** to avoid conflicts with:
- Other containers running on the system
- Port 3000: Backend and frontend services
- Port 3002: Admin panel
- Port 8080: Previously occupied

## Access URLs

### Public Access
- **Primary**: https://engracedsmile.com
- **WWW**: https://www.engracedsmile.com (redirects to primary)

### Internal Access (for testing)
- **Direct to container**: http://localhost:8085
- **Through nginx proxy**: http://localhost (with Host header)

## Docker Commands

### View Container Status
```bash
docker ps --filter name=engracedsmile-pwa-site
```

### View Container Logs
```bash
docker logs engracedsmile-pwa-site
docker logs -f engracedsmile-pwa-site  # Follow logs
```

### Restart Container
```bash
cd /root/engracedsmile
docker-compose restart
```

### Stop Container
```bash
cd /root/engracedsmile
docker-compose down
```

### Rebuild and Start
```bash
cd /root/engracedsmile
docker-compose down
docker-compose up -d --build
```

### Execute Commands in Container
```bash
docker exec -it engracedsmile-pwa-site sh
```

## Nginx Management

### Test Configuration
```bash
nginx -t
```

### Reload Configuration
```bash
systemctl reload nginx
```

### View Nginx Status
```bash
systemctl status nginx
```

### View Nginx Error Logs
```bash
tail -f /var/log/nginx/error.log
```

### View Nginx Access Logs
```bash
tail -f /var/log/nginx/access.log
```

## Testing the Deployment

### Test Container Direct Access
```bash
curl -I http://localhost:8085
```

### Test Through Nginx Proxy
```bash
curl -H "Host: engracedsmile.com" -H "CF-Connecting-IP: 1.2.3.4" http://localhost/
```

### Test Manifest File
```bash
curl -H "Host: engracedsmile.com" -H "CF-Connecting-IP: 1.2.3.4" http://localhost/manifest.json
```

### Test Service Worker
```bash
curl -H "Host: engracedsmile.com" -H "CF-Connecting-IP: 1.2.3.4" http://localhost/sw.js
```

## Troubleshooting

### Container Not Starting
1. Check Docker logs: `docker logs engracedsmile-pwa-site`
2. Verify port 8085 is not in use: `netstat -tlnp | grep 8085`
3. Check Docker service: `systemctl status docker`

### 502 Bad Gateway
1. Verify container is running: `docker ps`
2. Check container health: `docker ps --format "table {{.Names}}\t{{.Status}}"`
3. Test direct container access: `curl http://localhost:8085`
4. Check nginx error logs: `tail -f /var/log/nginx/error.log`

### Health Check Failing
1. Check health check command: `docker inspect engracedsmile-pwa-site | grep -A 10 Healthcheck`
2. Test health check manually: `docker exec engracedsmile-pwa-site wget --spider http://127.0.0.1:80/`
3. View container logs for errors

### SSL Certificate Issues
1. Verify certificates exist: `ls -la /etc/letsencrypt/live/engracedsmile.com/`
2. Check certificate expiry: `openssl x509 -in /etc/letsencrypt/live/engracedsmile.com/fullchain.pem -noout -dates`
3. Renew certificates: `certbot renew`

## Maintenance

### Regular Tasks
1. **Monitor Container Health**: Check `docker ps` regularly
2. **Review Logs**: Check nginx and container logs for errors
3. **SSL Certificate Renewal**: Certificates auto-renew via certbot
4. **Update Base Image**: Periodically rebuild with latest nginx:alpine

### Updating the Application
1. Update source files in `/root/engracedsmile/`
2. Rebuild the container:
   ```bash
   cd /root/engracedsmile
   docker-compose down
   docker-compose up -d --build
   ```
3. Clear browser cache to see changes immediately

## Configuration Files

### Docker Compose
- **Location**: `/root/engracedsmile/docker-compose.yml`
- **Purpose**: Defines container configuration, port mappings, health checks

### Dockerfile
- **Location**: `/root/engracedsmile/Dockerfile`
- **Purpose**: Builds the nginx container with PWA files

### Nginx Site Config
- **Location**: `/etc/nginx/sites-available/engracedsmile.com`
- **Enabled**: Symlinked to `/etc/nginx/sites-enabled/engracedsmile.com`
- **Purpose**: Main server block configuration

### Nginx Locations Config
- **Location**: `/etc/nginx/snippets/engracedsmile-locations.conf`
- **Purpose**: Shared location blocks for proxy rules

## Performance Optimizations

1. **Gzip Compression**: Enabled for all text-based files
2. **Static File Caching**: 1-year cache for immutable assets
3. **HTTP/2**: Enabled for improved performance
4. **Keepalive Connections**: Enabled to reduce connection overhead
5. **Rate Limiting**: Prevents abuse and ensures fair usage

## Security Considerations

1. **Container Isolation**: Application runs in isolated Docker container
2. **Non-Root Container**: nginx:alpine runs as non-root user
3. **Minimal Attack Surface**: Only necessary ports exposed
4. **Regular Updates**: Keep base image and dependencies updated
5. **Cloudflare Protection**: Additional DDoS protection and WAF

## Success Indicators

✅ Container is running with "healthy" status
✅ Port 8085 is listening and responding
✅ Nginx proxy is configured and working
✅ Site is accessible via https://engracedsmile.com
✅ Health checks are passing
✅ No errors in nginx or container logs
✅ PWA features are functional (manifest, service worker)

## Notes

- The PWA wraps https://app.engracedsmile.com in an iframe
- The wrapped site must allow iframe embedding (no X-Frame-Options: DENY)
- Cloudflare is used as a CDN/proxy in front of the server
- The container automatically restarts unless manually stopped
- All static files are served with appropriate cache headers

## Contact & Support

For issues or questions:
1. Check logs first: `/var/log/nginx/error.log` and `docker logs engracedsmile-pwa-site`
2. Verify container and nginx status
3. Review this documentation for troubleshooting steps

---

**Deployment Completed Successfully**: October 12, 2025, 10:17 UTC
**Deployed By**: Automated deployment via Cursor AI
**Version**: 1.0

