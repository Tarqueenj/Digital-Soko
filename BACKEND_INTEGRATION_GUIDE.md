# Backend Integration Guide

## 🎯 Overview

The Digital Soko backend has been enhanced with a complete **Trade/Barter API** that integrates with the frontend trade system.

---

## 🏗️ Backend Architecture

### New Components Added

1. **Trade Model** (`/Backend/src/models/Trade.js`)
   - Complete trade data structure
   - Automatic fairness calculation
   - Status management
   - Audit trail support

2. **Trade Controller** (`/Backend/src/controllers/tradeController.js`)
   - Create trade requests
   - Approve/reject trades (Admin)
   - Complete/cancel trades
   - Get trade statistics

3. **Trade Routes** (`/Backend/src/routes/tradeRoutes.js`)
   - RESTful API endpoints
   - Authentication & authorization
   - Input validation

4. **Updated Product Model**
   - Added `condition` field (New, Like New, Used, Fair)
   - Added `tradeType` field (FullAmount, TopUp, Barter)
   - Added Furniture category

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Trade Endpoints

#### 1. Create Trade Request
```http
POST /api/v1/trades
Authorization: Bearer {token}
Content-Type: application/json

{
  "requestedItemId": "product_id",
  "offeredItemId": "product_id",  // Optional for MoneyOnly
  "tradeType": "BarterOnly|MoneyOnly|BarterPlusMoney",
  "moneyAmount": 5000  // Optional, required for MoneyOnly/BarterPlusMoney
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "trade_id",
    "requestedItem": {...},
    "offeredItem": {...},
    "tradeType": "BarterPlusMoney",
    "moneyAmount": 5000,
    "offeringValue": 35000,
    "requestingValue": 50000,
    "valueDifference": -15000,
    "fairnessScore": 70,
    "needsReview": false,
    "status": "Pending",
    "buyer": "user_id",
    "seller": "user_id"
  },
  "message": "Trade request created successfully"
}
```

#### 2. Get All Trades
```http
GET /api/v1/trades?status=Pending&needsReview=true
Authorization: Bearer {token}
```

**Admin sees all trades, users see only their trades**

#### 3. Get Single Trade
```http
GET /api/v1/trades/:id
Authorization: Bearer {token}
```

#### 4. Approve Trade (Admin Only)
```http
PUT /api/v1/trades/:id/approve
Authorization: Bearer {admin_token}
```

#### 5. Reject Trade (Admin Only)
```http
PUT /api/v1/trades/:id/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Price difference too large"
}
```

#### 6. Complete Trade (Seller)
```http
PUT /api/v1/trades/:id/complete
Authorization: Bearer {token}
```

#### 7. Cancel Trade (Buyer)
```http
PUT /api/v1/trades/:id/cancel
Authorization: Bearer {token}
```

#### 8. Delete Trade (Admin Only)
```http
DELETE /api/v1/trades/:id
Authorization: Bearer {admin_token}
```

#### 9. Get Trade Statistics (Admin Only)
```http
GET /api/v1/trades/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "_id": "Pending", "count": 5, "avgFairnessScore": 75.2 },
      { "_id": "Approved", "count": 10, "avgFairnessScore": 85.5 }
    ],
    "flaggedTrades": 2,
    "pendingTrades": 5
  }
}
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-soko
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# Using MongoDB service
sudo systemctl start mongodb

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: `http://localhost:5000`

### 5. Test API
```bash
# Health check
curl http://localhost:5000/health

# API Documentation
open http://localhost:5000/api-docs
```

---

## 🌐 Frontend Integration

### 1. Include API Client
Add to your HTML files:
```html
<script src="js/api.js"></script>
```

### 2. Use API in JavaScript

#### Authentication
```javascript
// Register
const user = await authAPI.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'customer'
});

// Login
const response = await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
});

// Store token
api.setToken(response.token);
```

#### Create Product
```javascript
const product = await productsAPI.create({
  name: 'Gaming Laptop',
  description: 'High-performance laptop',
  price: 50000,
  category: 'Electronics',
  condition: 'Like New',
  tradeType: 'TopUp',
  stock: 1
});
```

#### Create Trade Request
```javascript
const trade = await tradesAPI.create({
  requestedItemId: '507f1f77bcf86cd799439011',
  offeredItemId: '507f1f77bcf86cd799439012',
  tradeType: 'BarterPlusMoney',
  moneyAmount: 10000
});

console.log(`Fairness Score: ${trade.data.fairnessScore}%`);
console.log(`Needs Review: ${trade.data.needsReview}`);
```

