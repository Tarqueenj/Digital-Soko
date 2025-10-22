# Deployment Guide

This guide covers deploying the eCommerce backend to various cloud platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Cloudinary Setup](#cloudinary-setup)
- [Stripe Setup](#stripe-setup)
- [Deploy to Render](#deploy-to-render)
- [Deploy to Railway](#deploy-to-railway)
- [Deploy to Heroku](#deploy-to-heroku)
- [Deploy to AWS EC2](#deploy-to-aws-ec2)
- [Post-Deployment](#post-deployment)

## Prerequisites

Before deploying, ensure you have:
- GitHub repository with your code
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- Stripe account (test mode)
- Email service credentials (Gmail, SendGrid, etc.)

## MongoDB Atlas Setup

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select your preferred region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this as your `MONGODB_URI`

## Cloudinary Setup

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret
   - Use these in your environment variables

## Stripe Setup

1. **Create Account**
   - Go to [Stripe](https://stripe.com/)
   - Sign up for account

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy:
     - Publishable key
     - Secret key
   - Use test keys for development

3. **Set up Webhooks** (Optional)
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
   - Select events to listen to
   - Copy webhook secret

## Deploy to Render

### Step 1: Prepare Repository
Ensure your code is pushed to GitHub.

### Step 2: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ecommerce-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables

Add these in the "Environment" section:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=another_random_string
JWT_REFRESH_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
```

### Step 4: Deploy

Click "Create Web Service" and wait for deployment to complete.

Your API will be available at: `https://your-service-name.onrender.com`

## Deploy to Railway

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
railway init
```

### Step 4: Add MongoDB

```bash
railway add
# Select MongoDB
```

### Step 5: Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret
railway variables set CLOUDINARY_CLOUD_NAME=your_cloud
# ... add all other variables
```

Or use the Railway dashboard to add variables.

### Step 6: Deploy

```bash
railway up
```

Your API will be available at the provided Railway URL.

## Deploy to Heroku

### Step 1: Install Heroku CLI

Download from [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
heroku create your-app-name
```

### Step 4: Add MongoDB

```bash
heroku addons:create mongolab:sandbox
```

Or use MongoDB Atlas and set `MONGODB_URI` manually.

### Step 5: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud
# ... add all other variables
```

### Step 6: Deploy

```bash
git push heroku main
```

### Step 7: Open App

```bash
heroku open
```

## Deploy to AWS EC2

### Step 1: Launch EC2 Instance

1. Go to AWS Console > EC2
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS
4. Select t2.micro (free tier)
5. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (5000) - Anywhere
6. Launch and download key pair

### Step 2: Connect to Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y git
```

### Step 4: Clone Repository

```bash
git clone https://github.com/yourusername/ecommerce-backend.git
cd ecommerce-backend
npm install
```

### Step 5: Set Environment Variables

```bash
nano .env
# Add all your environment variables
```

### Step 6: Install PM2

```bash
sudo npm install -g pm2
```

### Step 7: Start Application

```bash
pm2 start src/server.js --name ecommerce-api
pm2 startup
pm2 save
```

### Step 8: Configure Nginx (Optional)

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

## Post-Deployment

### 1. Test API

```bash
curl https://your-api-url.com/health
```

### 2. Check Logs

**Render**: View logs in dashboard
**Railway**: `railway logs`
**Heroku**: `heroku logs --tail`
**AWS**: `pm2 logs`

### 3. Set up SSL (Production)

For custom domains, use:
- **Render**: Automatic SSL
- **Railway**: Automatic SSL
- **Heroku**: Automatic SSL
- **AWS**: Use Let's Encrypt with Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Monitor Application

- Set up error tracking (Sentry)
- Configure uptime monitoring (UptimeRobot)
- Enable application metrics

### 5. Update CORS

Update `FRONTEND_URL` in environment variables to your actual frontend URL.

### 6. Test Payment Integration

- Update Stripe webhook URL
- Test payment flow
- Switch to live keys when ready

## Troubleshooting

### Common Issues

**Port Issues**
- Ensure `PORT` environment variable is set
- Use `process.env.PORT || 5000`

**Database Connection**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

**File Upload Issues**
- Verify Cloudinary credentials
- Check file size limits
- Ensure upload directory exists

**Email Not Sending**
- For Gmail, use App Passwords
- Check SMTP settings
- Verify firewall rules

### Health Check

Create a simple health check endpoint (already included):

```javascript
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple instances
- Implement session management (Redis)

### Database Scaling
- Use MongoDB Atlas auto-scaling
- Implement database indexing
- Consider read replicas

### Caching
- Implement Redis for caching
- Cache frequently accessed data
- Use CDN for static assets

### Monitoring
- Set up application monitoring (New Relic, DataDog)
- Configure alerts for errors
- Track performance metrics

---

**Need Help?** Open an issue on GitHub or contact support.
