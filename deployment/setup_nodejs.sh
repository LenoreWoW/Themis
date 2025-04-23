#!/bin/bash
# Node.js environment setup script

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Check installed versions
node -v
npm -v

# Install global npm packages
sudo npm install -g pm2

# Create .env file for backend configuration
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=themis_db
DB_USER=themis_user
DB_PASSWORD=strong_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=8h

# Server Configuration
PORT=3000
NODE_ENV=production
EOF

echo "Node.js environment configured successfully!" 