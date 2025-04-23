# Themis Deployment Checklist

Use this checklist to track the deployment progress and ensure nothing is missed.

## Pre-Deployment

- [ ] Server provisioned with at least 2 CPU cores and 4GB RAM
- [ ] Domain/subdomain configured to point to server IP
- [ ] SSH access configured
- [ ] Firewall configured to allow SSH (port 22)

## Base Installation

- [ ] Server updated with latest packages
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- [ ] Git installed
  ```bash
  sudo apt install -y git
  ```
- [ ] Repository cloned
  ```bash
  git clone https://your-repository-url.git /opt/themis
  ```
- [ ] Deployment scripts made executable
  ```bash
  cd /opt/themis/deployment
  chmod +x *.sh
  ```

## Database Setup

- [ ] PostgreSQL installed
  ```bash
  ./install_postgres.sh
  ```
- [ ] Database created
  ```bash
  ./setup_database.sh
  ```
- [ ] Admin user created
  ```bash
  ./create_admin_user.sh
  ```
- [ ] Backup script set up
  ```bash
  chmod +x backup_db.sh
  ```

## Node.js Environment

- [ ] Node.js and npm installed
  ```bash
  ./setup_nodejs.sh
  ```
- [ ] Environment variables configured (check .env file)
- [ ] PM2 installed
  ```bash
  sudo npm install -g pm2
  ```

## Web Server Setup

- [ ] Nginx installed and configured
  ```bash
  ./setup_nginx.sh
  ```
- [ ] Server name updated in configuration
  ```bash
  sudo nano /etc/nginx/sites-available/themis
  ```
- [ ] SSL certificate obtained and configured
  ```bash
  sudo certbot --nginx -d your-domain.com
  ```
- [ ] Nginx restarted
  ```bash
  sudo systemctl restart nginx
  ```

## Application Deployment

- [ ] Frontend built
  ```bash
  cd /opt/themis/themis-client
  npm install
  npm run build
  ```
- [ ] Backend dependencies installed
  ```bash
  cd /opt/themis/server
  npm install
  npm install knex pg dotenv
  npm install --save-dev @types/node @types/pg
  ```
- [ ] Backend built
  ```bash
  npm run build
  ```
- [ ] Application started with PM2
  ```bash
  pm2 start dist/index.js --name themis
  pm2 save
  pm2 startup
  ```

## Post-Deployment Verification

- [ ] Application accessible via https://your-domain.com
- [ ] Login works with admin user
- [ ] All features tested and working correctly
- [ ] Logs checked for errors
  ```bash
  pm2 logs themis
  ```

## Security Hardening

- [ ] Default admin password changed
- [ ] JWT secret updated to a strong random value
- [ ] Firewall configured
  ```bash
  sudo ufw allow ssh
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```
- [ ] Database backups scheduled
  ```bash
  sudo crontab -e
  # Add: 0 2 * * * /opt/themis/deployment/backup_db.sh
  ```

## Monitoring and Maintenance

- [ ] PM2 monitoring set up
  ```bash
  pm2 install pm2-logrotate
  ```
- [ ] System monitoring configured (optional)
  ```bash
  # Install monitoring tool of your choice
  # Example: Install Netdata
  bash <(curl -Ss https://my-netdata.io/kickstart.sh)
  ```
- [ ] Update procedure documented and tested

## Documentation

- [ ] Admin credentials securely shared with administrators
- [ ] Deployment documentation finalized
- [ ] Maintenance procedures documented 