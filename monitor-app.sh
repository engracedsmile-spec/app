#!/bin/bash

# Engraced App Container Monitoring Script
# This script helps monitor and manage the application container

CONTAINER_NAME="engraced-app-container"
APP_URL="https://app.engracedsmile.com"

echo "=== Engraced App Container Status ==="
echo "Date: $(date)"
echo ""

# Check container status
echo "Container Status:"
docker ps -a | grep $CONTAINER_NAME
echo ""

# Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Container is running"
    
    # Check application health
    echo ""
    echo "Application Health Check:"
    if curl -s -f $APP_URL/health > /dev/null; then
        echo "✅ Application is responding"
    else
        echo "❌ Application is not responding"
    fi
    
    # Check HTTPS access
    echo ""
    echo "HTTPS Access Test:"
    if curl -s -f -I $APP_URL | grep -q "HTTP/2 200"; then
        echo "✅ HTTPS access is working"
    else
        echo "❌ HTTPS access failed"
    fi
    
    # Show recent logs
    echo ""
    echo "Recent Container Logs (last 10 lines):"
    docker logs $CONTAINER_NAME --tail 10
    echo ""
    
    # Show resource usage
    echo "Container Resource Usage:"
    docker stats $CONTAINER_NAME --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
else
    echo "❌ Container is not running"
    echo ""
    echo "To start the container, run:"
    echo "docker start $CONTAINER_NAME"
    echo ""
    echo "To restart the container, run:"
    echo "docker restart $CONTAINER_NAME"
fi

echo ""
echo "=== Management Commands ==="
echo "View logs: docker logs $CONTAINER_NAME -f"
echo "Restart: docker restart $CONTAINER_NAME"
echo "Stop: docker stop $CONTAINER_NAME"
echo "Start: docker start $CONTAINER_NAME"
echo "Remove: docker rm -f $CONTAINER_NAME"
echo "Rebuild: docker build -t engraced-app:latest . && docker restart $CONTAINER_NAME"
