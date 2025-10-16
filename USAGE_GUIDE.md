# Engracedsmile PWA - Usage Guide

## ✅ Using /root/engracedsmile/docker-compose.yml

This directory contains the **standalone PWA site** docker-compose configuration.

## Quick Commands

### Start the PWA Container
```bash
cd /root/engracedsmile
docker-compose up -d
```

### Stop the PWA Container
```bash
cd /root/engracedsmile
docker-compose down
```

### Restart the PWA Container
```bash
cd /root/engracedsmile
docker-compose restart
```

### View Container Status
```bash
cd /root/engracedsmile
docker-compose ps
```

### View Logs
```bash
cd /root/engracedsmile
docker-compose logs -f
```

### Rebuild and Restart
```bash
cd /root/engracedsmile
docker-compose down
docker-compose up -d --build
```

## Container Details

- **Container Name**: `engracedsmile-pwa-site`
- **Port**: 8085 (host) → 80 (container)
- **Live URL**: https://engracedsmile.com
- **Status**: Running & Healthy ✅

## File Structure

```
/root/engracedsmile/
├── docker-compose.yml          ← YOU ARE USING THIS
├── Dockerfile
├── index.html
├── manifest.json
├── sw.js
├── icon.png
├── browserconfig.xml
└── other PWA files
```

## Health Check

The container has an automatic health check:
- Checks every 30 seconds
- Tests: `wget http://127.0.0.1:80/`
- Status shows as "healthy" when working

## Testing

### Test Container Directly
```bash
curl -I http://localhost:8085
```

### Test Through Nginx (Live Site)
```bash
curl -H "Host: engracedsmile.com" -H "CF-Connecting-IP: 1.2.3.4" http://localhost/
```

## Auto-Start on Boot

The container will automatically restart:
- ✅ If it crashes
- ✅ When the server reboots (if Docker is enabled)

To ensure Docker starts on boot:
```bash
systemctl enable docker
```

## Updating the Site

1. **Edit your files** in `/root/engracedsmile/`
2. **Rebuild the container**:
   ```bash
   cd /root/engracedsmile
   docker-compose down
   docker-compose up -d --build
   ```

## Common Operations

### Check if Running
```bash
cd /root/engracedsmile
docker-compose ps
# or
docker ps | grep engracedsmile-pwa-site
```

### View Recent Logs
```bash
cd /root/engracedsmile
docker-compose logs --tail=50
```

### Follow Logs in Real-Time
```bash
cd /root/engracedsmile
docker-compose logs -f
```

### Execute Commands Inside Container
```bash
docker exec -it engracedsmile-pwa-site sh
```

## Troubleshooting

### Container Not Starting?
```bash
cd /root/engracedsmile
docker-compose logs
```

### Port 8085 Already in Use?
```bash
# Check what's using the port
netstat -tlnp | grep 8085
# or
lsof -i :8085
```

### Health Check Failing?
```bash
# Check the health check directly
docker exec engracedsmile-pwa-site wget --spider http://127.0.0.1:80/
```

### Site Not Loading?
1. Check container status: `docker ps`
2. Check nginx status: `systemctl status nginx`
3. Check nginx logs: `tail -f /var/log/nginx/error.log`

## Important Notes

- **Working Directory**: Always run commands from `/root/engracedsmile/`
- **Port**: The container uses port 8085 (not 8080 or 3000)
- **Nginx**: Configured to proxy https://engracedsmile.com to port 8085
- **Network**: Creates its own Docker network `engracedsmile_default`

## Quick Reference Card

```bash
# Everything you need to know:
cd /root/engracedsmile    # Go to directory
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose restart    # Restart
docker-compose ps         # Status
docker-compose logs -f    # Watch logs
```

---

## Current Status

✅ Container: `engracedsmile-pwa-site`  
✅ Port: `8085`  
✅ Status: `Healthy`  
✅ URL: `https://engracedsmile.com`  

**Your PWA is live and working!** 🎉

---
Last Updated: October 12, 2025

