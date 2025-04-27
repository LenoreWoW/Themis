# Themis Deployment Checklist

Use this checklist to ensure a successful deployment of the Themis Project Management System. Check off each item as you complete it.

## Pre-Deployment Preparation

- [ ] Server requirements confirmed (2+ CPU cores, 4GB+ RAM, 20GB+ storage)
- [ ] Domain name configured to point to server IP address
- [ ] SSH access to server verified
- [ ] Required ports opened (80, 443, 22)
- [ ] Latest code pulled from repository
- [ ] Configuration values prepared:
  - [ ] Database credentials
  - [ ] JWT secret key
  - [ ] SMTP settings (if email notifications enabled)

## Deployment Process

### 1. Initial Setup
- [ ] Server updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Basic dependencies installed (`git`, `curl`, etc.)
- [ ] Repository cloned to `/opt/themis`
- [ ] Deployment scripts made executable

### 2. Main Deployment
- [ ] Run main deployment script (`sudo ./deployment/deploy_themis.sh`)
- [ ] Environment variables configured in `.env` file
- [ ] Database setup completed successfully
- [ ] Nginx web server configured
- [ ] API service set up

### 3. Frontend Deployment
- [ ] API URL configured in `config.ts`
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend built successfully (`npm run build`)
- [ ] Built files copied to web server directory

### 4. Backend Deployment
- [ ] Dependencies restored (`dotnet restore`)
- [ ] Backend built successfully (`dotnet build`)
- [ ] API service installed and started
- [ ] API health check endpoint verified

### 5. SSL/TLS Setup
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Nginx configured to use HTTPS
- [ ] HTTP to HTTPS redirect configured

## Post-Deployment Verification

### 1. Access Check
- [ ] Frontend accessible via domain name (https://your-domain.com)
- [ ] API endpoints accessible (https://your-domain.com/api/health)
- [ ] Successfully logged in with admin account
- [ ] Changed admin account default password

### 2. Functionality Check
- [ ] User creation works
- [ ] Project creation works
- [ ] Task management works
- [ ] Database persistence confirmed (data remains after restart)

### 3. Security Check
- [ ] Admin password changed from default
- [ ] JWT secret key changed from default
- [ ] Firewall enabled and configured
- [ ] Sensitive files and directories have proper permissions

### 4. System Check
- [ ] All services running (check `systemctl status`)
  - [ ] Nginx (`systemctl status nginx`)
  - [ ] PostgreSQL (`systemctl status postgresql`)
  - [ ] API service (`systemctl status themis-api`)
- [ ] Memory usage acceptable
- [ ] CPU usage acceptable
- [ ] Disk space sufficient

### 5. Backup and Recovery
- [ ] Database backup procedure tested
- [ ] Backup script scheduled via cron
- [ ] Restore procedure documented

## Common Issues and Solutions

- **Problem**: Frontend displays network error
  - **Solution**: Check API service is running (`systemctl status themis-api`)

- **Problem**: API can't connect to database
  - **Solution**: Check database credentials in `.env` file and verify PostgreSQL is running

- **Problem**: SSL certificate errors
  - **Solution**: Run `sudo certbot --nginx -d your-domain.com` again

- **Problem**: Missing permissions for file uploads
  - **Solution**: Check directory permissions (`chmod -R 755 /var/www/themis/uploads`)

## Contact Information

If you encounter issues not covered in this checklist or the README:

- Development Team: team@themis-support.com
- DevOps Support: devops@themis-support.com
- Emergency Contact: on-call@themis-support.com 