# 🚀 Start Digital Soko Servers

## Quick Start Commands

### Terminal 1 - Backend Server
```bash
cd /home/vincent/Digital-Soko/Backend
npm run dev
```
**Expected Output:**
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-shard-00-xx.l95wc.mongodb.net
```

### Terminal 2 - Frontend Server
```bash
cd /home/vincent/Digital-Soko
python3 -m http.server 3000
```
**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...
```

---

## 🧪 Test Everything Works

### 1. Test Backend Connection
Open in browser: http://localhost:3000/test-backend.html

**Should show:**
- ✅ Backend Connected
- ✅ Login works with admin@digitalsoko.com / admin123
- ✅ 12 products loaded
- ✅ 5 trades loaded

### 2. Test Marketplace Loading
Open in browser: http://localhost:3000/test-marketplace.html

**Should show:**
- ✅ Backend Connected
- ✅ Click "Load Products" → See 12 products with images

### 3. Test Real Marketplace
Open in browser: http://localhost:3000/marketplace.html

**Should show:**
- ✅ 12 products in grid
- ✅ MacBook Pro, iPhone, Samsung, etc.
- ✅ Real images from Unsplash
- ✅ Trade Now buttons work

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@digitalsoko.com | admin123 |
| Seller | john@example.com | password123 |
| Customer | jane@example.com | password123 |

---

## 📊 Seeded Data

- **5 Users** (1 admin, 2 sellers, 2 customers)
- **12 Products** (Total value: Ksh 726,000)
- **5 Trades** (2 approved, 1 rejected, 2 pending)

---

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
# Check if MongoDB is connected
cat Backend/.env | grep MONGODB_URI

# Check if port 5000 is in use
lsof -i :5000
```

### Frontend Not Loading Products?
1. **Check backend is running:** http://localhost:5000/health
2. **Check browser console:** Press F12 → Console tab
3. **Check CORS:** Make sure you're accessing via http://localhost:3000 (not file://)

### Products Still Not Loading?
```bash
# Re-seed the database
cd Backend
npm run seed

# Restart backend
npm run dev
```

---

## 📁 Important Files

### Frontend
- `marketplace.html` - Marketplace page
- `marketplace.js` - Marketplace logic (loads from API)
- `dashboard.html` - User dashboard
- `login.html` - Login page (uses API)
- `js/api.js` - API client

### Backend
- `src/server.js` - Server entry point
- `src/models/Trade.js` - Trade model with fairness calculation
- `src/controllers/tradeController.js` - Trade API endpoints
- `src/seed.js` - Database seeding script

### Test Pages
- `test-backend.html` - Test API connection
- `test-marketplace.html` - Test marketplace loading

---

## ✅ Checklist

Before testing, ensure:
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected (check backend logs)
- [ ] Database seeded (12 products should exist)
- [ ] Accessing via http://localhost:3000 (not file://)

---

## 🎯 URLs

- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs
- **Frontend:** http://localhost:3000
- **Test Backend:** http://localhost:3000/test-backend.html
- **Test Marketplace:** http://localhost:3000/test-marketplace.html
- **Marketplace:** http://localhost:3000/marketplace.html
- **Login:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000/dashboard.html
- **Admin Panel:** http://localhost:3000/admin-dashboard.html