#### Admin: Approve Trade
```javascript
// Check if needs review
if (trade.needsReview) {
  const confirm = window.confirm(
    `Warning: ${trade.fairnessScore}% fairness score. Approve anyway?`
  );
  if (!confirm) return;
}

await tradesAPI.approve(tradeId);
```

---

## 🔄 Migration from localStorage to API

### Current (localStorage)
```javascript
// Old way
const items = JSON.parse(localStorage.getItem('myItems')) || [];
items.push(newItem);
localStorage.setItem('myItems', JSON.stringify(items));
```

### New (API)
```javascript
// New way
const response = await productsAPI.create(newItem);
const item = response.data;
```

### Migration Steps

1. **Replace item storage:**
   - Change `localStorage.setItem('myItems')` → `productsAPI.create()`
   - Change `localStorage.getItem('myItems')` → `productsAPI.getAll()`

2. **Replace trade storage:**
   - Change `localStorage.setItem('trades')` → `tradesAPI.create()`
   - Change `localStorage.getItem('trades')` → `tradesAPI.getAll()`

3. **Add authentication:**
   - Implement login/register flows
   - Store JWT token
   - Include token in API requests

---

## 🛡️ Security Features

### 1. Authentication
- JWT-based authentication
- Token expiration (30 days default)
- Secure password hashing (bcrypt)

### 2. Authorization
- Role-based access control (Admin, Seller, Customer)
- Route protection middleware
- Owner verification for trades

### 3. Validation
- Input validation with express-validator
- MongoDB injection prevention
- XSS protection
- Rate limiting

### 4. CORS
- Configured for frontend URL
- Credentials support
- Secure headers (Helmet)

---

## 📊 Database Schema

### Trade Collection
```javascript
{
  _id: ObjectId,
  requestedItem: {
    itemId: ObjectId (ref: Product),
    name: String,
    price: Number,
    image: String
  },
  offeredItem: {
    itemId: ObjectId (ref: Product),
    name: String,
    price: Number,
    image: String
  },
  buyer: ObjectId (ref: User),
  seller: ObjectId (ref: User),
  tradeType: String (enum),
  moneyAmount: Number,
  offeringValue: Number,
  requestingValue: Number,
  valueDifference: Number,
  fairnessScore: Number,
  needsReview: Boolean,
  status: String (enum),
  approvedBy: ObjectId (ref: User),
  approvedDate: Date,
  rejectedBy: ObjectId (ref: User),
  rejectedDate: Date,
  rejectionReason: String,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Manual Testing

1. **Start backend:**
```bash
cd Backend
npm run dev
```

2. **Test with curl:**
```bash
# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "seller"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Test with frontend:**
   - Open `dashboard.html` in browser
   - Open browser console
   - Test API calls:
```javascript
// Test connection
await authAPI.login({
  email: 'test@example.com',
  password: 'password123'
});

// Create product
await productsAPI.create({
  name: 'Test Item',
  description: 'Test',
  price: 10000,
  category: 'Electronics',
  condition: 'New',
  tradeType: 'Barter',
  stock: 1
});
```

### Automated Testing
```bash
# Run test suite
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to backend
**Solution:**
1. Check if backend is running: `curl http://localhost:5000/health`
2. Check MongoDB is running: `mongosh`
3. Verify CORS settings in `.env`

### Issue: 401 Unauthorized
**Solution:**
1. Check if token is set: `api.getToken()`
2. Login again to get fresh token
3. Verify token in localStorage

### Issue: Trade creation fails
**Solution:**
1. Ensure products exist in database
2. Verify user owns offered item
3. Check trade type matches requirements
4. Review validation errors in response

### Issue: CORS errors
**Solution:**
1. Update `FRONTEND_URL` in `.env`
2. Restart backend server
3. Clear browser cache

---

## 📚 Next Steps

1. **Implement Authentication UI**
   - Create login/register pages
   - Add token management
   - Implement protected routes

2. **Migrate Data**
   - Convert localStorage items to API
   - Sync existing trades
   - Update all CRUD operations

3. **Add Real-time Updates**
   - Implement WebSocket for trade notifications
   - Add push notifications
   - Real-time admin dashboard updates

4. **Deploy Backend**
   - Set up production MongoDB (Atlas)
   - Deploy to Heroku/Railway/Render
   - Configure environment variables
   - Set up SSL certificates

---

## 🔗 Resources

- **API Documentation:** http://localhost:5000/api-docs
- **Backend README:** `/Backend/README.md`
- **Trade System Guide:** `/TRADE_SYSTEM_GUIDE.md`
- **MongoDB Docs:** https://docs.mongodb.com
- **Express.js Docs:** https://expressjs.com

---

**Backend is ready! Start the server and begin integration.** 🚀
