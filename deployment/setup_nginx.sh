#!/bin/bash
# Nginx setup script for Themis

# Install Nginx
sudo apt update
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create necessary directories
sudo mkdir -p /var/www/themis/build/static
sudo mkdir -p /var/www/themis/uploads
sudo chmod -R 755 /var/www/themis

# Create custom Nginx log directory if it doesn't exist
sudo mkdir -p /var/log/nginx

# Copy the custom Nginx configuration from the deployment directory
if [ -f "$(dirname "$0")/config/nginx.conf" ]; then
  sudo cp "$(dirname "$0")/config/nginx.conf" /etc/nginx/sites-available/themis
else
  # Create Nginx configuration for Themis
  sudo cat > /etc/nginx/sites-available/themis << EOF
server {
    listen 80;
    server_name pmo.projects.mod.qa;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static assets could be served directly by Nginx for better performance
    location /static {
        alias /var/www/themis/build/static;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOF
fi

# Enable the site if not already enabled
if [ ! -f /etc/nginx/sites-enabled/themis ]; then
  sudo ln -s /etc/nginx/sites-available/themis /etc/nginx/sites-enabled/
fi

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
  sudo rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start at boot
sudo systemctl enable nginx

echo "Nginx configured successfully!"
echo "Next steps:"
echo "1. Run: sudo certbot --nginx -d pmo.projects.mod.qa to install SSL certificate" 