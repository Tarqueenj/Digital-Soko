# Quick Start Guide

Get your eCommerce backend up and running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed

## Installation Steps

### 1. Clone & Install

```bash
cd ecommerce-backend
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with minimum required settings:

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure

# Optional (for full features)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Start MongoDB (if using local)

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost
API Documentation: http://localhost:5000/api-docs
```

### 5. Test the API

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Quick Test with Postman

### 1. Import Collection

- Open Postman
- Click "Import"
- Select `postman_collection.json` from the project root
- Collection will be imported with all endpoints

### 2. Set Base URL

- Click on the collection
- Go to Variables tab
- Set `baseUrl` to `http://localhost:5000/api/v1`

### 3. Test Authentication

1. **Register a User**
   - Open "Authentication" → "Register User"
   - Click "Send"
   - Token will be automatically saved

2. **Login**
   - Open "Authentication" → "Login User"
   - Click "Send"
   - Token will be automatically saved

3. **Get Profile**
   - Open "Authentication" → "Get Current User"
   - Click "Send"
   - You should see your user profile

## Quick Test with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Copy the token from the response.

### Create Product (Seller/Admin)

First, register as a seller:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Seller",
    "lastName": "User",
    "email": "seller@example.com",
    "password": "password123",
    "role": "seller"
  }'
```

Then create a product:

```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 10
  }'
```

### Get All Products

```bash
curl http://localhost:5000/api/v1/products
```

## View API Documentation

Open your browser and navigate to:

```
http://localhost:5000/api-docs
```

This will show you:
- All available endpoints
- Request/response formats
- Authentication requirements
- Try out features directly in the browser

## Common Issues & Solutions

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For local: `mongodb://localhost:27017/ecommerce`
- For Atlas: Use your connection string

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Change PORT in .env to a different number
PORT=5001
```

Or kill the process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### JWT Secret Warning

**Warning:** Using default JWT secret

**Solution:**
Generate a secure random string:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use any long random string
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Email Not Sending

**Issue:** Emails not being sent

**Solution:**
- For Gmail, use App Passwords (not your regular password)
- Go to Google Account → Security → App Passwords
- Generate a new app password
- Use that in `EMAIL_PASSWORD`

## Next Steps

### 1. Set Up Cloudinary (for image uploads)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get credentials from dashboard
4. Add to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Set Up Stripe (for payments)

1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Get test API keys
4. Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### 3. Configure Email

For Gmail:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Test All Features

Use the Postman collection to test:
- ✅ Authentication (register, login, profile)
- ✅ Products (CRUD operations)
- ✅ Cart (add, update, remove items)
- ✅ Orders (create, view, cancel)
- ✅ Reviews (create, update, delete)
- ✅ Wishlist (add, remove items)

### 5. Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- Render
- Railway
- Heroku
- AWS EC2

## Development Tips

### Auto-restart on Changes

The project uses `nodemon` for auto-restart:

```bash
npm run dev
```

### View Logs

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Errors only

### Run Tests

```bash
npm test
```

### Check Code Quality

```bash
npm run lint
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get profile

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add to cart
- `PUT /api/v1/cart/items/:id` - Update item
- `DELETE /api/v1/cart/items/:id` - Remove item

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Get order
- `PUT /api/v1/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/v1/products/:id/reviews` - Get reviews
- `POST /api/v1/products/:id/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Wishlist
- `GET /api/v1/wishlist` - Get wishlist
- `POST /api/v1/wishlist/:productId` - Add to wishlist
- `DELETE /api/v1/wishlist/:productId` - Remove from wishlist

## Need Help?

- 📖 Read [README.md](README.md) for detailed documentation
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- 📝 See [API_EXAMPLES.md](API_EXAMPLES.md) for request/response examples
- 🐛 Open an issue on GitHub for bugs
- 💬 Start a discussion for questions

---

**Happy Coding! 🎉**
