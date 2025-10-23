# 🚀 Quick Start Guide - Digital Soko

## Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

---

## 🏃 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required settings:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-soko
JWT_SECRET=your_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# If using system MongoDB
sudo systemctl start mongodb

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database with Sample Data
```bash
npm run seed
```

**This creates:**
- ✅ 5 users (1 admin, 2 sellers, 2 customers)
- ✅ 12 products across multiple categories
- ✅ 5 sample trades (pending, approved, rejected)
- ✅ Realistic test data with images

### 5. Start Backend Server
```bash
npm run dev
```

Server runs at: **http://localhost:5000**

---

## 🔐 Test Credentials

### Admin Account
```
Email: admin@digitalsoko.com
Password: admin123
```

### Seller Account
```
Email: john@example.com
Password: password123
```

### Customer Account
```
Email: jane@example.com
Password: password123
```

---

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@digitalsoko.com",
    "password": "admin123"
  }'
```

**Copy the token from response!**

### 3. Get All Products
```bash
curl http://localhost:5000/api/v1/products
```

### 4. Get All Trades (with auth)
```bash
curl http://localhost:5000/api/v1/trades \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Trade Statistics (Admin only)
```bash
curl http://localhost:5000/api/v1/trades/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## 🌐 Frontend Setup

### 1. Open Frontend
```bash
# From project root
cd ..
# Open any HTML file in browser
open dashboard.html
# or
python3 -m http.server 3000
```

### 2. Include API Client
Add to your HTML files:
```html
<script src="js/api.js"></script>
```

### 3. Test API Connection
Open browser console and run:
```javascript
// Login
const response = await authAPI.login({
  email: 'admin@digitalsoko.com',
  password: 'admin123'
});

console.log('Token:', response.token);

// Get products
const products = await productsAPI.getAll();
console.log('Products:', products.data);

// Get trades
const trades = await tradesAPI.getAll();
console.log('Trades:', trades.data);
```

---

## 📊 Sample Data Overview

### Users Created
| Role | Name | Email | Password |
|------|------|-------|----------|
| Admin | Admin User | admin@digitalsoko.com | admin123 |
| Seller | John Seller | john@example.com | password123 |
| Seller | Mike Trader | mike@example.com | password123 |
| Customer | Jane Buyer | jane@example.com | password123 |
| Customer | Sarah Customer | sarah@example.com | password123 |

### Products Created (12 items)
- **MacBook Pro 16"** - Ksh 180,000 (TopUp)
- **iPhone 14 Pro Max** - Ksh 120,000 (FullAmount)
- **Samsung Galaxy S23 Ultra** - Ksh 95,000 (Barter)
- **Sony Headphones** - Ksh 28,000 (TopUp)
- **iPad Air** - Ksh 55,000 (Barter)
- **Office Desk** - Ksh 25,000 (FullAmount)
- **Office Chair** - Ksh 18,000 (TopUp)
- **Mountain Bike** - Ksh 45,000 (Barter)
- **PlayStation 5** - Ksh 65,000 (TopUp)
- **Nike Air Jordan** - Ksh 15,000 (Barter)
- **Coffee Machine** - Ksh 32,000 (FullAmount)
- **Smart TV 55"** - Ksh 48,000 (TopUp)

### Trades Created (5 trades)
1. **Approved** - iPhone ← iPad + Ksh 65,000 (Fair trade, 100% fairness)
2. **Approved** - Office Desk ← Ksh 25,000 (Money only, perfect match)
3. **Rejected** - MacBook ← Sneakers (Unfair, 91.7% difference) ⚠️
4. **Pending** - PS5 ← Headphones + Ksh 37,000 (Fair, 100% fairness)
5. **Pending** - Mountain Bike ← Coffee Machine + Ksh 13,000 (Fair, 100% fairness)

---

## 🎯 What to Test

### User Flow
1. ✅ Register new user
2. ✅ Login and get JWT token
3. ✅ View all products
4. ✅ Create a product (as seller)
5. ✅ Create a trade request
6. ✅ View trade with fairness score

### Admin Flow
1. ✅ Login as admin
2. ✅ View all trades
3. ✅ See flagged trades (>30% difference)
4. ✅ Approve fair trades
5. ✅ Reject unfair trades with reason
6. ✅ View trade statistics

### Trade Scenarios
1. **Fair Barter** - Similar value items
2. **Money Only** - Cash payment
3. **Barter + Money** - Item + top-up cash
4. **Unfair Trade** - Large price difference (gets flagged)

---

## 🔍 API Documentation

Once server is running, visit:
```
http://localhost:5000/api-docs
```

Interactive Swagger documentation with all endpoints!

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Or check Docker container
docker ps | grep mongodb

# Start MongoDB
sudo systemctl start mongodb
# OR
docker start mongodb
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Seed Script Fails
```bash
# Clear database manually
mongosh digital-soko --eval "db.dropDatabase()"

# Run seed again
npm run seed
```

### JWT Token Expired
```javascript
// Login again to get fresh token
const response = await authAPI.login({
  email: 'admin@digitalsoko.com',
  password: 'admin123'
});
```

---

## 📝 Next Steps

1. **Explore API** - Test all endpoints with Postman or curl
2. **Integrate Frontend** - Connect HTML pages to API
3. **Create Trades** - Test the complete trade flow
4. **Admin Dashboard** - Monitor trades and approve/reject
5. **Customize** - Add your own products and users

---

## 🎓 Learn More

- **Backend Integration Guide**: `BACKEND_INTEGRATION_GUIDE.md`
- **Trade System Guide**: `TRADE_SYSTEM_GUIDE.md`
- **Backend README**: `Backend/README.md`
- **API Documentation**: http://localhost:5000/api-docs

---

## 🆘 Need Help?

Check the documentation files or review the sample data created by the seed script.

**Happy Trading! 🎉**
