#!/bin/bash

echo "🔧 Installing ticket download dependencies..."

# Install the missing dependencies
npm install html-to-image@^1.11.11 jspdf@^2.5.2

echo "✅ Dependencies installed successfully!"
echo "📦 Dependencies added:"
echo "  - html-to-image: For converting ticket to image"
echo "  - jspdf: For creating PDF files"
echo ""
echo "🚀 You can now rebuild your Docker container:"
echo "   docker-compose down && docker-compose build --no-cache && docker-compose up -d"
echo ""
echo "🎫 After rebuild, the 'Download Your Ticket' button should work!"
