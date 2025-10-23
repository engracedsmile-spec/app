# Engraced Smile PWA - Quick Reference

## Container Management

### Status Check
```bash
docker ps | grep engracedsmile-pwa-site
```

### Start/Stop/Restart
```bash
cd /root/engracedsmile
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose restart      # Restart
```

### View Logs
```bash
docker logs -f engracedsmile-pwa-site
```

## Nginx Management

### Reload Configuration
```bash
nginx -t && systemctl reload nginx
```

### View Logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## Quick Tests

### Test Container
```bash
curl -I http://localhost:8085
```

### Test Site
```bash
curl -H "Host: engracedsmile.com" -H "CF-Connecting-IP: 1.2.3.4" http://localhost/
```

## Important Info

- **Container Name**: `engracedsmile-pwa-site`
- **Port**: `8085` (host) → `80` (container)
- **URL**: https://engracedsmile.com
- **Config Location**: `/root/engracedsmile/`
- **Nginx Config**: `/etc/nginx/sites-available/engracedsmile.com`

## Common Issues

### 502 Bad Gateway
Check if container is running: `docker ps | grep engracedsmile-pwa-site`

### Container Unhealthy
Check logs: `docker logs engracedsmile-pwa-site`

### Changes Not Showing
Rebuild: `cd /root/engracedsmile && docker-compose down && docker-compose up -d --build`

## Files Updated

- ✅ `/root/engracedsmile/docker-compose.yml` - Changed port to 8085, fixed health check
- ✅ `/etc/nginx/snippets/engracedsmile-locations.conf` - Updated proxy to port 8085
- ✅ Container deployed and healthy
- ✅ Nginx configured and reloaded

---
For detailed information, see DEPLOYMENT_SUMMARY.md

